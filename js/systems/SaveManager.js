(function(){
  'use strict';

  var SaveManager = {
    saveKey: 'phaser2_rpg_save',
    save: function(state){
      try {
        localStorage.setItem(this.saveKey, JSON.stringify(state));
        return true;
      } catch (e) {
        return false;
      }
    },
    load: function(){
      try {
        var raw = localStorage.getItem(this.saveKey);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    clear: function(){
      try { localStorage.removeItem(this.saveKey); } catch (e) {}
    }
  };

  window.SaveManager = SaveManager;
})();
