(function(){
  'use strict';

  class GameWorldScene extends Phaser.Scene {
    constructor(){ super('GameWorld'); }

    init(data){
      this.mapKey = (data && data.mapKey) || 'level1';
      this.spawnId = (data && data.spawnId) || null;
    }

    create(){
      this.cameras.main.setBackgroundColor(C.COLORS.BG || '#1b5e20');

      // Tilemap
      const map = this.make.tilemap({ key: this.mapKey || 'level1' });
      const tiles = map.addTilesetImage('terrain', 'terrain');
      const ground = map.createLayer('Ground', tiles, 0, 0);
      const walls = map.createLayer('Collision', tiles, 0, 0);
      this.map = map; this.groundLayer = ground; this.collisionLayer = walls;

      // Collisions by property or index
      if (walls && walls.setCollisionByProperty){ walls.setCollisionByProperty({ collide: true }); }
      else if (walls) { walls.setCollision([1]); }

      // Physics world bounds to map size
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      // Player spawn from map Objects layer (fallback to default)
      let spawn = { x: 200, y: 150 };
      const objLayer = map.getObjectLayer && map.getObjectLayer('Objects');
      // Helper to find a spawn by name
      const findSpawn = (name) => {
        if (!objLayer || !objLayer.objects) return null;
        return objLayer.objects.find(o => o.type === 'spawn' && o.name === name);
      };
      if (this.spawnId){
        const sObj = findSpawn(this.spawnId);
        if (sObj && typeof sObj.x === 'number' && typeof sObj.y === 'number'){
          spawn = { x: sObj.x, y: sObj.y };
        }
      }
      if (objLayer && objLayer.objects && objLayer.objects.length && (!this.spawnId || !findSpawn(this.spawnId))){
        const playerObj = objLayer.objects.find(o => o.type === 'spawn' && (o.name === 'player' || o.name === 'default')) || objLayer.objects.find(o => o.name === 'player');
        if (playerObj && typeof playerObj.x === 'number' && typeof playerObj.y === 'number'){
          spawn = { x: playerObj.x, y: playerObj.y };
        }
      }

      // Player
      this.player = this.physics.add.sprite(spawn.x, spawn.y, 'adventurer', 0);
      this.player.setCollideWorldBounds(true).setDrag(C.PLAYER.DRAG || 600).setMaxVelocity(C.PLAYER.MAX_SPEED || 250);
      this.player.setOrigin(0.5, 0.5);

      // Animations (2 frames per direction) using frame pairs [0,1], [2,3],...
      const dirs = ['down','up','left','right','downLeft','downRight','upLeft','upRight'];
      for (let i=0;i<dirs.length;i++){
        const base = i*2;
        this.anims.create({ key: 'walk-'+dirs[i], frames: this.anims.generateFrameNumbers('adventurer', { start: base, end: base+1 }), frameRate: 6, repeat: -1 });
      }
      this.currentDirection = 'down';

      // Input
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D
      });
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

      // Collide player with walls
      if (walls) this.physics.add.collider(this.player, walls);

      // NPCs: spawn from Tiled Objects layer (type === 'npc')
      this.npcGroup = this.physics.add.group();
      this._spawnNPCsFromObjects(objLayer);
      // Colliders for NPCs
      if (walls) this.physics.add.collider(this.npcGroup, walls);
      this.physics.add.collider(this.player, this.npcGroup);

      // Portals: areas that let you travel between maps
      this._setupPortals(objLayer);

      // Camera follow
      this.cameras.main.setBounds(0,0,map.widthInPixels, map.heightInPixels);
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

      // Launch HUD overlay scene (for dialogue, etc.)
      if (!this.scene.isActive('HUD')){
        this.scene.launch('HUD');
        this.scene.bringToTop('HUD');
      }
      // Show initial guidance so new features are obvious
      this.game.events.emit('hud:toast', { text: 'Move with WASD/Arrows. Press E near an NPC to talk. Press E in a portal to travel.' });
      this.time.delayedCall(1500, () => {
        this.game.events.emit('hud:toast', { text: 'In dialogue, press 1–5 to choose.' });
      });

      // Initialize core services (singletons on game)
      if (!this.game.dialogue) { this.game.dialogue = new window.DialogueService(this.game); }
      if (!this.game.inventory) { this.game.inventory = new window.InventoryService(this.game); }
      if (!this.game.quests) { this.game.quests = new window.QuestManager(this.game); }

      // Wire global events to services
      this.game.events.on('dialogue:choose', (p) => { if (this.game.dialogue) this.game.dialogue.choose((p&&p.index)|0); });
      this.game.events.on('quest:start', (p) => { if (this.game.quests && p && p.id) this.game.quests.start(p.id); });
      this.game.events.on('inventory:add', (p) => { if (this.game.inventory && p && p.id) this.game.inventory.add(p.id, p.qty||1); });
      this.game.events.on('player:moved', (p) => { if (this.game.quests) this.game.quests.onEvent({ type: 'move', target: 'any' }); });

      // Movement quest ping timer
      this.lastMoveEventTime = 0;
      // Optionally: world-scene prompt placeholder (HUD handles bubbles)
    }

    _spawnNPCsFromObjects(objLayer){
      if (!objLayer || !Array.isArray(objLayer.objects)) return;
      const objs = objLayer.objects.filter(o => (o.type === 'npc'));
      const getProp = (o, name, def) => {
        if (!o.properties) return def;
        const p = o.properties.find(pr => pr.name === name);
        return (p && p.value !== undefined) ? p.value : def;
      };
      objs.forEach(o => {
        const x = o.x || 0, y = o.y || 0;
        const behavior = getProp(o, 'behavior', 'idle');
        const dialogue = getProp(o, 'dialogue', 'Hello there.'); const dialogueId = getProp(o, 'dialogueId', '');
        const wp1x = getProp(o, 'wp1x', x), wp1y = getProp(o, 'wp1y', y);
        const wp2x = getProp(o, 'wp2x', x), wp2y = getProp(o, 'wp2y', y);
        const wanderRadius = getProp(o, 'wanderRadius', 120);

        const npc = this.npcGroup.create(x, y, 'adventurer', 0);
        npc.setOrigin(0.5,0.5).setImmovable(false).setDrag(600).setMaxVelocity(160).setCollideWorldBounds(true);
        npc.setTint(0xffe082); // distinguish from player
        npc.custom = {
          name: o.name || 'npc',
          behavior, dialogue,
          wp1: {x: wp1x, y: wp1y},
          wp2: {x: wp2x, y: wp2y},
          wanderRadius,
          home: {x, y},
          target: null,
          nextRetargetTime: 0,
          facing: 'down',
          dialogueId: dialogueId
        };
        // initial target based on behavior
        if (behavior === 'patrol') npc.custom.target = {x: wp1x, y: wp1y, toggle: 1};
        if (behavior === 'wander') npc.custom.nextRetargetTime = this.time.now + 500;
      });
    }

    _updateNPC(npc, time){
      const acc = 500;
      const stopRadius = 8;
      const c = npc.custom || {};

      // Determine target based on behavior
      if (c.behavior === 'patrol'){
        if (!c.target) c.target = {x: c.wp1.x, y: c.wp1.y, toggle: 1};
        const tx = c.target.x, ty = c.target.y;
        const dx = tx - npc.x, dy = ty - npc.y;
        const dist2 = dx*dx + dy*dy;
        if (dist2 < stopRadius*stopRadius){
          // swap target between wp1 and wp2
          if (c.target.toggle === 1){ c.target = {x: c.wp2.x, y: c.wp2.y, toggle: 2}; }
          else { c.target = {x: c.wp1.x, y: c.wp1.y, toggle: 1}; }
          npc.setAcceleration(0,0);
        } else {
          // accelerate toward target
          const d = Math.sqrt(dist2) || 1;
          const ax = (dx / d) * acc;
          const ay = (dy / d) * acc;
          npc.setAcceleration(ax, ay);
          // facing/animation (reuse player's anim keys)
          const angle = Math.atan2(ay, ax); // use accel direction
          this._playDirectionalAnim(npc, angle);
        }
      } else if (c.behavior === 'wander'){
        if (time >= c.nextRetargetTime){
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * c.wanderRadius;
          c.target = { x: c.home.x + Math.cos(angle)*r, y: c.home.y + Math.sin(angle)*r };
          c.nextRetargetTime = time + 1500 + Math.random()*1500;
        }
        if (c.target){
          const dx = c.target.x - npc.x, dy = c.target.y - npc.y;
          const dist2 = dx*dx + dy*dy;
          if (dist2 < stopRadius*stopRadius){ npc.setAcceleration(0,0); }
          else {
            const d = Math.sqrt(dist2) || 1;
            npc.setAcceleration((dx/d)*acc, (dy/d)*acc);
            const a = Math.atan2((dy/d)*acc, (dx/d)*acc);
            this._playDirectionalAnim(npc, a);
          }
        }
      } else { // idle
        npc.setAcceleration(0,0);
      }

      // Depth sort by y
      npc.setDepth(npc.y);
    }

    _playDirectionalAnim(sprite, angle){
      const deg = (angle*180/Math.PI + 360) % 360;
      let dir = 'down';
      if (deg >= 337.5 || deg < 22.5) dir = 'right';
      else if (deg < 67.5) dir = 'downRight';
      else if (deg < 112.5) dir = 'down';
      else if (deg < 157.5) dir = 'downLeft';
      else if (deg < 202.5) dir = 'left';
      else if (deg < 247.5) dir = 'upLeft';
      else if (deg < 292.5) dir = 'up';
      else dir = 'upRight';
      if (!sprite.anims || !sprite.anims.isPlaying || sprite.custom?.facing !== dir){
        sprite.custom && (sprite.custom.facing = dir);
        sprite.play('walk-'+dir, true);
      }
    }

    _setupPortals(objLayer){
      this.portals = this.physics.add.staticGroup();
      this.activePortal = null; this.portalPromptShown = false;
      if (!objLayer || !Array.isArray(objLayer.objects)) return;
      const objs = objLayer.objects.filter(o => o.type === 'portal');
      const getProp = (o, name, def) => {
        if (!o.properties) return def;
        const p = o.properties.find(pr => pr.name === name);
        return (p && p.value !== undefined) ? p.value : def;
      };
      objs.forEach(o => {
        const x = (o.x || 0); const y = (o.y || 0);
        const w = (o.width || 64); const h = (o.height || 64);
        const targetMap = getProp(o, 'targetMap', 'level1');
        const targetSpawn = getProp(o, 'targetSpawn', 'player');
        const prompt = getProp(o, 'prompt', 'Press E to travel');
        const portal = this.add.rectangle(x, y, w, h, 0x00ffff, 0.15);
        portal.setOrigin(0, 1); // Tiled y is bottom-left of object
        const centerX = x + w/2; const centerY = y - h/2;
        // Create an Arcade body using an invisible physics image
        const hit = this.physics.add.image(centerX, centerY, null).setVisible(false).setActive(true);
        hit.body.setAllowGravity(false); hit.body.setImmovable(true);
        hit.setSize(w, h);
        hit.custom = { targetMap, targetSpawn, prompt };
        this.portals.add(hit);
      });
      // Overlap detection
      this.physics.add.overlap(this.player, this.portals, (player, portal) => {
        this.activePortal = portal;
        this.portalPromptShown = false; // allow prompt when re-entering
      });
    }

    _enterPortal(portal){
      if (!portal) return;
      const targetMap = portal.custom && portal.custom.targetMap || 'level1';
      const targetSpawn = portal.custom && portal.custom.targetSpawn || null;
      // Fade and restart
      this.cameras.main.fade(200, 0, 0, 0);
      this.time.delayedCall(220, () => {
        this.scene.restart({ mapKey: targetMap, spawnId: targetSpawn });
      });
    }

    _tryInteract(){
      // find nearest NPC within radius
      const R = 48;
      let best = null, bestD2 = R*R;
      this.npcGroup.children.iterate(npc => {
        if (!npc) return;
        const dx = npc.x - this.player.x, dy = npc.y - this.player.y;
        const d2 = dx*dx + dy*dy;
        if (d2 <= bestD2){ bestD2 = d2; best = npc; }
      });
      if (best){
        const cid = best.custom && best.custom.dialogueId;
        if (cid && this.game.dialogue){
          this.game.dialogue.start(cid);
        } else {
          const text = (best.custom && best.custom.dialogue) || '...';
          // Emit a global talk event for HUD scene to display
          this.game.events.emit('talk', { text, x: best.x, y: best.y - 40 });
        }
      }
    }

    update(time, delta){
      // Portal proximity hint
      if (this.activePortal && !this.portalPromptShown){
        const p = this.activePortal;
        const prompt = p.custom && p.custom.prompt || 'Press E to travel';
        this.game.events.emit('hud:toast', { text: prompt });
        this.portalPromptShown = true;
      }
      const accel = C.PLAYER.ACCEL || 600;
      let ax = 0, ay = 0;
      if (this.cursors.left.isDown || this.wasd.left.isDown) ax -= 1;
      if (this.cursors.right.isDown || this.wasd.right.isDown) ax += 1;
      if (this.cursors.up.isDown || this.wasd.up.isDown) ay -= 1;
      if (this.cursors.down.isDown || this.wasd.down.isDown) ay += 1;
      if (ax !== 0 && ay !== 0){ ax *= Math.SQRT1_2; ay *= Math.SQRT1_2; }
      this.player.setAcceleration(ax * accel, ay * accel);

      const moving = Math.abs(ax) + Math.abs(ay) > 0;
      if (moving){
        // emit a throttled movement event for quests
        if (!this.lastMoveEventTime || (time - this.lastMoveEventTime) > 500){
          this.game.events.emit('player:moved', {});
          this.lastMoveEventTime = time;
        }
        const angle = Math.atan2(ay, ax); // -pi..pi
        const deg = (angle*180/Math.PI + 360) % 360;
        let dir = 'down';
        if (deg >= 337.5 || deg < 22.5) dir = 'right';
        else if (deg < 67.5) dir = 'downRight';
        else if (deg < 112.5) dir = 'down';
        else if (deg < 157.5) dir = 'downLeft';
        else if (deg < 202.5) dir = 'left';
        else if (deg < 247.5) dir = 'upLeft';
        else if (deg < 292.5) dir = 'up';
        else dir = 'upRight';
        if (dir !== this.currentDirection){ this.currentDirection = dir; this.player.play('walk-'+dir, true); }
        else if (!this.player.anims.isPlaying){ this.player.play('walk-'+dir, true); }
      } else {
        this.player.setAcceleration(0,0);
        if (this.player.anims) this.player.anims.stop();
        // Ensure idle frame matches current facing direction (first frame of the row)
        const dir = this.currentDirection || 'down';
        const row = (dir === 'down') ? 0 :
                    (dir === 'up') ? 1 :
                    (dir === 'left') ? 2 :
                    (dir === 'right') ? 3 :
                    (dir === 'downLeft') ? 4 :
                    (dir === 'downRight') ? 5 :
                    (dir === 'upLeft') ? 6 :
                    (dir === 'upRight') ? 7 : 0;
        const idleFrame = row * 2; // first frame of the row
        this.player.setFrame(idleFrame);
      }

      // Update NPCs
      if (this.npcGroup){
        this.npcGroup.children.iterate(npc => { if (npc) this._updateNPC(npc, time); });
      }

      // Interaction key (portals have priority)
      if (Phaser.Input.Keyboard.JustDown(this.keyE)){
        let portalHit = null;
        if (this.portals){
          this.physics.overlap(this.player, this.portals, (player, portal) => { portalHit = portal; });
        }
        if (portalHit){ this._enterPortal(portalHit); }
        else { this._tryInteract(); }
      }
    }
  }

  window.GameWorldScene = GameWorldScene;
})();
