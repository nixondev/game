(function(){
  'use strict';

  class GameOverScene extends Phaser.Scene {
    constructor(){ super('GameOver'); }
    create(){
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;
      this.add.text(centerX, centerY - 40, 'Game Over', { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
      this.add.text(centerX, centerY + 10, 'Press ENTER or CLICK to return to Menu', { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
      const back = () => this.scene.start('MainMenu');
      this.input.keyboard.once('keydown-ENTER', back);
      this.input.once('pointerdown', back);
    }
  }

  window.GameOverScene = GameOverScene;
})();
