class Sprite {
  constructor(x, y, game) {
    //Sprite position
    this._x = x;
    this._y = y;
    this._game = game;
  };

  get x() {
    return this._x;
  };

  set x(x) {
    this._x = x;
  };

  get y() {
    return this._y;
  };

  set y(y) {
    this._y = y;
  };

  get game() {
    return this._game;
  };

  //Translate a sprite's position based on given parameters
  translate(changeX, changeY) {
    this._x += changeX;
    this._y += changeY;
  };

  //Optionally implement function to handle movement per frame
  move() {};

  //Required implementation: Return the asset to be displayed for the sprite on the canvas.
  getCurrentAsset() {
    throw new Error("getCurrentAsset must be defined by subclass");
  };

  //Calculate the sprite's collision rectangle
  calcRect() {
    var image = this.getCurrentAsset().img;

    return {
        left: this._x,
        right: this._x + image.width,
        top: this._y + image.height - 5,
        bottom: this._y + image.height
    };
  };

  //Draw the sprite to a canvas
  draw() {
    var image = this.getCurrentAsset().img;
    game.ctx.drawImage(image, this._x, this._y, image.width, image.height);
  }
};
