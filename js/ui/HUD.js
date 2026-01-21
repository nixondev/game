(function(){
  'use strict';

  function HUD(game, text){
    this.game = game;
    this.textObj = game.add.text(10, 10, text || '', { font: '14px Arial', fill: C.COLORS.HUD_TEXT });
    this.textObj.fixedToCamera = true;
  }

  HUD.prototype.setText = function(t){
    if (this.textObj) this.textObj.text = t;
  };

  HUD.prototype.destroy = function(){
    if (this.textObj) this.textObj.destroy();
  };

  window.HUD = HUD;
})();
