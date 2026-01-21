(function(){
  'use strict';

  window.MapDB = {
    demo: {
      id: 'demo',
      name: 'Demo Field',
      size: { w: C.WORLD.W, h: C.WORLD.H },
      // Using procedural MapBuilder in code; keep stub for future tilemap
      obstacles: [
        { x: 300, y: 200, w: 400, h: 64 },
        { x: 700, y: 500, w: 64, h: 400 },
        { x: 1000, y: 300, w: 300, h: 64 },
        { x: 1100, y: 800, w: 64, h: 250 }
      ]
    }
  };
})();
