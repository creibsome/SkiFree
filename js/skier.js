var Assets = window.Assets || [];
Assets = _.concat(Assets, [
  new Asset('skier0', 'skierCrash', 'img/skier_crash.png'),
  new Asset('skier1', 'skierLeft', 'img/skier_left.png'),
  new Asset('skier2', 'skierLeftDown', 'img/skier_left_down.png'),
  new Asset('skier3', 'skierDown', 'img/skier_down.png'),
  new Asset('skier4', 'skierRightDown', 'img/skier_right_down.png'),
  new Asset('skier5', 'skierRight', 'img/skier_right.png')
]);

class Skier extends Sprite {
  constructor(x, y, game, dir, spd) {
    super(x, y, game);

    this._direction = dir;
    this._speed = spd;

    //Define movement patterns based on direction
    this.movements = {
      0: { changeX: 0, changeY: 0, isDiagonal: false },
      2: { changeX: -1, changeY: 1, isDiagonal: true },
      3: { changeX: 0, changeY: 1, isDiagonal: false },
      4: { changeX: 1, changeY: 1, isDiagonal: true }
    };
  };

  get direction() {
    return this._direction;
  };

  set direction(direction) {
    this._direction = direction;
  };

  get speed() {
    return this._speed;
  };

  set speed(speed) {
    this._speed = speed;
  };

  //Calculate the distance moved depending on the direction and speed
  calcDistanceMoved(isDiagonal) {
    const DIAGONAL_SPEED_MOD = 1.4142;
    var distance = this.speed;

    if (isDiagonal) {
      distance = Math.round(distance / DIAGONAL_SPEED_MOD);
    }

    return distance;
  };

  //Get current movement pattern based on direction. Defaults to stopped.
  getCurrentMovement() {
    return this.movements[this.direction] || this.movements[0];
  };

  move() {
    var movement = this.getCurrentMovement();
    var distance = this.calcDistanceMoved(movement.isDiagonal);

    this.translate(movement.changeX * distance, movement.changeY * distance);
  };

  //Return asset based on Skier's direction
  getCurrentAsset() {
      var _this = this;
      return _.find(Assets, function (asset) {
        return asset.id === ("skier" + _this.direction);
      });
  };

  //Calculate the skier's collision rectangle
  calcRect() {
    var image = this.getCurrentAsset().img;

    return {
        left: this.x + this.game.width / 2,
        right: this.x + image.width + this.game.width / 2,
        top: this.y + image.height - 5 + this.game.height / 2,
        bottom: this.y + image.height + this.game.height / 2
    };
  };

  //Override default draw to force to center of screen
  draw() {
    var image = this.getCurrentAsset().img;
    var mapX = (this.game.width - image.width) / 2;
    var mapY = (this.game.height - image.height) / 2;
    this.game.ctx.drawImage(image, mapX, mapY, image.width, image.height);
  };
};
