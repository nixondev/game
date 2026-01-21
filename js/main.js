(function(){
  'use strict';

  var WIDTH = window.C && C.WIDTH || 800;
  var HEIGHT = window.C && C.HEIGHT || 600;

  // Phaser 3 Game config
  var config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#1b5e20',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
      window.BootScene,
      window.PreloadScene,
      window.MainMenuScene,
      window.GameWorldScene,
      window.HUDScene,
      window.GameOverScene
    ]
  };

  new Phaser.Game(config);
})();
