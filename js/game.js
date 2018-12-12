class Game {
  constructor() {
    this.canvas = null;
    this._ctx = null;
    this._skier = null;
    this._obstacles = [];
    this.width = 0;
    this.height = 0;
  }

  createCanvas() {
    this.canvas = $('<canvas></canvas>')
        .attr('width', this.width * window.devicePixelRatio)
        .attr('height', this.height * window.devicePixelRatio)
        .css({
            width: this.width + 'px',
            height: this.height + 'px'
        });

    $('body').append(this.canvas);

    this._ctx = this.canvas[0].getContext('2d');
  };

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  };

  get ctx() {
    return this._ctx;
  }

  get skier() {
    return this._skier;
  }

  set skier(skier) {
    this._skier = skier;
  }

  get obstacles() {
    return this._obstacles;
  }

  addObstacle(obstacle) {
    this._obstacles.push(obstacle);
  }

  //Assets are provided by each individual Sprite class and placed into global queue.
  loadAssets() {
    var assetPromises = [];
    _.each(Assets, function (asset) {
        var assetImage = new Image();
        var assetDeferred = new $.Deferred();

        assetImage.onload = function() {
            assetImage.width /= 2;
            assetImage.height /= 2;

            asset.img = assetImage;
            assetDeferred.resolve();
        };
        assetImage.src = asset.src;

        assetPromises.push(assetDeferred.promise());
    });

    return $.when.apply($, assetPromises);
  };

  checkIfSkierHitObstacle() {
      var skierRect = this.skier.calcRect();

      var _this = this;
      var collision = _.find(this.obstacles, function (obstacle) {
          return _this.intersectRect(skierRect, obstacle.calcRect());
      });

      if (collision) {
        this.skier.direction = 0;
      }
  };

  intersectRect(r1, r2) {
      return !(r2.left > r1.right ||
          r2.right < r1.left ||
          r2.top > r1.bottom ||
          r2.bottom < r1.top);
  };

  placeRandomObstacle(minX, maxX, minY, maxY) {
      var position = this.calculateOpenPosition(minX, maxX, minY, maxY);
      this.addObstacle(new Obstacle(position.x, position.y, this));
  };

  createInitialObstacles() {
      var numberObstacles = Math.ceil(_.random(5, 7) * (this.width / 800) * (this.height / 500));

      var minX = -50;
      var maxX = this.width + 50;
      var minY = this.height / 2 + 100;
      var maxY = this.height + 50;

      for (var i = 0; i < numberObstacles; i++) {
        this.placeRandomObstacle(minX, maxX, minY, maxY);
      }
  };

  calculateOpenPosition(minX, maxX, minY, maxY) {
      var x = _.random(minX, maxX);
      var y = _.random(minY, maxY);

      var foundCollision = _.find(this.obstacles, function (obstacle) {
          return Math.abs(x - obstacle.x) < 50 && Math.abs(y - obstacle.y) < 50;
      });

      if (foundCollision) {
          return this.calculateOpenPosition(minX, maxX, minY, maxY);
      }
      else {
          return {
              x: x,
              y: y
          }
      }
  };

  placeNewObstacle(direction) {
      var shouldPlaceObstacle = _.random(1, 8);
      if (shouldPlaceObstacle !== 8) {
          return;
      }

      var leftEdge = this.skier.x;
      var rightEdge = this.skier.x + this.width;
      var topEdge = this.skier.y;
      var bottomEdge = this.skier.y + this.height;

      switch (direction) {
          case 1: // left
              this.placeRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge);
              break;
          case 2: // left down
              this.placeRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge);
              this.placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
              break;
          case 3: // down
              this.placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
              break;
          case 4: // right down
              this.placeRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge);
              this.placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
              break;
          case 5: // right
              this.placeRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge);
              break;
          case 6: // up
              this.placeRandomObstacle(leftEdge, rightEdge, topEdge - 50, topEdge);
              break;
      }
  };

  setupKeyhandler() {
      var _this = this;
      $(window).keydown(function (event) {
          switch (event.which) {
              case 37: // left
                  //Ensure skierDirection is set to LEFT if pressing left after a crash.
                  if (_this.skier.direction === 0) {
                    _this.skier.direction = 1;
                  }
                  else if (_this.skier.direction === 1) {
                      _this.skier.translate(-1 * _this.skier.speed, 0);
                      _this.placeNewObstacle(_this.skier.direction);
                  }
                  else {
                      _this.skier.direction -= 1;
                  }
                  event.preventDefault();
                  break;
              case 39: // right
                  //Ensure skier direction is set to RIGHT if pressing right after a crash.
                  if (_this.skier.direction === 0) {
                    _this.skier.direction = 5;
                  }
                  else if (_this.skier.direction === 5) {
                    _this.skier.translate(_this.skier.speed, 0);
                    _this.placeNewObstacle(_this.skier.direction);
                  }
                  else {
                    _this.skier.direction += 1;
                  }
                  event.preventDefault();
                  break;
              case 38: // up
                  if (_this.skier.direction === 1 || _this.skier.direction === 5) {
                      _this.skier.translate(0, -1 * _this.skier.speed);
                      _this.placeNewObstacle(6);
                  }
                  event.preventDefault();
                  break;
              case 40: // down
                  _this.skier.direction = 3;
                  event.preventDefault();
                  break;
          }
      });
  };

  gameLoop() {
      this.ctx.save();
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);  // Retina support
      this.clearCanvas();

      this.skier.move();
      this.checkIfSkierHitObstacle();

      //If the skier is not standing still, generate a new obstacle.
      if ([2, 3, 4].indexOf(this.skier.direction) !== -1) {
        this.placeNewObstacle(this.skier.direction);
      }

      //draw sprites
      this.skier.draw();
      _.each(this.obstacles, function (obstacle) {
        obstacle.draw();
      });

      this.ctx.restore();
      requestAnimationFrame(this.gameLoop.bind(this));
  };

  init() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.createCanvas();

    //Create initial sprites
    this.skier = new Skier(0, 0, this, 5, 8);
    this.createInitialObstacles();

    this.setupKeyhandler();

    var _this = this;
    this.loadAssets()
      .then(function() {
        requestAnimationFrame(_this.gameLoop.bind(_this));
    });
  };
}

$(document).ready(function() {
  var skiGame = new Game();
  skiGame.init();
});
