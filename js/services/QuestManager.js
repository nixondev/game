(function(){
  'use strict';

  function QuestManager(game){
    this.game = game;
    this.active = {}; // id -> { progress: {}, complete: false }
  }

  QuestManager.prototype.start = function(id){
    var q = (window.QuestDB || {})[id];
    if (!q) return;
    if (!this.active[id]){
      this.active[id] = { id: q.id, progress: {}, complete: false };
      this.game.events.emit('hud:toast', { text: 'Quest started: ' + (q.name || id) });
    }
  };

  QuestManager.prototype.onEvent = function(evt){
    if (!evt || !evt.type) return;
    var self = this;
    Object.keys(this.active).forEach(function(id){
      var qDef = (window.QuestDB || {})[id];
      var q = self.active[id];
      if (!qDef || q.complete) return;
      (qDef.goals || []).forEach(function(g){
        if (g.type === evt.type && (!g.target || g.target === evt.target || g.target === 'any')){
          var key = g.type + ':' + (g.target || 'any');
          var cur = q.progress[key] || 0;
          q.progress[key] = Math.min((g.count || 1), cur + 1);
        }
      });
      // check completion
      var done = (qDef.goals || []).every(function(g){
        var key = g.type + ':' + (g.target || 'any');
        return (q.progress[key] || 0) >= (g.count || 1);
      });
      if (done){
        q.complete = true;
        self.game.events.emit('hud:toast', { text: 'Quest complete: ' + (qDef.name || id) });
        if (qDef.reward && qDef.reward.exp){ self.game.events.emit('player:exp', { amount: qDef.reward.exp }); }
      }
    });
  };

  window.QuestManager = QuestManager;
})();
