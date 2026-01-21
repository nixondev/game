(function(){
  'use strict';

  function InventoryService(game){
    this.game = game;
    this.items = {}; // { id: count }
  }

  InventoryService.prototype.add = function(id, qty){
    if (!id) return;
    var n = qty || 1;
    this.items[id] = (this.items[id] || 0) + n;
    var name = (window.ItemDB && window.ItemDB[id] && window.ItemDB[id].name) || id;
    this.game.events.emit('hud:toast', { text: 'Got ' + name + ' x' + n });
  };

  InventoryService.prototype.remove = function(id, qty){
    if (!id) return;
    var n = qty || 1;
    var cur = (this.items[id] || 0) - n;
    this.items[id] = cur > 0 ? cur : 0;
  };

  InventoryService.prototype.has = function(id, qty){
    var n = qty || 1;
    return (this.items[id] || 0) >= n;
  };

  InventoryService.prototype.use = function(id){
    if (!this.has(id, 1)) return false;
    var entry = (window.ItemDB || {})[id];
    if (!entry) return false;
    // Apply effects (emit events; world scene should listen)
    if (entry.heal){ this.game.events.emit('player:heal', { amount: entry.heal }); }
    if (entry.atk){ this.game.events.emit('player:atkBuff', { amount: entry.atk, duration: 5000 }); }
    this.remove(id, 1);
    this.game.events.emit('hud:toast', { text: 'Used ' + (entry.name || id) });
    return true;
  };

  window.InventoryService = InventoryService;
})();
