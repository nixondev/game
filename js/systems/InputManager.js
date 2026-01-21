(function(){
  'use strict';

  // Simple action-based input wrapper for keyboard + gamepad
  function InputManager(game){
    this.game = game;
    this.pad = game.input && game.input.gamepad ? game.input.gamepad : null;
    this.keys = {
      up: game.input.keyboard.addKey(Phaser.Keyboard.W),
      left: game.input.keyboard.addKey(Phaser.Keyboard.A),
      down: game.input.keyboard.addKey(Phaser.Keyboard.S),
      right: game.input.keyboard.addKey(Phaser.Keyboard.D),
      up2: game.input.keyboard.addKey(Phaser.Keyboard.UP),
      left2: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
      down2: game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
      right2: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
      interact: game.input.keyboard.addKey(Phaser.Keyboard.E),
      pause: game.input.keyboard.addKey(Phaser.Keyboard.ESC),
      debug1: game.input.keyboard.addKey(Phaser.Keyboard.F3),
      debug2: game.input.keyboard.addKey(Phaser.Keyboard.F4),
      gameOver: game.input.keyboard.addKey(Phaser.Keyboard.G),
      next: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    };

    // number keys 1..9 for dialogue choices
    this.choiceKeys = [];
    for (var i = 1; i <= 9; i++){
      this.choiceKeys[i] = game.input.keyboard.addKey(Phaser.Keyboard[''+i]);
    }

    // state
    this._justPressed = {};
    this._prevDown = { interact:false, pause:false, debug1:false, debug2:false, gameOver:false, next:false };
    this._prevChoiceDown = {};

    // enable gamepad
    if (this.pad) {
      this.pad.start();
    }
  }

  // Helper to know if an action is currently down (keyboard or gamepad)
  InputManager.prototype._isActionDown = function(a){
    var key = this.keys[a];
    var down = !!(key && key.isDown);
    if (!this.pad || !this.pad.connected || !this.pad.pad1) return down;
    var p = this.pad.pad1;
    if (a === 'interact' || a === 'next') down = down || p.isDown(Phaser.Gamepad.XBOX360_A);
    if (a === 'pause') down = down || p.isDown(Phaser.Gamepad.XBOX360_START);
    // debug and gameOver not mapped on pad by default
    return down;
  };

  InputManager.prototype.update = function(){
    // Track justPressed for actions we care about via edge detection
    var actions = ['interact','pause','debug1','debug2','gameOver','next'];
    for (var i=0;i<actions.length;i++){
      var a = actions[i];
      var isDown = this._isActionDown(a);
      this._justPressed[a] = isDown && !this._prevDown[a];
      this._prevDown[a] = isDown;
    }
  };

  InputManager.prototype.getAxis = function(name){
    // moveX, moveY
    var x=0, y=0;
    if ((this.keys.left && this.keys.left.isDown) || (this.keys.left2 && this.keys.left2.isDown)) x -= 1;
    if ((this.keys.right && this.keys.right.isDown) || (this.keys.right2 && this.keys.right2.isDown)) x += 1;
    if ((this.keys.up && this.keys.up.isDown) || (this.keys.up2 && this.keys.up2.isDown)) y -= 1;
    if ((this.keys.down && this.keys.down.isDown) || (this.keys.down2 && this.keys.down2.isDown)) y += 1;

    if (this.pad && this.pad.connected && this.pad.pad1){
      var p = this.pad.pad1;
      var ax = p.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) || 0;
      var ay = p.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) || 0;
      if (Math.abs(ax) > 0.2) x = ax;
      if (Math.abs(ay) > 0.2) y = ay;
      if (p.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT)) x = -1;
      if (p.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT)) x = 1;
      if (p.isDown(Phaser.Gamepad.XBOX360_DPAD_UP)) y = -1;
      if (p.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN)) y = 1;
    }

    if (name === 'moveX') return x;
    if (name === 'moveY') return y;
    return 0;
  };

  InputManager.prototype.justPressed = function(action){
    return !!this._justPressed[action];
  };

  InputManager.prototype.choiceIndex = function(maxChoices){
    // returns 0-based index if a number key (1..maxChoices) pressed, else -1
    var limit = Math.min(9, maxChoices || 0);
    for (var i=1;i<=limit;i++){
      var key = this.choiceKeys[i];
      var isDown = key && key.isDown;
      var prev = !!this._prevChoiceDown[i];
      var jp = false;
      if (key && typeof key.justDown === 'boolean') {
        jp = key.justDown; // Phaser.Key provides justDown flag
      } else {
        jp = isDown && !prev;
      }
      this._prevChoiceDown[i] = isDown;
      if (jp) return i-1;
    }
    // gamepad could map to dpad up/down + A to select, but keep simple for now
    return -1;
  };

  window.InputManager = InputManager;
})();
