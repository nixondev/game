/*
  Phaser 2 (CE) Top‑Down RPG Proof of Concept
  - No external assets: generate textures at runtime
  - Player movement with WASD / Arrow keys
  - World bounds, walls, collisions
  - Camera follow and simple HUD text

  Getting started:
  1) Open index.html in a browser (no server needed).
  2) Use arrows or WASD to move the player square around.
  3) Bump into walls and see collision working.
*/

(function () {
  'use strict';

  var WIDTH = 800;
  var HEIGHT = 600;
  var WORLD_SIZE = { w: 1600, h: 1200 };

  var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game-container', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  var player;
  var cursors;
  var wasd;
  var walls;
  var hudText;

  function preload() {
    // Create a simple square texture for the player
    var bmd = game.add.bitmapData(32, 32);
    bmd.ctx.fillStyle = '#4fc3f7';
    bmd.ctx.fillRect(0, 0, 32, 32);
    bmd.ctx.fillStyle = '#ffffff';
    bmd.ctx.fillRect(12, 6, 4, 8); // simple "face"
    bmd.ctx.fillRect(8, 20, 16, 6);
    game.cache.addBitmapData('playerTex', bmd);

    // Wall texture
    var wbmd = game.add.bitmapData(64, 64);
    wbmd.ctx.fillStyle = '#455a64';
    wbmd.ctx.fillRect(0, 0, 64, 64);
    wbmd.ctx.fillStyle = '#546e7a';
    for (var i = 0; i < 64; i += 8) {
      wbmd.ctx.fillRect(i, 0, 2, 64);
    }
    game.cache.addBitmapData('wallTex', wbmd);

    // Ground texture (tiled background)
    var gbmd = game.add.bitmapData(64, 64);
    gbmd.ctx.fillStyle = '#2e7d32';
    gbmd.ctx.fillRect(0, 0, 64, 64);
    gbmd.ctx.fillStyle = '#388e3c';
    for (var x = 0; x < 64; x += 8) {
      for (var y = 0; y < 64; y += 8) {
        gbmd.ctx.fillRect(x, y, 2, 2);
      }
    }
    game.cache.addBitmapData('grassTex', gbmd);
  }

  function create() {
    game.stage.backgroundColor = '#1b5e20';

    game.world.setBounds(0, 0, WORLD_SIZE.w, WORLD_SIZE.h);

    // Add a large tiled ground sprite to cover the world
    var ground = game.add.tileSprite(0, 0, WORLD_SIZE.w, WORLD_SIZE.h, game.cache.getBitmapData('grassTex'));
    ground.fixedToCamera = false;

    // Enable Arcade Physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Create walls group
    walls = game.add.group();
    walls.enableBody = true;
    walls.physicsBodyType = Phaser.Physics.ARCADE;

    // Place some walls to form simple rooms/corridors
    var wallTex = game.cache.getBitmapData('wallTex');

    function createWall(x, y, w, h) {
      var s = walls.create(x, y, wallTex);
      s.scale.setTo(w / 64, h / 64);
      s.body.immovable = true;
      s.body.collideWorldBounds = true;
      return s;
    }

    // Outer border walls
    createWall(0, 0, WORLD_SIZE.w, 64);
    createWall(0, WORLD_SIZE.h - 64, WORLD_SIZE.w, 64);
    createWall(0, 64, 64, WORLD_SIZE.h - 128);
    createWall(WORLD_SIZE.w - 64, 64, 64, WORLD_SIZE.h - 128);

    // Inner obstacles
    createWall(300, 200, 400, 64);
    createWall(700, 500, 64, 400);
    createWall(1000, 300, 300, 64);
    createWall(1100, 800, 64, 250);

    // Create player
    player = game.add.sprite(200, 150, game.cache.getBitmapData('playerTex'));
    player.anchor.set(0.5);

    // Physics for player
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.body.drag.set(600);
    player.body.maxVelocity.set(250);

    // Camera follow
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    // Input
    cursors = game.input.keyboard.createCursorKeys();
    wasd = {
      up: game.input.keyboard.addKey(Phaser.Keyboard.W),
      left: game.input.keyboard.addKey(Phaser.Keyboard.A),
      down: game.input.keyboard.addKey(Phaser.Keyboard.S),
      right: game.input.keyboard.addKey(Phaser.Keyboard.D)
    };

    // HUD text
    hudText = game.add.text(10, 10,
      'Top‑Down RPG POC\nMove: Arrows or WASD\nWorld: 1600x1200 with walls',
      { font: '14px Arial', fill: '#ffffff' }
    );
    hudText.fixedToCamera = true;
  }

  function update() {
    // Collisions
    game.physics.arcade.collide(player, walls);

    var accel = 600;
    var vx = 0, vy = 0;

    if (cursors.left.isDown || wasd.left.isDown) {
      vx -= accel;
    }
    if (cursors.right.isDown || wasd.right.isDown) {
      vx += accel;
    }
    if (cursors.up.isDown || wasd.up.isDown) {
      vy -= accel;
    }
    if (cursors.down.isDown || wasd.down.isDown) {
      vy += accel;
    }

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    player.body.acceleration.set(vx, vy);

    // Face the movement direction (optional visual feedback)
    if (Math.abs(vx) + Math.abs(vy) > 1) {
      player.rotation = Math.atan2(vy, vx);
    }
  }

  function render() {
    // Uncomment for debug info
    // game.debug.cameraInfo(game.camera, 10, 80);
    // game.debug.body(player);
    // walls.forEachAlive(function (w) { game.debug.body(w); }, this);
  }
})();
