(function(){
  'use strict';

  function DialogueBox(game){
    this.game = game;
    this.bg = game.add.graphics(0, 0);
    this.bg.beginFill(0x000000, 0.6);
    this.bg.drawRect(20, game.height - 200, game.width - 40, 180);
    this.bg.endFill();
    this.bg.fixedToCamera = true;

    this.text = game.add.text(40, game.height - 190, '', { font: '16px Arial', fill: '#ffffff', wordWrap: true, wordWrapWidth: game.width - 80 });
    this.text.fixedToCamera = true;

    this.hide();
  }

  DialogueBox.prototype.show = function(message){
    this.bg.visible = true;
    this.text.visible = true;
    this.text.text = message || '';
  };

  DialogueBox.prototype.showNode = function(node){
    // Render node text and choices enumerated 1..n
    var t = node.text || '';
    if (node.choices && node.choices.length){
      for (var i=0;i<node.choices.length;i++){
        var label = (i+1) + ') ' + (node.choices[i].text || '...');
        t += '\n' + label;
      }
      t += '\n\n[Press number key to choose]';
    }
    this.show(t);
  };

  DialogueBox.prototype.hide = function(){
    this.bg.visible = false;
    this.text.visible = false;
  };

  DialogueBox.prototype.destroy = function(){
    if (this.bg) this.bg.destroy();
    if (this.text) this.text.destroy();
  };

  window.DialogueBox = DialogueBox;
})();
