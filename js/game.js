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

  get highScore() {
    return sessionStorage.getItem('highScore') || 0;
  }

  createCanvas() {
    this.canvas = $('<canvas></canvas>')
        .attr('width', this.width * window.devicePixelRatio)
        .attr('height', this.height * window.devicePixelRatio)
        .css({
          width: this.width + 'px',
          height: this.height + 'px',
        });

    $('body').append(this.canvas);

    this._ctx = this.canvas[0].getContext('2d');
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // Assets are provided by each individual sprite class and placed into Assets.
  loadAssets() {
    const assetPromises = [];
    _.each(Assets, function(asset) {
      const assetImage = new Image();
      const assetDeferred = new $.Deferred();

      assetImage.onload = function() {
        assetImage.width /= 2;
        assetImage.height /= 2;

        asset.img = assetImage;
        assetDeferred.resolve();
      };
      assetImage.src = asset.src;

      assetPromises.push(assetDeferred.promise());
    });

    return $.when(...assetPromises);
  }

  checkIfSkierHitObstacle() {
    const skierRect = this.skier.calcRect();

    const _this = this;
    const collision = _.find(this.obstacles, function(obstacle) {
      return _this.intersectRect(skierRect, obstacle.calcRect());
    });

    if (collision) {
      this.skier.direction = 0;

      this.ctx.font = '24px Serif';
      this.ctx.fillStyle = 'Red';
      let crashedMsg = 'You have crashed! Press ENTER to try again.';
      this.ctx.fillText(crashedMsg, 5, this.height - 40);

      const currentScore = this.calcScore();

      // Handle highScore achievement
      if (currentScore > this.highScore) {
        this.ctx.fillStyle = 'Green';
        let highScoreMsg = 'New High Score Achieved: ' + currentScore;
        this.ctx.fillText(highScoreMsg, 5, this.height - 15);
        sessionStorage.setItem('highScore', currentScore);
      }
    }
  }

  intersectRect(r1, r2) {
    return !(r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top);
  }

  placeRandObstacle(minX, maxX, minY, maxY) {
    const position = this.calculateOpenPosition(minX, maxX, minY, maxY);
    this.addObstacle(new Obstacle(position.x, position.y, this));
  }

  createInitialObstacles() {
    const numObstacles = Math.ceil(_.random(5, 7) * (this.width / 800) * (this.height / 500));

    const minX = -50;
    const maxX = this.width + 50;
    const minY = this.height / 2 + 100;
    const maxY = this.height + 50;

    for (let i = 0; i < numObstacles; i++) {
      this.placeRandObstacle(minX, maxX, minY, maxY);
    }
  }

  calculateOpenPosition(minX, maxX, minY, maxY) {
    const x = _.random(minX, maxX);
    const y = _.random(minY, maxY);

    const foundCollision = _.find(this.obstacles, function(obstacle) {
      return Math.abs(x - obstacle.x) < 50 && Math.abs(y - obstacle.y) < 50;
    });

    if (foundCollision) {
      return this.calculateOpenPosition(minX, maxX, minY, maxY);
    } else {
      return {
        x: x,
        y: y,
      };
    }
  }

  placeNewObstacle(direction) {
    if (_.random(1, 8) !== 8) { // Only place an obstacle 1/8 of the time
      return;
    }

    const leftEdge = this.skier.x;
    const rightEdge = this.skier.x + this.width;
    const topEdge = this.skier.y;
    const bottomEdge = this.skier.y + this.height;

    if ([1, 2].indexOf(direction) !== -1) { // left or left-down
      this.placeRandObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge);
    }

    if ([2, 3, 4].indexOf(direction) !== -1) { // left-down, down, or right-down
      this.placeRandObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
    }

    if ([4, 5].indexOf(direction) !== -1) { // right-down or right
      this.placeRandObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge);
    }

    if (direction === 6) { // Handle unique move up case
      this.placeRandObstacle(leftEdge, rightEdge, topEdge - 50, topEdge);
    }
  }

  setupKeyhandler() {
    const _this = this;

    $(window).keydown(function(event) {
      // Ignore directional endpoint if skier has crashed.
      // Only allow user to reset game on enter keypress
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
          } else {
            _this.skier.direction -= 1;
          }
          event.preventDefault();
          break;
        case 39: // right
        case 68: // D
          if (_this.skier.direction === 5) {
            _this.skier.translate(_this.skier.speed, 0);
            _this.placeNewObstacle(_this.skier.direction);
          } else {
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
  }

  // Calculate score as total units moved from start position
  calcScore() {
    return Math.round(Math.sqrt(Math.pow(this.skier.x, 2) + Math.pow(this.skier.y, 2)));
  }

  drawScore() {
    this.ctx.font = '20px Serif';
    this.ctx.fillStyle = 'Blue';
    this.ctx.fillText('Score: ' + this.calcScore(), 10, 25);
    this.ctx.fillText('High Score: ' + this.highScore, 10, 45);
  }

  // Increase skier speed by 1 unit every 2500 points earned
  updateSkierSpeed() {
    this.skier.speed = skierBaseSpeed + Math.floor(this.calcScore() / skierSpeedStep);
  }

  gameLoop() {
    if (this.skier.direction !== 0) { // Do not update if the skier has crashed.
      this.ctx.save();

      // Retina support
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.clearCanvas();

      this.updateSkierSpeed();

      this.skier.move();

      // If the skier is not standing still, generate a new obstacle.
      if ([2, 3, 4].indexOf(this.skier.direction) !== -1) {
        this.placeNewObstacle(this.skier.direction);
      }

      _.each(this.obstacles, function(obstacle) {
        obstacle.draw();
      });

      this.checkIfSkierHitObstacle();

      // draw sprites
      this.skier.draw();

      this.drawScore();

      this.ctx.restore();
    }
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  // Create the default sprites for the game.
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

    const _this = this;
    this.loadAssets()
        .then(function() {
          requestAnimationFrame(_this.gameLoop.bind(_this));
        });
  }
}

$(document).ready(function() {
  const skiGame = new Game();
  skiGame.init();
});
