/**
 * Input Handler
 * Manages keyboard and touch input for player controls
 */

const Input = {
  // Key codes
  KEYS: {
    LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
    A: 65, D: 68, S: 83, W: 87,
    ESCAPE: 27, P: 80, ENTER: 13, SPACE: 32
  },

  // Current input state
  state: {
    left: false,
    right: false,
    accelerate: false,
    brake: false,
    pause: false,
    action: false
  },

  // Touch state
  touchState: {
    left: false,
    right: false,
    accelerate: false,
    brake: false
  },

  // Callbacks
  onPause: null,
  onAction: null,

  /**
   * Initialize input handlers
   */
  init: function(options) {
    this.onPause = options.onPause || null;
    this.onAction = options.onAction || null;

    // Keyboard listeners
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));

    // Prevent default scrolling for game keys
    var gameKeys = [this.KEYS.LEFT, this.KEYS.RIGHT, this.KEYS.UP, this.KEYS.DOWN, this.KEYS.SPACE];
    window.addEventListener('keydown', function(e) {
      if (gameKeys.indexOf(e.keyCode) >= 0) {
        e.preventDefault();
      }
    });

    return this;
  },

  /**
   * Handle key down events
   */
  onKeyDown: function(e) {
    switch (e.keyCode) {
      case this.KEYS.LEFT:
      case this.KEYS.A:
        this.state.left = true;
        break;
      case this.KEYS.RIGHT:
      case this.KEYS.D:
        this.state.right = true;
        break;
      case this.KEYS.UP:
      case this.KEYS.W:
        this.state.accelerate = true;
        break;
      case this.KEYS.DOWN:
      case this.KEYS.S:
        this.state.brake = true;
        break;
      case this.KEYS.ESCAPE:
      case this.KEYS.P:
        if (!this.state.pause && this.onPause) {
          this.state.pause = true;
          this.onPause();
        }
        break;
      case this.KEYS.ENTER:
      case this.KEYS.SPACE:
        if (!this.state.action && this.onAction) {
          this.state.action = true;
          this.onAction();
        }
        break;
    }
  },

  /**
   * Handle key up events
   */
  onKeyUp: function(e) {
    switch (e.keyCode) {
      case this.KEYS.LEFT:
      case this.KEYS.A:
        this.state.left = false;
        break;
      case this.KEYS.RIGHT:
      case this.KEYS.D:
        this.state.right = false;
        break;
      case this.KEYS.UP:
      case this.KEYS.W:
        this.state.accelerate = false;
        break;
      case this.KEYS.DOWN:
      case this.KEYS.S:
        this.state.brake = false;
        break;
      case this.KEYS.ESCAPE:
      case this.KEYS.P:
        this.state.pause = false;
        break;
      case this.KEYS.ENTER:
      case this.KEYS.SPACE:
        this.state.action = false;
        break;
    }
  },

  /**
   * Setup touch controls
   */
  setupTouchControls: function(container) {
    if (!container) return;

    var self = this;
    var btnSize = Config.MOBILE.BUTTON_SIZE;
    var opacity = Config.MOBILE.OPACITY;

    // Create touch control buttons
    container.innerHTML = '';
    container.style.cssText = 'position:absolute;bottom:20px;left:0;right:0;height:' + (btnSize + 20) + 'px;z-index:100;pointer-events:none;';

    // Left/Right buttons (left side)
    var leftBtn = this.createTouchButton(-btnSize - 10, btnSize, opacity, '◄');
    var rightBtn = this.createTouchButton(10, btnSize, opacity, '►');

    // Accelerate/Brake buttons (right side)
    var brakeBtn = this.createTouchButton(null, btnSize, opacity, '▼', 'auto', '-=' + (btnSize + 10) + 'px');
    var accelBtn = this.createTouchButton(null, btnSize, opacity, '▲', 'auto', '-10px');

    // Position buttons
    leftBtn.style.cssText += 'left:10px;bottom:10px;';
    rightBtn.style.cssText += 'left:' + (btnSize + 20) + 'px;bottom:10px;';
    brakeBtn.style.cssText += 'right:' + (btnSize + 20) + 'px;bottom:10px;';
    accelBtn.style.cssText += 'right:10px;bottom:10px;';

    // Touch event handlers
    this.bindTouch(leftBtn, 'left');
    this.bindTouch(rightBtn, 'right');
    this.bindTouch(accelBtn, 'accelerate');
    this.bindTouch(brakeBtn, 'brake');

    container.appendChild(leftBtn);
    container.appendChild(rightBtn);
    container.appendChild(accelBtn);
    container.appendChild(brakeBtn);

    return this;
  },

  /**
   * Create a touch button element
   */
  createTouchButton: function(left, size, opacity, label, right, bottom) {
    var btn = document.createElement('div');
    btn.style.cssText = 
      'position:absolute;' +
      'width:' + size + 'px;' +
      'height:' + size + 'px;' +
      'background:rgba(255,255,255,' + opacity + ');' +
      'border:2px solid rgba(255,255,255,0.8);' +
      'border-radius:50%;' +
      'color:#333;' +
      'font-size:' + (size/2) + 'px;' +
      'font-weight:bold;' +
      'display:flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'user-select:none;' +
      'pointer-events:auto;' +
      'cursor:pointer;' +
      'touch-action:none;';
    
    if (left !== null) btn.style.left = left + 'px';
    if (right) btn.style.right = right;
    if (bottom) btn.style.bottom = bottom;
    
    btn.textContent = label;
    return btn;
  },

  /**
   * Bind touch events to input state
   */
  bindTouch: function(element, action) {
    var self = this;
    
    var start = function(e) {
      e.preventDefault();
      self.touchState[action] = true;
      element.style.background = 'rgba(255,255,255,0.8)';
    };
    
    var end = function(e) {
      e.preventDefault();
      self.touchState[action] = false;
      element.style.background = 'rgba(255,255,255,' + Config.MOBILE.OPACITY + ')';
    };

    element.addEventListener('touchstart', start);
    element.addEventListener('touchend', end);
    element.addEventListener('touchcancel', end);
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', end);
    element.addEventListener('mouseleave', end);
  },

  /**
   * Get merged input state (keyboard + touch)
   */
  getState: function() {
    return {
      left: this.state.left || this.touchState.left,
      right: this.state.right || this.touchState.right,
      accelerate: this.state.accelerate || this.touchState.accelerate,
      brake: this.state.brake || this.touchState.brake,
      pause: this.state.pause,
      action: this.state.action
    };
  },

  /**
   * Reset all input states
   */
  reset: function() {
    this.state = {
      left: false,
      right: false,
      accelerate: false,
      brake: false,
      pause: false,
      action: false
    };
    this.touchState = {
      left: false,
      right: false,
      accelerate: false,
      brake: false
    };
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Input;
}
