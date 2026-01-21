(function(){
  'use strict';

  function Menu(game){
    this.game = game;
    this.container = game.add.group();
    this.container.fixedToCamera = true;
    this.text = game.add.text(10, 40, 'Menu (stub) - press ESC to close', { font: '16px Arial', fill: '#ffffff' });
    this.container.add(this.text);
    this.hide();
  }

  Menu.prototype.show = function(){ this.container.visible = true; };
  Menu.prototype.hide = function(){ this.container.visible = false; };
  Menu.prototype.destroy = function(){ this.container.destroy(true); };

  window.Menu = Menu;
})();
