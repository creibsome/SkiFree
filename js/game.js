const skierBaseSpeed = 5;
const skierSpeedStep = 2500;
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

  set obstacles(obstacles) {
    this._obstacles = obstacles;
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

        this.ctx.font = "24px Serif";
        this.ctx.fillStyle = "Red";
        this.ctx.fillText("You have crashed! Press ENTER to try again.", 5, this.height - 40);

        var currentScore = this.calcScore();

        //Handle hiscore achievement
        if (currentScore > this.hiscore) {
          this.ctx.fillStyle = "Green";
          this.ctx.fillText("New Hiscore Achieved: " + currentScore, 5, this.height - 15);
          sessionStorage.setItem("hiscore", currentScore);
        }

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
        //Ignore directional endpoint if skier has crashed.
        //Only allow user to reset game on enter keypress
        if (_this.skier.direction === 0) {
          if (event.which === 13) {
            _this.createSprites();
          }
          return;
        }

        switch (event.which) {
            case 37: // left
            case 65: // A
                if (_this.skier.direction === 1) {
                    _this.skier.translate(-1 * _this.skier.speed, 0);
                    _this.placeNewObstacle(_this.skier.direction);
                }
                else {
                    _this.skier.direction -= 1;
                }
                event.preventDefault();
                break;
            case 39: // right
            case 68: // D
                if (_this.skier.direction === 5) {
                  _this.skier.translate(_this.skier.speed, 0);
                  _this.placeNewObstacle(_this.skier.direction);
                }
                else {
                  _this.skier.direction += 1;
                }
                event.preventDefault();
                break;
            case 38: // up
            case 87: // W
                if (_this.skier.direction === 1 || _this.skier.direction === 5) {
                    _this.skier.translate(0, -1 * _this.skier.speed);
                    _this.placeNewObstacle(6);
                }
                event.preventDefault();
                break;
            case 40: // down
            case 83: // S
                _this.skier.direction = 3;
                event.preventDefault();
                break;
        }
    });
  };

  //Calculate score as total units moved from start position
  calcScore() {
    return Math.round(Math.sqrt(Math.pow(this.skier.x, 2) + Math.pow(this.skier.y, 2)));
  }

  get hiscore() {
    return sessionStorage.getItem("hiscore") || 0;
  }

  drawScore() {
    this.ctx.font = "20px Serif";
    this.ctx.fillStyle = "Blue";
    this.ctx.fillText("Score: " + this.calcScore(), 10, 25);
    this.ctx.fillText("Hiscore: " + this.hiscore, 10, 45);
  };

  //Increase skier speed by 1 unit every 2500 points earned
  updateSkierSpeed() {
    this.skier.speed = skierBaseSpeed + Math.floor(this.calcScore() / skierSpeedStep);
  };

  gameLoop() {
    if (this.skier.direction !== 0) {
      this.ctx.save();
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);  // Retina support
      this.clearCanvas();

      this.updateSkierSpeed();

      this.skier.move();

      //If the skier is not standing still, generate a new obstacle.
      if ([2, 3, 4].indexOf(this.skier.direction) !== -1) {
        this.placeNewObstacle(this.skier.direction);
      }

      //draw sprites
      this.skier.draw();
      _.each(this.obstacles, function (obstacle) {
        obstacle.draw();
      });

      this.drawScore();
      this.checkIfSkierHitObstacle();

      this.ctx.restore();
    }
      requestAnimationFrame(this.gameLoop.bind(this));
  };

  createSprites() {
    this.skier = new Skier(0, 0, this, skierBaseSpeed, 8);
    this.obstacles = [];
    this.createInitialObstacles();
  }

  init() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.createCanvas();

    this.createSprites();

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
