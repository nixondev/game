(function(){
  'use strict';

  function Enemy(game, x, y){
    Phaser.Sprite.call(this, game, x, y, game.cache.getBitmapData('wallTex'));
    this.anchor.set(0.5);
    game.physics.arcade.enable(this);
    this.body.immovable = true; // placeholder behavior
  }

  Enemy.prototype = Object.create(Phaser.Sprite.prototype);
  Enemy.prototype.constructor = Enemy;

  // Placeholder update
  Enemy.prototype.update = function(){};

  window.Enemy = Enemy;
})();
