(function(){
  'use strict';
  window.C = {
    WIDTH: 800,
    HEIGHT: 600,
    WORLD: { W: 1600, H: 1200 },
    COLORS: {
      BG: '#1b5e20',
      PLAYER: '#4fc3f7',
      WALL_DARK: '#455a64',
      WALL_LIGHT: '#546e7a',
      GRASS_DARK: '#2e7d32',
      GRASS_LIGHT: '#388e3c',
      HUD_TEXT: '#ffffff',
      // Adventurer palette
      SKIN: '#f1c27d',
      HAIR: '#3e2723',
      TUNIC: '#2e7d32',
      TUNIC_TRIM: '#388e3c',
      BELT: '#6d4c41',
      PANTS: '#455a64',
      BOOTS: '#5d4037',
      OUTLINE: '#1b1b1b',
      SHADOW: 'rgba(0,0,0,0.25)'
    },
    PLAYER: {
      DRAG: 600,
      MAX_SPEED: 250,
      ACCEL: 600,
      SIZE: 32
    },
    WALL: { SIZE: 64 },
    GRASS: { SIZE: 64 }
  };
})();
