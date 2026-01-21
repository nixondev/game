(function(){
  'use strict';

  function MapBuilder(game){
    this.game = game;
  }

  MapBuilder.prototype = {
    createWallsGroup: function(){
      var g = this.game.add.group();
      g.enableBody = true;
      g.physicsBodyType = Phaser.Physics.ARCADE;
      return g;
    },
    addWall: function(group, x, y, w, h){
      var wallTex = this.game.cache.getBitmapData('wallTex');
      var s = group.create(x, y, wallTex);
      s.scale.setTo(w / C.WALL.SIZE, h / C.WALL.SIZE);
      s.body.immovable = true;
      s.body.collideWorldBounds = true;
      return s;
    },
    buildSimpleLayout: function(group){
      // Outer borders
      this.addWall(group, 0, 0, C.WORLD.W, 64);
      this.addWall(group, 0, C.WORLD.H - 64, C.WORLD.W, 64);
      this.addWall(group, 0, 64, 64, C.WORLD.H - 128);
      this.addWall(group, C.WORLD.W - 64, 64, 64, C.WORLD.H - 128);
      // Inner obstacles
      this.addWall(group, 300, 200, 400, 64);
      this.addWall(group, 700, 500, 64, 400);
      this.addWall(group, 1000, 300, 300, 64);
      this.addWall(group, 1100, 800, 64, 250);
    }
  };

  window.MapBuilder = MapBuilder;
})();
