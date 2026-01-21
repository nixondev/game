(function(){
  'use strict';

  // Simple quest manager with states
  // states: 'inactive' | 'active' | 'complete'
  var QuestManager = function(){
    this.state = {}; // id -> state object { id, status }
  };

  QuestManager.prototype.add = function(quest){
    if (!quest || !quest.id) return;
    if (!this.state[quest.id]){
      this.state[quest.id] = { id: quest.id, status: 'inactive' };
    }
  };

  QuestManager.prototype.start = function(id){
    if (!id) return;
    if (!this.state[id]) this.add(window.QuestDB && window.QuestDB[id]);
    if (this.state[id]) this.state[id].status = 'active';
  };

  QuestManager.prototype.complete = function(id){
    if (this.state[id]) this.state[id].status = 'complete';
  };

  QuestManager.prototype.isActive = function(id){
    return this.state[id] && this.state[id].status === 'active';
  };

  QuestManager.prototype.getState = function(id){
    return this.state[id] ? this.state[id].status : 'inactive';
  };

  QuestManager.prototype.getAll = function(){
    var arr = [];
    for (var id in this.state){ if (this.state.hasOwnProperty(id)) arr.push(this.state[id]); }
    return arr;
  };

  window.QuestManager = QuestManager;
})();
