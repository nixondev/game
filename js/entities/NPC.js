(function(){
  'use strict';

  // NPC with simple pathing (patrol or wander) and 8-direction facing like Player
  function NPC(game, x, y, opts){
    opts = opts || {};
    // Use the same animated spritesheet as Player
    Phaser.Sprite.call(this, game, x, y, 'adventurer');
    this.anchor.set(0.5);
    this.smoothed = false;

    this.dialogue = opts.dialogue || 'Hello there!';
    this.dialogueId = opts.dialogueId || null;
    this.behavior = opts.behavior || 'idle'; // 'patrol' | 'wander' | 'idle'
    this.waypoints = (opts.waypoints || []).map(function(p){ return { x:p.x, y:p.y }; });
    this.currentWP = 0;
    this.center = { x: x, y: y };
    this.wanderRadius = opts.wanderRadius || 120;
    this.speed = opts.speed || 80; // slower than player

    this.currentDirection = 'down';

    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.drag.set(400);
    this.body.maxVelocity.set(this.speed);

    // Animations
    this._setupAnimations();
    this._applyIdleFrame();

    // Internal timers for wander
    this._nextWanderTime = 0;
    this._wanderTarget = null;

    // Pathfinding integration
    this.pathfinder = null;
    this._path = null; // array of world points
    this._pathIndex = 0;
    this._nextPathRecalc = 0;
    this._lastTarget = null;
  }

  NPC.prototype = Object.create(Phaser.Sprite.prototype);
  NPC.prototype.constructor = NPC;

  NPC.prototype.update = function(){
    var game = this.game;
    var vx = 0, vy = 0;

    var behaviorTarget = null;

    if (this.behavior === 'patrol' && this.waypoints.length > 0) {
      behaviorTarget = this.waypoints[this.currentWP];
      var dx = behaviorTarget.x - this.x;
      var dy = behaviorTarget.y - this.y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 8) {
        // advance waypoint
        this.currentWP = (this.currentWP + 1) % this.waypoints.length;
        behaviorTarget = this.waypoints[this.currentWP];
      }
    } else if (this.behavior === 'wander') {
      if (game.time.now >= this._nextWanderTime || !this._wanderTarget) {
        this._wanderTarget = this._pickWanderPoint();
        // next decision between 1.0s and 2.0s
        this._nextWanderTime = game.time.now + (1000 + Math.random()*1000);
      }
      behaviorTarget = this._wanderTarget;
      if (behaviorTarget){
        var dxw = behaviorTarget.x - this.x;
        var dyw = behaviorTarget.y - this.y;
        var dw = Math.sqrt(dxw*dxw + dyw*dyw);
        if (dw < 12) this._wanderTarget = null; // pick new soon
      }
    }

    // If we have a pathfinder and a target, compute/follow a path
    if (this.pathfinder && behaviorTarget){
      // Recalculate if target changed or path finished or stale
      var tgtKey = behaviorTarget.x + ',' + behaviorTarget.y;
      if (!this._path || this._pathIndex >= this._path.length || this._lastTarget !== tgtKey || game.time.now >= this._nextPathRecalc){
        this._path = this.pathfinder.findPath(this.x, this.y, behaviorTarget.x, behaviorTarget.y) || null;
        this._pathIndex = 0;
        this._lastTarget = tgtKey;
        this._nextPathRecalc = game.time.now + 500; // cooldown
      }
      if (this._path && this._pathIndex < this._path.length){
        var node = this._path[this._pathIndex];
        var ndx = node.x - this.x;
        var ndy = node.y - this.y;
        var ndist = Math.sqrt(ndx*ndx + ndy*ndy);
        if (ndist < 8){
          this._pathIndex++;
        } else if (ndist > 0){
          vx = (ndx / ndist) * this.speed;
          vy = (ndy / ndist) * this.speed;
        }
      }
    }

    // Fallback: if no path or no target (idle), simple velocity (already handled for patrol earlier if no pathfinder)
    if (!this.pathfinder){
      if (behaviorTarget){
        var dx2 = behaviorTarget.x - this.x;
        var dy2 = behaviorTarget.y - this.y;
        var d2 = Math.sqrt(dx2*dx2 + dy2*dy2);
        if (d2 > 0){ vx = (dx2/d2) * this.speed; vy = (dy2/d2) * this.speed; }
      }
    }

    // Apply velocity directly (NPCs are autonomous)
    this.body.velocity.set(vx, vy);

    // Update facing by velocity
    if (Math.abs(vx) + Math.abs(vy) > 1) {
      var angle = Math.atan2(vy, vx);
      var newDir = this._angleToDirection(angle);
      if (newDir !== this.currentDirection) {
        this.currentDirection = newDir;
        this._playDir(newDir);
      } else if (!this.animations.currentAnim || !this.animations.currentAnim.isPlaying) {
        this._playDir(newDir);
      }
    } else {
      this.animations.stop(null, true);
      this._applyIdleFrame();
    }
  };

  NPC.prototype._setupAnimations = function(){
    var dirs = ['down','up','left','right','downLeft','downRight','upLeft','upRight'];
    for (var i = 0; i < dirs.length; i++){
      var base = i * 2;
      this.animations.add(dirs[i], [base, base + 1], 6, true);
    }
  };

  NPC.prototype._applyIdleFrame = function(){
    var row = this._directionToRow(this.currentDirection || 'down');
    this.frame = row * 2;
  };

  NPC.prototype._playDir = function(dir){ this.animations.play(dir); };

  NPC.prototype._directionToRow = function(dir){
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

  NPC.prototype._angleToDirection = function(angle){
    var deg = angle * 180 / Math.PI; if (deg < 0) deg += 360;
    if (deg >= 337.5 || deg < 22.5) return 'right';
    if (deg >= 22.5 && deg < 67.5) return 'downRight';
    if (deg >= 67.5 && deg < 112.5) return 'down';
    if (deg >= 112.5 && deg < 157.5) return 'downLeft';
    if (deg >= 157.5 && deg < 202.5) return 'left';
    if (deg >= 202.5 && deg < 247.5) return 'upLeft';
    if (deg >= 247.5 && deg < 292.5) return 'up';
    if (deg >= 292.5 && deg < 337.5) return 'upRight';
    return 'down';
  };

  NPC.prototype._pickWanderPoint = function(){
    var a = Math.random() * Math.PI * 2;
    var r = Math.random() * this.wanderRadius;
    var pt = { x: this.center.x + Math.cos(a)*r, y: this.center.y + Math.sin(a)*r };
    // If we have a pathfinder and the target tile is blocked, try a few times
    if (this.pathfinder){
      for (var i=0;i<5;i++){
        var tile = this.pathfinder.worldToTile(pt.x, pt.y);
        if (this.pathfinder.grid[tile.ty][tile.tx] === 0) break;
        a = Math.random() * Math.PI * 2;
        r = Math.random() * this.wanderRadius;
        pt = { x: this.center.x + Math.cos(a)*r, y: this.center.y + Math.sin(a)*r };
      }
    }
    return pt;
  };

  NPC.prototype.setNavigation = function(pathfinder){
    this.pathfinder = pathfinder;
  };

  NPC.prototype.getDialogueId = function(){
    return this.dialogueId || null;
  };

  NPC.prototype.talk = function(){
    return this.dialogue;
  };

  window.NPC = NPC;
})();
