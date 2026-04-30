/**
 * UI Manager / HUD
 * Handles all UI rendering and menus
 */

const UIManager = {
  canvas: null,
  ctx: null,
  
  // Game state
  gameState: 'start', // start, playing, paused, gameover
  
  // HUD elements
  hud: {
    speed: { value: null, element: null },
    score: { value: null, element: null },
    distance: { value: null, element: null },
    time: { value: null, element: null },
    lap: { value: null, element: null },
    level: { value: null, element: null }
  },
  
  // High scores
  highScore: 0,
  
  /**
   * Initialize UI manager
   */
  init: function(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Load high score
    this.highScore = parseInt(Utils.storage.get('highscore', '0'), 10);
    
    return this;
  },
  
  /**
   * Bind HUD elements to DOM
   */
  bindHUD: function(elements) {
    for (var key in elements) {
      if (this.hud[key]) {
        this.hud[key].element = elements[key];
      }
    }
    return this;
  },
  
  /**
   * Update HUD element
   */
  updateHUD: function(key, value) {
    var el = this.hud[key];
    if (el && el.element && el.value !== value) {
      el.value = value;
      if (el.element instanceof HTMLElement) {
        el.element.textContent = value;
      }
    }
  },
  
  /**
   * Clear HUD
   */
  clearHUD: function() {
    for (var key in this.hud) {
      this.hud[key].value = null;
    }
  },
  
  /**
   * Render start screen
   */
  renderStartScreen: function(callbacks) {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    
    // Background overlay
    Render.overlay(ctx, 'rgba(0,0,0,0.7)', 0.8);
    
    // Title
    Render.text(ctx, 'RACER UN', w/2, h/3, 64, '#FFD700', 'center');
    Render.text(ctx, 'The Ultimate Arcade Racer', w/2, h/3 + 50, 24, '#FFFFFF', 'center');
    
    // Menu buttons
    this.renderButton(w/2, h/2, 200, 50, 'PLAY', callbacks.onPlay);
    this.renderButton(w/2, h/2 + 70, 200, 50, 'CARS', callbacks.onCars);
    this.renderButton(w/2, h/2 + 140, 200, 50, 'SETTINGS', callbacks.onSettings);
    this.renderButton(w/2, h/2 + 210, 200, 50, 'HOW TO PLAY', callbacks.onHelp);
    
    // High score
    Render.text(ctx, 'Best Score: ' + this.highScore, w/2, h - 50, 20, '#FFFF00', 'center');
    
    // Version
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText('v1.0.0', w - 10, h - 10);
  },
  
  /**
   * Render car selection screen
   */
  renderCarSelect: function(selectedSkin, onSelect, onBack) {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    
    Render.overlay(ctx, 'rgba(0,0,0,0.8)', 0.9);
    
    Render.text(ctx, 'SELECT YOUR CAR', w/2, h/4, 48, '#FFFFFF', 'center');
    
    var skins = Config.CAR_SKINS;
    var btnWidth = 150;
    var btnHeight = 60;
    var startY = h/2 - 60;
    
    for (var i = 0; i < skins.length; i++) {
      var skin = skins[i];
      var x = w/2 - btnWidth/2;
      var y = startY + i * (btnHeight + 20);
      var isSelected = selectedSkin === skin.id;
      
      // Button background
      ctx.fillStyle = isSelected ? '#FFD700' : '#444';
      ctx.fillRect(x, y, btnWidth, btnHeight);
      
      // Border
      ctx.strokeStyle = isSelected ? '#FFF' : '#888';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, btnWidth, btnHeight);
      
      // Car color preview
      ctx.fillStyle = skin.color;
      ctx.fillRect(x + 10, y + 10, 40, 40);
      
      // Name
      ctx.fillStyle = isSelected ? '#000' : '#FFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(skin.name, x + 60, y + 35);
    }
    
    // Back button
    this.renderButton(w/2, h - 80, 150, 40, 'BACK', onBack);
  },
  
  /**
   * Render settings screen
   */
  renderSettings: function(settings, onSave, onBack) {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    
    Render.overlay(ctx, 'rgba(0,0,0,0.8)', 0.9);
    
    Render.text(ctx, 'SETTINGS', w/2, h/5, 48, '#FFFFFF', 'center');
    
    // Theme selector
    Render.text(ctx, 'Environment:', w/2 - 100, h/3, 24, '#FFF', 'right');
    this.renderButton(w/2 + 50, h/3 - 12, 150, 30, settings.theme || 'DAY', null);
    
    // Difficulty
    Render.text(ctx, 'Difficulty:', w/2 - 100, h/3 + 50, 24, '#FFF', 'right');
    this.renderButton(w/2 + 50, h/3 + 38, 150, 30, settings.difficulty || 'NORMAL', null);
    
    // Music toggle
    Render.text(ctx, 'Music:', w/2 - 100, h/3 + 100, 24, '#FFF', 'right');
    this.renderButton(w/2 + 50, h/3 + 88, 100, 30, settings.music ? 'ON' : 'OFF', null);
    
    // SFX toggle
    Render.text(ctx, 'SFX:', w/2 - 100, h/3 + 150, 24, '#FFF', 'right');
    this.renderButton(w/2 + 50, h/3 + 138, 100, 30, settings.sfx ? 'ON' : 'OFF', null);
    
    // Save and Back buttons
    this.renderButton(w/2 - 100, h - 80, 150, 40, 'SAVE', onSave);
    this.renderButton(w/2 + 100, h - 80, 150, 40, 'BACK', onBack);
  },
  
  /**
   * Render help screen
   */
  renderHelp: function(onBack) {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    
    Render.overlay(ctx, 'rgba(0,0,0,0.85)', 0.95);
    
    Render.text(ctx, 'HOW TO PLAY', w/2, h/6, 40, '#FFFFFF', 'center');
    
    var instructions = [
      'Arrow Keys or WASD to drive',
      '↑ / W - Accelerate',
      '↓ / S - Brake',
      '← → / A D - Steer',
      '',
      'Stay on the road for max speed!',
      'Avoid traffic and obstacles',
      'Near misses give bonus points',
      '',
      'ESC or P to pause'
    ];
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#CCCCCC';
    ctx.textAlign = 'center';
    
    for (var i = 0; i < instructions.length; i++) {
      ctx.fillText(instructions[i], w/2, h/3 + i * 30);
    }
    
    this.renderButton(w/2, h - 80, 150, 40, 'GOT IT!', onBack);
  },
  
  /**
   * Render pause screen
   */
  renderPause: function(onResume, onRestart, onQuit) {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    
    Render.overlay(ctx, 'rgba(0,0,0,0.6)', 0.7);
    
    Render.text(ctx, 'PAUSED', w/2, h/3, 48, '#FFFFFF', 'center');
    
    this.renderButton(w/2, h/2, 200, 50, 'RESUME', onResume);
    this.renderButton(w/2, h/2 + 70, 200, 50, 'RESTART', onRestart);
    this.renderButton(w/2, h/2 + 140, 200, 50, 'QUIT', onQuit);
  },
  
  /**
   * Render game over screen
   */
  renderGameOver: function(score, bestScore, onRestart, onMenu) {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    
    Render.overlay(ctx, 'rgba(0,0,0,0.7)', 0.85);
    
    Render.text(ctx, 'GAME OVER', w/2, h/4, 56, '#FF4444', 'center');
    
    Render.text(ctx, 'Score: ' + score, w/2, h/2 - 30, 32, '#FFFFFF', 'center');
    Render.text(ctx, 'Best: ' + bestScore, w/2, h/2 + 20, 24, '#FFD700', 'center');
    
    if (score >= bestScore && score > 0) {
      Render.text(ctx, 'NEW HIGH SCORE!', w/2, h/2 + 60, 28, '#00FF00', 'center');
    }
    
    this.renderButton(w/2 - 110, h/2 + 120, 200, 50, 'PLAY AGAIN', onRestart);
    this.renderButton(w/2 + 110, h/2 + 120, 200, 50, 'MENU', onMenu);
  },
  
  /**
   * Render a button
   */
  renderButton: function(x, y, width, height, text, onClick) {
    var ctx = this.ctx;
    
    // Store button data for click handling
    if (!this.buttons) this.buttons = [];
    this.buttons.push({ x: x - width/2, y: y - height/2, width: width, height: height, onClick: onClick });
    
    // Background
    var gradient = ctx.createLinearGradient(x - width/2, y - height/2, x - width/2, y + height/2);
    gradient.addColorStop(0, '#555');
    gradient.addColorStop(1, '#333');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - width/2, y - height/2, width, height);
    
    // Border
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - width/2, y - height/2, width, height);
    
    // Text
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  },
  
  /**
   * Handle button clicks
   */
  handleClick: function(screenX, screenY) {
    if (!this.buttons) return false;
    
    var rect = this.canvas.getBoundingClientRect();
    var scaleX = this.canvas.width / rect.width;
    var scaleY = this.canvas.height / rect.height;
    
    var x = (screenX - rect.left) * scaleX;
    var y = (screenY - rect.top) * scaleY;
    
    for (var i = 0; i < this.buttons.length; i++) {
      var btn = this.buttons[i];
      if (x >= btn.x && x <= btn.x + btn.width &&
          y >= btn.y && y <= btn.y + btn.height) {
        if (btn.onClick) btn.onClick();
        return true;
      }
    }
    return false;
  },
  
  /**
   * Clear buttons array
   */
  clearButtons: function() {
    this.buttons = [];
  },
  
  /**
   * Set game state
   */
  setGameState: function(state) {
    this.gameState = state;
    this.clearButtons();
  },
  
  /**
   * Save high score
   */
  saveHighScore: function(score) {
    if (score > this.highScore) {
      this.highScore = score;
      Utils.storage.set('highscore', score.toString());
      return true;
    }
    return false;
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}
