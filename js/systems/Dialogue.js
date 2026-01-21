(function(){
  'use strict';

  // DialogueManager: handles branching dialogues from DialogueDB and updates DialogueBox UI
  function DialogueManager(game, dialogueBox, questManager){
    this.game = game;
    this.box = dialogueBox;
    this.qm = questManager;
    this.active = false;
    this.current = null; // { treeId, node }
  }

  DialogueManager.prototype.isActive = function(){ return !!this.active; };

  DialogueManager.prototype.startById = function(id){
    var tree = window.DialogueDB && window.DialogueDB[id];
    if (!tree) return false;
    var node = tree.nodes[tree.start];
    if (!node) return false;
    this.current = { treeId: id, nodeId: node.id };
    this.active = true;
    this._render();
    return true;
  };

  DialogueManager.prototype._getNode = function(){
    if (!this.current) return null;
    var tree = window.DialogueDB[this.current.treeId];
    return tree && tree.nodes[this.current.nodeId];
  };

  DialogueManager.prototype._render = function(){
    var node = this._getNode();
    if (!node){ this.end(); return; }
    if (node.choices && node.choices.length){
      this.box.showNode(node);
    } else {
      // leaf node, show text and hint to continue
      this.box.show(node.text + "\n\n[Press Space/E to continue]");
    }
  };

  DialogueManager.prototype._applyEffects = function(effects){
    if (!effects || !effects.length) return;
    for (var i=0;i<effects.length;i++){
      var eff = effects[i];
      if (eff.type === 'startQuest' && this.qm){ this.qm.start(eff.id); }
      if (eff.type === 'completeQuest' && this.qm){ this.qm.complete(eff.id); }
      // Extend with flags/items later
    }
  };

  DialogueManager.prototype.update = function(input){
    if (!this.active) return;
    var node = this._getNode();
    if (!node){ this.end(); return; }

    if (node.choices && node.choices.length){
      var idx = input.choiceIndex(node.choices.length);
      if (idx >= 0){
        var choice = node.choices[idx];
        this._applyEffects(choice.effects);
        if (choice.next){
          this.current.nodeId = choice.next;
          this._render();
        } else {
          this.end();
        }
      }
    } else {
      // advance on next/confirm
      if (input.justPressed('next') || input.justPressed('interact')){
        this.end();
      }
    }
  };

  DialogueManager.prototype.end = function(){
    this.active = false;
    this.current = null;
    if (this.box) this.box.hide();
  };

  window.DialogueManager = DialogueManager;
})();
