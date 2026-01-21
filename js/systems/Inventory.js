(function(){
  'use strict';

  var Inventory = function(){
    this.items = [];
  };

  Inventory.prototype.add = function(item){
    this.items.push(item);
  };

  Inventory.prototype.remove = function(predicate){
    this.items = this.items.filter(function(it){ return !predicate(it); });
  };

  Inventory.prototype.list = function(){
    return this.items.slice(0);
  };

  window.Inventory = Inventory;
})();
