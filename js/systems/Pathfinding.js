(function(){
  'use strict';

  // Very small synchronous A* pathfinder for Phaser tilemaps (orthogonal)
  // Uses the collision layer to mark blocked tiles (tiles with collide=true are blocked)
  function Pathfinding(game, map, collisionLayer){
    this.game = game;
    this.map = map;
    this.layer = collisionLayer;
    this.tileW = map.tileWidth;
    this.tileH = map.tileHeight;
    this.width = map.width;
    this.height = map.height;

    this.grid = this._buildGrid();
  }

  Pathfinding.prototype._isBlockedTile = function(t){
    // Consider tile blocked if it exists and has collide=true property or index 1 (fallback)
    if (!t) return false;
    if (t.properties && (t.properties.collide === true || t.properties['collide'] === true)) return true;
    // if collision set by index, treat index 1 as wall by convention (as in current map)
    return t.index === 1;
  };

  Pathfinding.prototype._buildGrid = function(){
    var grid = new Array(this.height);
    for (var y=0;y<this.height;y++){
      grid[y] = new Array(this.width);
      for (var x=0;x<this.width;x++){
        var tile = this.map.getTile(x, y, this.layer, true);
        grid[y][x] = this._isBlockedTile(tile) ? 1 : 0; // 1 = blocked, 0 = free
      }
    }
    return grid;
  };

  Pathfinding.prototype.rebuild = function(){
    this.grid = this._buildGrid();
  };

  Pathfinding.prototype.worldToTile = function(wx, wy){
    return { tx: Math.max(0, Math.min(this.width-1, Math.floor(wx / this.tileW))),
             ty: Math.max(0, Math.min(this.height-1, Math.floor(wy / this.tileH))) };
  };

  Pathfinding.prototype.tileToWorld = function(tx, ty){
    return { x: tx * this.tileW + this.tileW/2, y: ty * this.tileH + this.tileH/2 };
  };

  // 4-directional A*
  Pathfinding.prototype.findPath = function(sx, sy, tx, ty){
    var start = this.worldToTile(sx, sy);
    var goal = this.worldToTile(tx, ty);

    var w = this.width, h = this.height;
    var grid = this.grid;

    function key(x,y){ return x+','+y; }
    function heur(ax, ay, bx, by){ return Math.abs(ax-bx) + Math.abs(ay-by); }

    var open = [];
    var gScore = {}; // cost from start
    var fScore = {};
    var cameFrom = {};

    var skey = key(start.tx, start.ty);
    gScore[skey] = 0;
    fScore[skey] = heur(start.tx, start.ty, goal.tx, goal.ty);
    open.push({x:start.tx, y:start.ty, f:fScore[skey]});

    var visited = {};

    while (open.length){
      // get node with lowest f
      open.sort(function(a,b){ return a.f-b.f; });
      var cur = open.shift();
      var ckey = key(cur.x, cur.y);
      if (visited[ckey]) continue;
      visited[ckey] = true;

      if (cur.x === goal.tx && cur.y === goal.ty){
        // reconstruct
        var path = [];
        var k = ckey;
        while (k){
          var parts = k.split(',');
          var px = parseInt(parts[0],10), py = parseInt(parts[1],10);
          path.push({x:px, y:py});
          k = cameFrom[k];
        }
        path.reverse();
        // convert to world points
        var worldPts = path.map(function(pt){ return { x: pt.x * this.tileW + this.tileW/2, y: pt.y * this.tileH + this.tileH/2 }; }, this);
        return worldPts;
      }

      // neighbors 4-dir
      var dirs = [ {dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1} ];
      for (var i=0;i<dirs.length;i++){
        var nx = cur.x + dirs[i].dx;
        var ny = cur.y + dirs[i].dy;
        if (nx<0||ny<0||nx>=w||ny>=h) continue;
        if (grid[ny][nx] === 1) continue; // blocked
        var nkey = key(nx, ny);
        var tentativeG = (gScore[ckey] || Infinity) + 1;
        if (tentativeG < (gScore[nkey] || Infinity)){
          cameFrom[nkey] = ckey;
          gScore[nkey] = tentativeG;
          fScore[nkey] = tentativeG + heur(nx, ny, goal.tx, goal.ty);
          open.push({x:nx, y:ny, f:fScore[nkey]});
        }
      }
    }

    return null; // no path
  };

  window.Pathfinding = Pathfinding;
})();
