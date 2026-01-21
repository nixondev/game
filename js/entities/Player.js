(function(){
  'use strict';

  function Player(game, x, y, inputManager){
    // Use animated spritesheet
    Phaser.Sprite.call(this, game, x, y, 'adventurer');
    this.anchor.set(0.5);
    this.smoothed = false;

    this.inputManager = inputManager || null;

    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.drag.set(C.PLAYER.DRAG);
    this.body.maxVelocity.set(C.PLAYER.MAX_SPEED);

    // Fallback Input (if no InputManager provided)
    if (!this.inputManager){
      this.cursors = game.input.keyboard.createCursorKeys();
      this.wasd = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D)
      };
    }

    // Animations: 2 frames per direction, rows ordered as in TextureGen
    this._setupAnimations();

    // Track current facing direction
    this.currentDirection = 'down';
    this._applyIdleFrame();
  }

  Player.prototype = Object.create(Phaser.Sprite.prototype);
  Player.prototype.constructor = Player;

  Player.prototype.update = function(){
    var accel = C.PLAYER.ACCEL;
    var vx = 0, vy = 0;

    if (this.inputManager){
      // Use action axes from InputManager (-1..1 or analog)
      var ax = this.inputManager.getAxis('moveX');
      var ay = this.inputManager.getAxis('moveY');
      // clamp
      if (ax > 1) ax = 1; if (ax < -1) ax = -1;
      if (ay > 1) ay = 1; if (ay < -1) ay = -1;
      // Normalize if both non-zero and >1 length
      var len = Math.sqrt(ax*ax + ay*ay);
      if (len > 1) { ax /= len; ay /= len; }
      vx = accel * ax;
      vy = accel * ay;
    } else {
      if (this.cursors.left.isDown || this.wasd.left.isDown) { vx -= accel; }
      if (this.cursors.right.isDown || this.wasd.right.isDown) { vx += accel; }
      if (this.cursors.up.isDown || this.wasd.up.isDown) { vy -= accel; }
      if (this.cursors.down.isDown || this.wasd.down.isDown) { vy += accel; }
      // Normalize diagonal movement for digital input
      if (vx !== 0 && vy !== 0) { vx *= Math.SQRT1_2; vy *= Math.SQRT1_2; }
    }

    this.body.acceleration.set(vx, vy);

    var moving = Math.abs(vx) + Math.abs(vy) > 1;
    if (moving) {
      var angle = Math.atan2(vy, vx);
      var newDirection = this._angleToDirection(angle);
      if (newDirection !== this.currentDirection) {
        this.currentDirection = newDirection;
        this._playDir(newDirection);
      } else if (!this.animations.currentAnim || !this.animations.currentAnim.isPlaying) {
        this._playDir(newDirection);
      }
    } else {
      // idle
      if (this.animations) this.animations.stop(null, true);
      this._applyIdleFrame();
    }
  };

  Player.prototype._setupAnimations = function(){
    var dirs = ['down','up','left','right','downLeft','downRight','upLeft','upRight'];
    for (var i = 0; i < dirs.length; i++){
      var base = i * 2;
      this.animations.add(dirs[i], [base, base + 1], 6, true);
    }
  };

  Player.prototype._applyIdleFrame = function(){
    var row = this._directionToRow(this.currentDirection || 'down');
    this.frame = row * 2; // first frame of the row
  };

  Player.prototype._playDir = function(dir){
    this.animations.play(dir);
  };

  Player.prototype._directionToRow = function(dir){
    switch(dir){
      case 'down': return 0;
      case 'up': return 1;
      case 'left': return 2;
      case 'right': return 3;
      case 'downLeft': return 4;
      case 'downRight': return 5;
      case 'upLeft': return 6;
      case 'upRight': return 7;
      default: return 0;
    }
  };

  Player.prototype._angleToDirection = function(angle) {
    // Convert radians to degrees
    var deg = angle * 180 / Math.PI;
    if (deg < 0) deg += 360;

    // Map angle ranges to 8 directions
    if (deg >= 337.5 || deg < 22.5) return 'right';
    if (deg >= 22.5 && deg < 67.5) return 'downRight';
    if (deg >= 67.5 && deg < 112.5) return 'down';
    if (deg >= 112.5 && deg < 157.5) return 'downLeft';
    if (deg >= 157.5 && deg < 202.5) return 'left';
    if (deg >= 202.5 && deg < 247.5) return 'upLeft';
    if (deg >= 247.5 && deg < 292.5) return 'up';
    if (deg >= 292.5 && deg < 337.5) return 'upRight';

    return 'down'; // fallback
  };

  window.Player = Player;
})();
