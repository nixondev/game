(function(){
  'use strict';

  function Entity(game, x, y, key){
    Phaser.Sprite.call(this, game, x, y, key);
    this.game = game;
  }

  Entity.prototype = Object.create(Phaser.Sprite.prototype);
  Entity.prototype.constructor = Entity;

  window.Entity = Entity;
})();
