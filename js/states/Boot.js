(function(){
  'use strict';

  class BootScene extends Phaser.Scene {
    constructor(){ super('Boot'); }
    init(){
      // Scale and background handled by config in v3
      this.cameras.main.setBackgroundColor('#1b5e20');
    }
    preload(){ /* nothing here; textures generated in Preload */ }
    create(){ this.scene.start('Preload'); }
  }

  window.BootScene = BootScene;
})();
