(function(){
  'use strict';

  function DialogueService(game){
    this.game = game; // use game.events for cross-scene communication
    this.active = null; // { id, data, nodeId }
  }

  DialogueService.prototype.start = function(dialogueId){
    var db = (window.DialogueDB || {});
    var data = db[dialogueId];
    if (!data) { return; }
    this.active = { id: dialogueId, data: data, nodeId: data.start };
    this._emitNode();
  };

  DialogueService.prototype.choose = function(choiceIndex){
    if (!this.active) return;
    var node = this._getNode();
    if (!node) return;
    var choice = (node.choices || [])[choiceIndex|0];
    if (!choice) return;

    // Apply effects from the choice
    (choice.effects || []).forEach((e) => {
      if (!e || !e.type) return;
      switch(e.type){
        case 'startQuest':
          this.game.events.emit('quest:start', { id: e.id });
          break;
        case 'giveItem':
          this.game.events.emit('inventory:add', { id: e.id, qty: e.qty || 1 });
          break;
      }
    });

    if (choice.next){
      this.active.nodeId = choice.next;
      this._emitNode();
    } else {
      // end dialogue
      this.game.events.emit('dialogue:close', { id: this.active.id });
      this.active = null;
    }
  };

  DialogueService.prototype._getNode = function(){
    if (!this.active) return null;
    return this.active.data.nodes[this.active.nodeId];
  };

  DialogueService.prototype._emitNode = function(){
    var node = this._getNode();
    if (!node) return;
    this.game.events.emit('dialogue:node', {
      id: this.active.id,
      nodeId: node.id,
      text: node.text,
      choices: (node.choices || []).map(function(c){ return { text: c.text || '' }; })
    });
  };

  window.DialogueService = DialogueService;
})();
