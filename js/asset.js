class Asset {
  constructor(id, name, src) {
    this._id = id;
    this.name = name;
    this._src = src;
    this._img = null;
  };

  get id() {
    return this._id;
  };

  get src() {
    return this._src;
  };

  get img() {
    return this._img;
  };

  set img(img) {
    this._img = img;
  }
};
