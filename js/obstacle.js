var Assets = window.Assets || [];
var ObstacleAssets = [
  new Asset('obstacle0', 'tree', 'img/tree_1.png'),
  new Asset('obstacle1', 'treeCluster', 'img/tree_cluster.png'),
  new Asset('obstacle2', 'rock1', 'img/rock_1.png'),
  new Asset('obstacle3', 'rock2', 'img/rock_2.png')
];

Assets = _.concat(Assets, ObstacleAssets);

class Obstacle extends Sprite {
  constructor(x, y, game, type) {
    super(x, y, game);

    this.type = type;

    //Pick random obstacle asset if none provided
    if (this.type == null) {
      this.type = 'obstacle' + _.random(0, ObstacleAssets.length - 1);
    }

  };

  getCurrentAsset() {
    var _this = this;
    return _.find(Assets, function(asset) {
      return asset.id === _this.type;
    });
  };

  draw() {
    var obstacleImage = this.getCurrentAsset().img;
    var mapX = this.x - this.game.skier.x - obstacleImage.width / 2;
    var mapY = this.y - this.game.skier.y - obstacleImage.height / 2;

    //Don't draw obstacle if significantly out of viewport
    if (mapX < -100 || mapX > this.gameWidth + 50 || mapY < -100 || mapY > this.gameHeight + 50) {
      return;
    }

    this.game.ctx.drawImage(obstacleImage, mapX, mapY, obstacleImage.width, obstacleImage.height);
  };
};
