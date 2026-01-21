(function(){
  'use strict';

  class PreloadScene extends Phaser.Scene {
    constructor(){ super('Preload'); }

    preload(){
      // Build an animated player spritesheet (2 frames × 8 directions) with distinct art per direction
      var s = (window.C && C.PLAYER && C.PLAYER.SIZE) || 32;
      var g = Math.max(1, Math.floor(s / 16));
      var directions = ['down','up','left','right','downLeft','downRight','upLeft','upRight'];
      var cols = 2, rows = directions.length;
      var sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = s * cols; sheetCanvas.height = s * rows;
      var ctx = sheetCanvas.getContext('2d');

      var COLORS = (window.C && C.COLORS) || {};
      function drawShadow(fx, fy){
        ctx.fillStyle = COLORS.SHADOW || 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.ellipse(fx + 8 * g, fy + 14 * g, 5 * g, 2 * g, 0, 0, Math.PI * 2); ctx.fill();
      }
      function px(fx, fy, x, y, w, h, color){ ctx.fillStyle = color; ctx.fillRect(fx + x * g, fy + y * g, w * g, h * g); }

      function drawFront(fx, fy){
        // Boots
        px(fx, fy, 5, 11, 2, 3, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 9, 11, 2, 3, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 7, 12, 2, 2, COLORS.PANTS || '#455a64');
        // Body
        px(fx, fy, 4, 7, 8, 5, COLORS.TUNIC || '#2e7d32');
        px(fx, fy, 3, 7, 10, 2, COLORS.TUNIC_TRIM || '#388e3c');
        // Arms + hands
        px(fx, fy, 2, 8, 2, 3, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 12, 8, 2, 3, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 2, 10, 2, 1, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 12, 10, 2, 1, COLORS.SKIN || '#f1c27d');
        // Head + hair
        px(fx, fy, 5, 2, 6, 6, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 5, 1, 6, 3, COLORS.HAIR || '#3e2723');
        px(fx, fy, 4, 2, 8, 2, COLORS.HAIR || '#3e2723');
        // Face
        px(fx, fy, 6, 5, 1, 2, COLORS.OUTLINE || '#1b1b1b');
        px(fx, fy, 9, 5, 1, 2, COLORS.OUTLINE || '#1b1b1b');
        px(fx, fy, 6, 5, 1, 1, '#ffffff');
        px(fx, fy, 9, 5, 1, 1, '#ffffff');
        px(fx, fy, 7, 6, 2, 1, COLORS.SKIN_SHADOW || '#d7a090');
      }
      function drawBack(fx, fy){
        px(fx, fy, 5, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 9, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 4, 7, 8, 5, COLORS.TUNIC || '#2e7d32');
        px(fx, fy, 3, 7, 10, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 6, 8, 4, 4, COLORS.BELT || '#6d4c41'); // backpack
        px(fx, fy, 7, 8, 2, 1, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 7, 11, 2, 1, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 2, 8, 2, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 12, 8, 2, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 5, 2, 6, 6, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 4, 1, 8, 5, COLORS.HAIR || '#3e2723');
        px(fx, fy, 5, 5, 6, 2, COLORS.HAIR || '#3e2723');
        px(fx, fy, 4, 4, 1, 2, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 11, 4, 1, 2, COLORS.SKIN || '#f1c27d');
      }
      function drawLeft(fx, fy){
        px(fx, fy, 7, 12, 3, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 7, 11, 3, 1, COLORS.PANTS || '#455a64');
        px(fx, fy, 5, 7, 6, 5, COLORS.TUNIC || '#2e7d32');
        px(fx, fy, 4, 7, 7, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 3, 8, 3, 3, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 3, 10, 3, 1, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 10, 9, 1, 3, COLORS.BELT || '#6d4c41');
        px(fx, fy, 6, 2, 5, 6, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 6, 1, 5, 4, COLORS.HAIR || '#3e2723');
        px(fx, fy, 5, 2, 6, 2, COLORS.HAIR || '#3e2723');
        px(fx, fy, 8, 5, 2, 1, COLORS.OUTLINE || '#1b1b1b');
        px(fx, fy, 8, 5, 1, 1, '#ffffff');
        px(fx, fy, 10, 5, 1, 2, COLORS.SKIN_SHADOW || '#d7a090');
        px(fx, fy, 6, 4, 1, 2, COLORS.SKIN_SHADOW || '#d7a090');
      }
      function drawRight(fx, fy){
        px(fx, fy, 6, 12, 3, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 6, 11, 3, 1, COLORS.PANTS || '#455a64');
        px(fx, fy, 5, 7, 6, 5, COLORS.TUNIC || '#2e7d32');
        px(fx, fy, 5, 7, 7, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 10, 8, 3, 3, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 10, 10, 3, 1, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 5, 9, 2, 3, COLORS.BELT || '#6d4c41');
        px(fx, fy, 5, 2, 5, 6, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 5, 1, 5, 4, COLORS.HAIR || '#3e2723');
        px(fx, fy, 5, 2, 6, 2, COLORS.HAIR || '#3e2723');
        px(fx, fy, 6, 5, 2, 1, COLORS.OUTLINE || '#1b1b1b');
        px(fx, fy, 7, 5, 1, 1, '#ffffff');
        px(fx, fy, 5, 5, 1, 2, COLORS.SKIN_SHADOW || '#d7a090');
        px(fx, fy, 9, 4, 1, 2, COLORS.SKIN_SHADOW || '#d7a090');
      }
      function drawDownLeft(fx, fy){
        px(fx, fy, 6, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 9, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 5, 7, 7, 5, COLORS.TUNIC || '#2e7d32');
        px(fx, fy, 4, 7, 8, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 3, 8, 3, 3, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 11, 9, 2, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 3, 10, 3, 1, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 11, 10, 2, 1, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 5, 2, 6, 6, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 5, 1, 6, 3, COLORS.HAIR || '#3e2723');
        px(fx, fy, 4, 2, 7, 2, COLORS.HAIR || '#3e2723');
        px(fx, fy, 6, 5, 1, 2, COLORS.OUTLINE || '#1b1b1b');
        px(fx, fy, 9, 5, 1, 1, COLORS.OUTLINE || '#1b1b1b');
        px(fx, fy, 6, 5, 1, 1, '#ffffff');
        px(fx, fy, 9, 5, 1, 1, '#ffffff');
      }
      function drawDownRight(fx, fy){
        px(fx, fy, 5, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 8, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 4, 7, 7, 5, COLORS.TUNIC || '#2e7d32');
        px(fx, fy, 4, 7, 8, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 3, 9, 2, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 10, 8, 3, 3, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 3, 10, 2, 1, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 10, 10, 3, 1, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 5, 2, 6, 6, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 5, 1, 6, 3, COLORS.HAIR || '#3e2723');
        px(fx, fy, 5, 2, 7, 2, COLORS.HAIR || '#3e2723');
        px(fx, fy, 6, 5, 1, 1, COLORS.OUTLINE || '#1b1b1b');
        px(fx, fy, 9, 5, 1, 2, COLORS.OUTLINE || '#1b1b1b');
        px(fx, fy, 6, 5, 1, 1, '#ffffff');
        px(fx, fy, 9, 5, 1, 1, '#ffffff');
      }
      function drawUpLeft(fx, fy){
        px(fx, fy, 6, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 9, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 5, 7, 7, 5, COLORS.TUNIC || '#2e7d32');
        px(fx, fy, 6, 8, 4, 4, COLORS.BELT || '#6d4c41');
        px(fx, fy, 3, 8, 2, 3, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 11, 9, 2, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 5, 2, 6, 6, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 4, 1, 7, 5, COLORS.HAIR || '#3e2723');
        px(fx, fy, 4, 4, 1, 2, COLORS.SKIN || '#f1c27d');
      }
      function drawUpRight(fx, fy){
        px(fx, fy, 5, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 8, 12, 2, 2, COLORS.BOOTS || '#5d4037');
        px(fx, fy, 4, 7, 7, 5, COLORS.TUNIC || '#2e7d32');
        px(fx, fy, 6, 8, 4, 4, COLORS.BELT || '#6d4c41');
        px(fx, fy, 3, 9, 2, 2, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 11, 8, 2, 3, COLORS.TUNIC_TRIM || '#388e3c');
        px(fx, fy, 5, 2, 6, 6, COLORS.SKIN || '#f1c27d');
        px(fx, fy, 5, 1, 7, 5, COLORS.HAIR || '#3e2723');
        px(fx, fy, 11, 4, 1, 2, COLORS.SKIN || '#f1c27d');
      }

      function drawRow(dirIndex, frameIndex){
        var fx = frameIndex * s; var fy = dirIndex * s;
        // clear frame
        ctx.clearRect(fx, fy, s, s);
        // shadow
        drawShadow(fx, fy);
        // choose art
        switch(directions[dirIndex]){
          case 'down': drawFront(fx, fy); break;
          case 'up': drawBack(fx, fy); break;
          case 'left': drawLeft(fx, fy); break;
          case 'right': drawRight(fx, fy); break;
          case 'downLeft': drawDownLeft(fx, fy); break;
          case 'downRight': drawDownRight(fx, fy); break;
          case 'upLeft': drawUpLeft(fx, fy); break;
          case 'upRight': drawUpRight(fx, fy); break;
        }
        // subtle animation difference on second frame
        if (frameIndex === 1){
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.fillRect(fx, fy, s, Math.max(1, g));
          ctx.fillStyle = 'rgba(0,0,0,0.06)';
          ctx.fillRect(fx, fy + s - Math.max(1, g), s, Math.max(1, g));
        }
      }

      for (var r = 0; r < rows; r++) { for (var c = 0; c < cols; c++) drawRow(r, c); }
      var sheetURL = sheetCanvas.toDataURL('image/png');
      this.load.spritesheet('adventurer', sheetURL, { frameWidth: s, frameHeight: s });

      // Load Tiled JSON tilemaps (requires serving via file server due to XHR)
      this.load.tilemapTiledJSON('level1', 'assets/tilemaps/level1.json');
      this.load.tilemapTiledJSON('level2', 'assets/tilemaps/level2.json');
      this.load.tilemapTiledJSON('level3', 'assets/tilemaps/level3.json');

      // Build a minimal 2-tile terrain image in memory (64x64 tiles)
      var S = (window.C && C.WALL && C.WALL.SIZE) || 64;
      var tilesCanvas = document.createElement('canvas');
      tilesCanvas.width = S * 2; tilesCanvas.height = S;
      var tctx = tilesCanvas.getContext('2d');
      // Tile 1: wall
      tctx.fillStyle = (window.C && C.COLORS && C.COLORS.WALL_DARK) || '#455a64'; tctx.fillRect(0, 0, S, S);
      tctx.fillStyle = (window.C && C.COLORS && C.COLORS.WALL_LIGHT) || '#546e7a';
      for (var i = 0; i < S; i += 8) { tctx.fillRect(i, 0, 2, S); }
      // Tile 2: grass
      tctx.fillStyle = (window.C && C.COLORS && C.COLORS.GRASS_DARK) || '#2e7d32'; tctx.fillRect(S, 0, S, S);
      tctx.fillStyle = (window.C && C.COLORS && C.COLORS.GRASS_LIGHT) || '#388e3c';
      for (var x = S; x < S * 2; x += 8) { for (var y = 0; y < S; y += 8) { tctx.fillRect(x, y, 2, 2); } }
      this.load.image('terrain', tilesCanvas.toDataURL('image/png'));
    }

    create(){ this.scene.start('MainMenu'); }
  }

  window.PreloadScene = PreloadScene;
})();
