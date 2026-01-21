(function(){
  'use strict';

  class HUDScene extends Phaser.Scene {
    constructor(){ super('HUD'); }

    create(){
      // Container for speech bubble
      this.ui = this.add.container(0, 0).setDepth(2000);
      this.ui.setScrollFactor(0);

      // Bubble background
      this.bubble = this.add.graphics();
      this.ui.add(this.bubble);

      // Text inside bubble
      this.text = this.add.text(0, 0, '', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
        wordWrap: { width: 260, useAdvancedWrap: true }
      });
      this.ui.add(this.text);

      // Dialogue choices under bubble
      this.choiceTexts = [];

      // Simple toast text (bottom center)
      this.toast = this.add.text(this.scale.width/2, this.scale.height - 40, '', {
        fontFamily: 'Arial', fontSize: '14px', color: '#ffeb3b'
      }).setOrigin(0.5).setDepth(2002);
      this.toast.setScrollFactor(0);
      this.toast.setVisible(false);

      this.ui.setVisible(false);

      // Listen for global talk events from GameWorldScene
      this._onTalk = (payload) => {
        if (!payload) return;
        const msg = String(payload.text || '...');
        const wx = payload.x || 0;
        const wy = payload.y || 0;
        this._showBubble(msg, wx, wy);
      };
      this.game.events.on('talk', this._onTalk);

      // Dialogue graph events
      this._onDialogueNode = (payload) => {
        if (!payload) return;
        // Try to anchor near player if available
        let wx = 0, wy = 0;
        const world = this.scene.get('GameWorld');
        if (world && world.player){ wx = world.player.x; wy = world.player.y - 60; }
        this._showBubble(String(payload.text||''), wx, wy);
        this._renderChoices(payload.choices || []);
      };
      this._onDialogueClose = () => { this._clearChoices(); this._hideBubble(); };
      this.game.events.on('dialogue:node', this._onDialogueNode);
      this.game.events.on('dialogue:close', this._onDialogueClose);

      // HUD toast events
      this._onToast = (p) => {
        if (!p || !p.text) return;
        this.toast.setText(String(p.text));
        this.toast.setAlpha(1);
        this.toast.setVisible(true);
        if (this.toastTween) { this.toastTween.stop(); this.toastTween = null; }
        this.time.delayedCall(1200, () => {
          this.toastTween = this.tweens.add({ targets: this.toast, alpha: 0, duration: 300, onComplete: () => { this.toast.setVisible(false); this.toast.setAlpha(1); } });
        });
      };
      this.game.events.on('hud:toast', this._onToast);

      // Numeric keys for dialogue choices (1-5)
      this.input.keyboard.on('keydown', (ev) => {
        const k = ev.key;
        const map = { '1':0, '2':1, '3':2, '4':3, '5':4 };
        if (Object.prototype.hasOwnProperty.call(map, k)){
          this.game.events.emit('dialogue:choose', { index: map[k] });
        }
      });

      // Hide on scene sleep
      this.events.on('sleep', () => this._hideBubble());
      this.events.on('shutdown', () => this._cleanup());
      this.events.on('destroy', () => this._cleanup());
    }

    _cleanup(){
      if (this.game && this.game.events){
        this.game.events.off('talk', this._onTalk);
        this.game.events.off('dialogue:node', this._onDialogueNode);
        this.game.events.off('dialogue:close', this._onDialogueClose);
        this.game.events.off('hud:toast', this._onToast);
      }
      this._clearChoices && this._clearChoices();
    }

    _showBubble(text, worldX, worldY){
      // Try to get the main camera from the world scene to convert world->screen
      let cam = null;
      const world = this.scene.get('GameWorld');
      if (world && world.cameras) cam = world.cameras.main;
      if (!cam) cam = this.cameras.main; // fallback, may be 0,0 origin

      const screenX = worldX - cam.worldView.x;
      const screenY = worldY - cam.worldView.y;

      // Set text and compute bubble size
      this.text.setText(text);
      const padding = 8;
      const w = Math.ceil(this.text.width) + padding * 2;
      const h = Math.ceil(this.text.height) + padding * 2;
      this.lastBubbleSize = { w: w, h: h };

      // Draw rounded rectangle background
      this.bubble.clear();
      this.bubble.fillStyle(0x000000, 0.6);
      this._roundedRect(this.bubble, 0, 0, w, h, 6);
      this.bubble.lineStyle(1, 0xffffff, 0.8);
      this._roundedRect(this.bubble, 0.5, 0.5, w-1, h-1, 6);

      // Position elements
      this.text.setPosition(padding, padding);

      // Default position above target
      let px = Math.round(screenX - w/2);
      let py = Math.round(screenY - h - 10);

      // Clamp on screen
      const sw = this.scale.width;
      const sh = this.scale.height;
      if (px < 8) px = 8;
      if (px + w > sw - 8) px = sw - 8 - w;
      if (py < 8) py = Math.min(sh - h - 8, screenY + 10); // place below if too high

      this.ui.setPosition(px, py);
      this.ui.setAlpha(1);
      this.ui.setVisible(true);

      // Reset timer/tween
      if (this.hideEvent) { this.hideEvent.remove(false); this.hideEvent = null; }
      if (this.tween) { this.tween.stop(); this.tween = null; }

      // Auto-hide after 2 seconds with fade
      this.hideEvent = this.time.delayedCall(2000, () => {
        this.tween = this.tweens.add({ targets: this.ui, alpha: 0, duration: 200, onComplete: () => this._hideBubble() });
      });
    }

    _hideBubble(){
      this.ui.setVisible(false);
      this.ui.setAlpha(1);
    }

    _roundedRect(gfx, x, y, w, h, r){
      const rr = Math.min(r, w/2, h/2);
      gfx.beginPath();
      gfx.moveTo(x + rr, y);
      gfx.lineTo(x + w - rr, y);
      gfx.arc(x + w - rr, y + rr, rr, -Math.PI/2, 0);
      gfx.lineTo(x + w, y + h - rr);
      gfx.arc(x + w - rr, y + h - rr, rr, 0, Math.PI/2);
      gfx.lineTo(x + rr, y + h);
      gfx.arc(x + rr, y + h - rr, rr, Math.PI/2, Math.PI);
      gfx.lineTo(x, y + rr);
      gfx.arc(x + rr, y + rr, rr, Math.PI, 1.5*Math.PI);
      gfx.closePath();
      gfx.fillPath();
      gfx.strokePath();
    }

    _renderChoices(choices){
      this._clearChoices();
      if (!choices || !choices.length) return;
      const padding = 8;
      const bubbleH = (this.lastBubbleSize && this.lastBubbleSize.h) || 0;
      const startY = this.ui.y + bubbleH + 6;
      choices.forEach((c, idx) => {
        const t = this.add.text(this.ui.x + padding, startY + idx * 18, '['+(idx+1)+'] ' + (c.text||''), {
          fontFamily: 'Arial', fontSize: '14px', color: '#ffeb3b'
        }).setDepth(2001);
        t.setScrollFactor(0);
        this.choiceTexts.push(t);
      });
    }

    _clearChoices(){
      (this.choiceTexts||[]).forEach(t => t.destroy());
      this.choiceTexts = [];
    }
  }

  window.HUDScene = HUDScene;
})();
