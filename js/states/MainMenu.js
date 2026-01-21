(function(){
  'use strict';

  class MainMenuScene extends Phaser.Scene {
    constructor(){ super('MainMenu'); }
    create(){
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;

      const title = this.add.text(centerX, centerY - 60, 'Top-Down RPG (Phaser 3)', { fontFamily: 'Arial', fontSize: '28px', color: '#ffffff' }).setOrigin(0.5);
      const info = this.add.text(centerX, centerY, 'Press ENTER or CLICK to Start\nControls: Move = WASD/Arrows, Talk = E, Choices = 1–5', { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', align: 'center' }).setOrigin(0.5);

      const start = () => this.scene.start('GameWorld', { mapKey: 'level1' });
      this.input.once('pointerdown', start);
      this.input.keyboard.once('keydown-ENTER', start);
    }
  }

  window.MainMenuScene = MainMenuScene;
})();
