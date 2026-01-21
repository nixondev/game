(function(){
  'use strict';

  function TextureGen(game){
    this.game = game;
  }

  TextureGen.prototype = {
    generateAll: function(){
      this.player();
      this.wall();
      this.grass();
    },
    // Build a simple 2-frame-per-direction spritesheet (8 directions)
    // Returns { url, frame }
    buildPlayerSheet: function(){
      var s = C.PLAYER.SIZE;
      var g = Math.max(1, Math.floor(s / 16));
      var directions = ['down','up','left','right','downLeft','downRight','upLeft','upRight'];
      var cols = 2; // 2 frames per direction
      var rows = directions.length;
      var sheet = this.game.add.bitmapData(s * cols, s * rows);
      var ctx = sheet.ctx;

      for (var r = 0; r < rows; r++){
        var dir = directions[r];
        for (var f = 0; f < cols; f++){
          // draw one frame at (fx, fy)
          var fx = f * s;
          var fy = r * s;

          // helper to draw a pixel relative to the current frame
          function px(x, y, w, h, color){
            ctx.fillStyle = color;
            ctx.fillRect(fx + x * g, fy + y * g, w * g, h * g);
          }

          // clear frame area
          ctx.clearRect(fx, fy, s, s);

          // simple shadow ellipse
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(fx + 8 * g, fy + 14 * g, 5 * g, 2 * g, 0, 0, Math.PI * 2);
          ctx.fill();

          // draw base according to direction using existing helpers
          switch(dir){
            case 'down': this._drawFront(px, g, s); break;
            case 'up': this._drawBack(px, g, s); break;
            case 'left': this._drawLeft(px, g, s); break;
            case 'right': this._drawRight(px, g, s); break;
            case 'downLeft': this._drawDownLeft(px, g, s); break;
            case 'downRight': this._drawDownRight(px, g, s); break;
            case 'upLeft': this._drawUpLeft(px, g, s); break;
            case 'upRight': this._drawUpRight(px, g, s); break;
          }

          // second frame: add a tiny bobbing effect to simulate walking
          if (f === 1){
            // shift a few pixels for legs/arms hints
            // a subtle highlight/shadow to imply movement
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.fillRect(fx + 0, fy + 0, s, Math.max(1, g));
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            ctx.fillRect(fx + 0, fy + s - Math.max(1, g), s, Math.max(1, g));
          }
        }
      }

      return { url: sheet.canvas.toDataURL('image/png'), frame: s };
    },
    player: function(){
      var s = C.PLAYER.SIZE;
      var directions = ['down', 'up', 'left', 'right', 'downLeft', 'downRight', 'upLeft', 'upRight'];

      directions.forEach(function(dir) {
        var bmd = this.game.add.bitmapData(s, s);
        var ctx = bmd.ctx;
        var g = Math.max(1, Math.floor(s / 16));

        function px(x, y, w, h, color){
          ctx.fillStyle = color;
          ctx.fillRect(x * g, y * g, w * g, h * g);
        }

        ctx.clearRect(0, 0, s, s);

        // Shadow (same for all directions)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(8 * g, 14 * g, 5 * g, 2 * g, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw different sprite based on direction
        switch(dir) {
          case 'down': // Facing toward camera (front view)
            this._drawFront(px, g, s);
            break;
          case 'up': // Facing away (back view)
            this._drawBack(px, g, s);
            break;
          case 'left': // Facing left (side view)
            this._drawLeft(px, g, s);
            break;
          case 'right': // Facing right (side view)
            this._drawRight(px, g, s);
            break;
          case 'downLeft': // Three-quarter view
            this._drawDownLeft(px, g, s);
            break;
          case 'downRight':
            this._drawDownRight(px, g, s);
            break;
          case 'upLeft':
            this._drawUpLeft(px, g, s);
            break;
          case 'upRight':
            this._drawUpRight(px, g, s);
            break;
        }

        this.game.cache.addBitmapData('playerTex_' + dir, bmd);
      }, this);
    },

    _drawFront: function(px, g, s) {
      // Feet/boots (both visible)
      px(5, 11, 2, 3, C.COLORS.BOOTS);
      px(9, 11, 2, 3, C.COLORS.BOOTS);
      px(7, 12, 2, 2, C.COLORS.PANTS);

      // Body
      px(4, 7, 8, 5, C.COLORS.TUNIC);
      px(3, 7, 10, 2, C.COLORS.TUNIC_TRIM); // shoulders

      // Arms at sides
      px(2, 8, 2, 3, C.COLORS.TUNIC_TRIM);
      px(12, 8, 2, 3, C.COLORS.TUNIC_TRIM);
      px(2, 10, 2, 1, C.COLORS.SKIN); // hands
      px(12, 10, 2, 1, C.COLORS.SKIN);

      // Head
      px(5, 2, 6, 6, C.COLORS.SKIN);
      px(5, 1, 6, 3, C.COLORS.HAIR);
      px(4, 2, 8, 2, C.COLORS.HAIR);

      // Face
      px(6, 5, 1, 2, C.COLORS.OUTLINE); // eyes
      px(9, 5, 1, 2, C.COLORS.OUTLINE);
      px(6, 5, 1, 1, '#ffffff');
      px(9, 5, 1, 1, '#ffffff');
      px(7, 6, 2, 1, C.COLORS.SKIN_SHADOW || '#d7a090'); // nose
    },

    _drawBack: function(px, g, s) {
      // Feet (just heels visible)
      px(5, 12, 2, 2, C.COLORS.BOOTS);
      px(9, 12, 2, 2, C.COLORS.BOOTS);

      // Body (cloak/tunic back)
      px(4, 7, 8, 5, C.COLORS.TUNIC);
      px(3, 7, 10, 2, C.COLORS.TUNIC_TRIM);

      // Backpack prominent
      px(6, 8, 4, 4, C.COLORS.BELT);
      px(7, 8, 2, 1, C.COLORS.BOOTS); // straps
      px(7, 11, 2, 1, C.COLORS.BOOTS);

      // Arms barely visible at sides
      px(2, 8, 2, 2, C.COLORS.TUNIC_TRIM);
      px(12, 8, 2, 2, C.COLORS.TUNIC_TRIM);

      // Back of head
      px(5, 2, 6, 6, C.COLORS.SKIN);

      // Hair (back of head - more coverage)
      px(4, 1, 8, 5, C.COLORS.HAIR);
      px(5, 5, 6, 2, C.COLORS.HAIR);

      // Maybe just ears visible
      px(4, 4, 1, 2, C.COLORS.SKIN);
      px(11, 4, 1, 2, C.COLORS.SKIN);
    },

    _drawLeft: function(px, g, s) {
      // Single foot visible (left side)
      px(7, 12, 3, 2, C.COLORS.BOOTS);
      px(7, 11, 3, 1, C.COLORS.PANTS);

      // Body (side profile)
      px(5, 7, 6, 5, C.COLORS.TUNIC);
      px(4, 7, 7, 2, C.COLORS.TUNIC_TRIM); // shoulder

      // Left arm in front
      px(3, 8, 3, 3, C.COLORS.TUNIC_TRIM);
      px(3, 10, 3, 1, C.COLORS.SKIN);

      // Weapon at hip
      px(10, 9, 1, 3, C.COLORS.BELT);

      // Head (side profile)
      px(6, 2, 5, 6, C.COLORS.SKIN);

      // Hair (side view)
      px(6, 1, 5, 4, C.COLORS.HAIR);
      px(5, 2, 6, 2, C.COLORS.HAIR);

      // Eye (single, side view)
      px(8, 5, 2, 1, C.COLORS.OUTLINE);
      px(8, 5, 1, 1, '#ffffff');

      // Nose (profile)
      px(10, 5, 1, 2, C.COLORS.SKIN_SHADOW || '#d7a090');

      // Ear
      px(6, 4, 1, 2, C.COLORS.SKIN_SHADOW || '#d7a090');
    },

    _drawRight: function(px, g, s) {
      // Mirror of left - single foot
      px(6, 12, 3, 2, C.COLORS.BOOTS);
      px(6, 11, 3, 1, C.COLORS.PANTS);

      // Body
      px(5, 7, 6, 5, C.COLORS.TUNIC);
      px(5, 7, 7, 2, C.COLORS.TUNIC_TRIM);

      // Right arm in front
      px(10, 8, 3, 3, C.COLORS.TUNIC_TRIM);
      px(10, 10, 3, 1, C.COLORS.SKIN);

      // Backpack visible on right side
      px(5, 9, 2, 3, C.COLORS.BELT);

      // Head (side profile, facing right)
      px(5, 2, 5, 6, C.COLORS.SKIN);

      // Hair
      px(5, 1, 5, 4, C.COLORS.HAIR);
      px(5, 2, 6, 2, C.COLORS.HAIR);

      // Eye
      px(6, 5, 2, 1, C.COLORS.OUTLINE);
      px(7, 5, 1, 1, '#ffffff');

      // Nose
      px(5, 5, 1, 2, C.COLORS.SKIN_SHADOW || '#d7a090');

      // Ear
      px(9, 4, 1, 2, C.COLORS.SKIN_SHADOW || '#d7a090');
    },

    _drawDownLeft: function(px, g, s) {
      // Three-quarter view (front-left)
      px(6, 12, 2, 2, C.COLORS.BOOTS); // left foot more visible
      px(9, 12, 2, 2, C.COLORS.BOOTS); // right foot partial

      px(5, 7, 7, 5, C.COLORS.TUNIC);
      px(4, 7, 8, 2, C.COLORS.TUNIC_TRIM);

      px(3, 8, 3, 3, C.COLORS.TUNIC_TRIM); // left arm prominent
      px(11, 9, 2, 2, C.COLORS.TUNIC_TRIM); // right arm partial
      px(3, 10, 3, 1, C.COLORS.SKIN);
      px(11, 10, 2, 1, C.COLORS.SKIN);

      // Head angled
      px(5, 2, 6, 6, C.COLORS.SKIN);
      px(5, 1, 6, 3, C.COLORS.HAIR);
      px(4, 2, 7, 2, C.COLORS.HAIR);

      // Eyes (both visible, angled)
      px(6, 5, 1, 2, C.COLORS.OUTLINE);
      px(9, 5, 1, 1, C.COLORS.OUTLINE);
      px(6, 5, 1, 1, '#ffffff');
      px(9, 5, 1, 1, '#ffffff');
    },

    _drawDownRight: function(px, g, s) {
      // Three-quarter view (front-right) - mirror of downLeft
      px(5, 12, 2, 2, C.COLORS.BOOTS);
      px(8, 12, 2, 2, C.COLORS.BOOTS);

      px(4, 7, 7, 5, C.COLORS.TUNIC);
      px(4, 7, 8, 2, C.COLORS.TUNIC_TRIM);

      px(3, 9, 2, 2, C.COLORS.TUNIC_TRIM);
      px(10, 8, 3, 3, C.COLORS.TUNIC_TRIM);
      px(3, 10, 2, 1, C.COLORS.SKIN);
      px(10, 10, 3, 1, C.COLORS.SKIN);

      px(5, 2, 6, 6, C.COLORS.SKIN);
      px(5, 1, 6, 3, C.COLORS.HAIR);
      px(5, 2, 7, 2, C.COLORS.HAIR);

      px(6, 5, 1, 1, C.COLORS.OUTLINE);
      px(9, 5, 1, 2, C.COLORS.OUTLINE);
      px(6, 5, 1, 1, '#ffffff');
      px(9, 5, 1, 1, '#ffffff');
    },

    _drawUpLeft: function(px, g, s) {
      // Three-quarter view (back-left)
      px(6, 12, 2, 2, C.COLORS.BOOTS);
      px(9, 12, 2, 2, C.COLORS.BOOTS);

      px(5, 7, 7, 5, C.COLORS.TUNIC);
      px(6, 8, 4, 4, C.COLORS.BELT); // backpack

      px(3, 8, 2, 3, C.COLORS.TUNIC_TRIM);
      px(11, 9, 2, 2, C.COLORS.TUNIC_TRIM);

      // Back-left of head
      px(5, 2, 6, 6, C.COLORS.SKIN);
      px(4, 1, 7, 5, C.COLORS.HAIR);
      px(4, 4, 1, 2, C.COLORS.SKIN); // ear
    },

    _drawUpRight: function(px, g, s) {
      // Three-quarter view (back-right)
      px(5, 12, 2, 2, C.COLORS.BOOTS);
      px(8, 12, 2, 2, C.COLORS.BOOTS);

      px(4, 7, 7, 5, C.COLORS.TUNIC);
      px(6, 8, 4, 4, C.COLORS.BELT); // backpack

      px(3, 9, 2, 2, C.COLORS.TUNIC_TRIM);
      px(11, 8, 2, 3, C.COLORS.TUNIC_TRIM);

      // Back-right of head
      px(5, 2, 6, 6, C.COLORS.SKIN);
      px(5, 1, 7, 5, C.COLORS.HAIR);
      px(11, 4, 1, 2, C.COLORS.SKIN); // ear
    },
    wall: function(){
      var S = C.WALL.SIZE;
      var bmd = this.game.add.bitmapData(S, S);
      bmd.ctx.fillStyle = C.COLORS.WALL_DARK;
      bmd.ctx.fillRect(0, 0, S, S);
      bmd.ctx.fillStyle = C.COLORS.WALL_LIGHT;
      for (var i = 0; i < S; i += 8) {
        bmd.ctx.fillRect(i, 0, 2, S);
      }
      this.game.cache.addBitmapData('wallTex', bmd);
      return bmd;
    },
    grass: function(){
      var S = C.GRASS.SIZE;
      var bmd = this.game.add.bitmapData(S, S);
      bmd.ctx.fillStyle = C.COLORS.GRASS_DARK;
      bmd.ctx.fillRect(0, 0, S, S);
      bmd.ctx.fillStyle = C.COLORS.GRASS_LIGHT;
      for (var x = 0; x < S; x += 8) {
        for (var y = 0; y < S; y += 8) {
          bmd.ctx.fillRect(x, y, 2, 2);
        }
      }
      this.game.cache.addBitmapData('grassTex', bmd);
      return bmd;
    }
  };

  window.TextureGen = TextureGen;
})();
