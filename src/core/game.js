/**
 * Main Game Engine
 * Core game loop and state management for RacerUN
 */

const Game = {
  // Core properties
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  
  // Game state
  running: false,
  paused: false,
  gameState: 'start', // start, playing, paused, gameover
  
  // Timing
  lastTime: 0,
  dt: 0,
  fps: 60,
  
  // Assets
  spritesImage: null,
  backgroundImages: {},
  
  // Game objects
  player: null,
  road: null,
  traffic: null,
  input: null,
  audio: null,
  ui: null,
  
  // Game progress
  score: 0,
  distance: 0,
  level: 1,
  currentLapTime: 0,
  lastLapTime: null,
  bestLapTime: null,
  
  // Configuration
  settings: {
    theme: 'DAY',
    difficulty: 'NORMAL',
    music: true,
    sfx: true,
    carSkin: 'red'
  },
  
  /**
   * Initialize the game
   */
  init: function(canvasId) {
    var self = this;
    
    // Setup canvas
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas not found: ' + canvasId);
      return this;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = Config.WIDTH;
    this.height = Config.HEIGHT;
    
    // Set canvas size
    this.resize();
    
    // Initialize subsystems
    this.player = Object.create(Player).init({ skin: this.settings.carSkin });
    this.road = Object.create(Road).init().setTheme(this.settings.theme);
    this.traffic = Object.create(Traffic).init();
    this.input = Object.create(Input).init({
      onPause: this.togglePause.bind(this),
      onAction: this.onAction.bind(this)
    });
    this.audio = Object.create(AudioManager).init();
    this.ui = Object.create(UIManager).init(this.canvas);
    
    // Load assets
    this.loadAssets(function() {
      self.setupSpriteConstants();
      self.createTrack();
      self.setupTouchControls();
      self.setupEventListeners();
      self.startGameLoop();
    });
    
    return this;
  },
  
  /**
   * Resize canvas to fit window
   */
  resize: function() {
    var aspect = Config.WIDTH / Config.HEIGHT;
    var windowAspect = window.innerWidth / window.innerHeight;
    
    if (windowAspect < aspect) {
      this.canvas.style.width = '100%';
      this.canvas.style.height = 'auto';
    } else {
      this.canvas.style.height = '100%';
      this.canvas.style.width = 'auto';
    }
    
    this.canvas.width = Config.WIDTH;
    this.canvas.height = Config.HEIGHT;
    
    return this;
  },
  
  /**
   * Load all game assets
   */
  loadAssets: function(callback) {
    var self = this;
    var loaded = 0;
    var total = 2; // sprites + backgrounds
    
    // Load sprites
    this.spritesImage = new Image();
    this.spritesImage.onload = function() {
      loaded++;
      if (loaded >= total) callback();
    };
    this.spritesImage.src = 'images/sprites.png';
    
    // Load backgrounds
    var bgNames = ['sky', 'hills', 'trees'];
    bgNames.forEach(function(name) {
      self.backgroundImages[name] = new Image();
      self.backgroundImages[name].onload = function() {
        loaded++;
        total++; // Account for each background
      };
      self.backgroundImages[name].src = 'images/background/' + name + '.png';
    });
    
    // Fallback if images fail
    setTimeout(function() {
      if (loaded < total) callback();
    }, 5000);
  },
  
  /**
   * Setup sprite constants from loaded image
   */
  setupSpriteConstants: function() {
    // Define sprite coordinates (matching the original sprites.png layout)
    Config.SPRITES = {
      PALM_TREE: { x: 5, y: 5, w: 215, h: 540 },
      BILLBOARD08: { x: 230, y: 5, w: 385, h: 265 },
      TREE1: { x: 625, y: 5, w: 360, h: 360 },
      DEAD_TREE1: { x: 5, y: 555, w: 135, h: 332 },
      BILLBOARD09: { x: 150, y: 555, w: 328, h: 282 },
      BOULDER3: { x: 230, y: 280, w: 320, h: 220 },
      COLUMN: { x: 995, y: 5, w: 200, h: 315 },
      BILLBOARD01: { x: 625, y: 375, w: 300, h: 170 },
      BILLBOARD06: { x: 488, y: 555, w: 298, h: 190 },
      BILLBOARD05: { x: 5, y: 897, w: 298, h: 190 },
      BILLBOARD07: { x: 313, y: 897, w: 298, h: 190 },
      BOULDER2: { x: 621, y: 897, w: 298, h: 140 },
      TREE2: { x: 1205, y: 5, w: 282, h: 295 },
      BILLBOARD04: { x: 1205, y: 310, w: 268, h: 170 },
      DEAD_TREE2: { x: 1205, y: 490, w: 150, h: 260 },
      BOULDER1: { x: 1205, y: 760, w: 168, h: 248 },
      BUSH1: { x: 5, y: 1097, w: 240, h: 155 },
      CACTUS: { x: 929, y: 897, w: 235, h: 118 },
      BUSH2: { x: 255, y: 1097, w: 232, h: 152 },
      BILLBOARD03: { x: 5, y: 1262, w: 230, h: 220 },
      BILLBOARD02: { x: 245, y: 1262, w: 215, h: 220 },
      STUMP: { x: 995, y: 330, w: 195, h: 140 },
      SEMI: { x: 1365, y: 490, w: 122, h: 144 },
      TRUCK: { x: 1365, y: 644, w: 100, h: 78 },
      CAR03: { x: 1383, y: 760, w: 88, h: 55 },
      CAR02: { x: 1383, y: 825, w: 80, h: 59 },
      CAR04: { x: 1383, y: 894, w: 80, h: 57 },
      CAR01: { x: 1205, y: 1018, w: 80, h: 56 },
      PLAYER_UPHILL_LEFT: { x: 1383, y: 961, w: 80, h: 45 },
      PLAYER_UPHILL_STRAIGHT: { x: 1295, y: 1018, w: 80, h: 45 },
      PLAYER_UPHILL_RIGHT: { x: 1385, y: 1018, w: 80, h: 45 },
      PLAYER_LEFT: { x: 995, y: 480, w: 80, h: 41 },
      PLAYER_STRAIGHT: { x: 1085, y: 480, w: 80, h: 41 },
      PLAYER_RIGHT: { x: 995, y: 531, w: 80, h: 41 }
    };
    
    Config.SPRITES.SCALE = 0.3 * (1 / Config.SPRITES.PLAYER_STRAIGHT.w);
    Config.SPRITES.BILLBOARDS = [
      Config.SPRITES.BILLBOARD01, Config.SPRITES.BILLBOARD02, Config.SPRITES.BILLBOARD03,
      Config.SPRITES.BILLBOARD04, Config.SPRITES.BILLBOARD05, Config.SPRITES.BILLBOARD06,
      Config.SPRITES.BILLBOARD07, Config.SPRITES.BILLBOARD08, Config.SPRITES.BILLBOARD09
    ];
    Config.SPRITES.PLANTS = [
      Config.SPRITES.TREE1, Config.SPRITES.TREE2, Config.SPRITES.DEAD_TREE1,
      Config.SPRITES.DEAD_TREE2, Config.SPRITES.PALM_TREE, Config.SPRITES.BUSH1,
      Config.SPRITES.BUSH2, Config.SPRITES.CACTUS, Config.SPRITES.STUMP,
      Config.SPRITES.BOULDER1, Config.SPRITES.BOULDER2, Config.SPRITES.BOULDER3
    ];
    Config.SPRITES.CARS = [
      Config.SPRITES.CAR01, Config.SPRITES.CAR02, Config.SPRITES.CAR03,
      Config.SPRITES.CAR04, Config.SPRITES.SEMI, Config.SPRITES.TRUCK
    ];
    
    // Background layer definitions
    Config.BACKGROUND = {
      HILLS: { x: 5, y: 5, w: 1280, h: 480 },
      SKY: { x: 5, y: 495, w: 1280, h: 480 },
      TREES: { x: 5, y: 985, w: 1280, h: 480 }
    };
    
    // Speed constants
    Config.skySpeed = 0.001;
    Config.hillSpeed = 0.002;
    Config.treeSpeed = 0.003;
  },
  
  /**
   * Create the race track
   */
  createTrack: function() {
    // Generate procedural track
    this.road.createTrack({
      sections: [
        { type: 'straight', length: 50 },
        { type: 'curve', curve: 2, length: 50 },
        { type: 'straight', length: 30 },
        { type: 'curve', curve: -2, length: 50 },
        { type: 'hill', y: 100, length: 40 },
        { type: 'straight', length: 30 },
        { type: 'hill', y: -100, length: 40 },
        { type: 'curve', curve: 3, length: 60 },
        { type: 'straight', length: 100 },
        { type: 'curve', curve: -3, length: 50 },
        { type: 'straight', length: 80 }
      ]
    });
    
    // Add roadside decorations
    this.road.populateSprites();
    
    return this;
  },
  
  /**
   * Setup touch controls for mobile
   */
  setupTouchControls: function() {
    var touchContainer = document.getElementById('touch-controls');
    if (touchContainer && Config.MOBILE.ENABLE_TOUCH) {
      this.input.setupTouchControls(touchContainer);
    }
    return this;
  },
  
  /**
   * Setup event listeners
   */
  setupEventListeners: function() {
    var self = this;
    
    // Handle window resize
    window.addEventListener('resize', function() {
      self.resize();
    });
    
    // Handle canvas clicks for menu navigation
    this.canvas.addEventListener('click', function(e) {
      if (self.gameState !== 'playing') {
        self.ui.handleClick(e.clientX, e.clientY);
      }
    });
    
    // Prevent context menu on canvas
    this.canvas.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
    
    return this;
  },
  
  /**
   * Start the game loop
   */
  startGameLoop: function() {
    var self = this;
    this.running = true;
    this.lastTime = Utils.timestamp();
    
    function loop() {
      if (self.running) {
        requestAnimationFrame(loop);
        self.frame();
      }
    }
    
    loop();
    return this;
  },
  
  /**
   * Main game frame
   */
  frame: function() {
    var now = Utils.timestamp();
    this.dt = Math.min(1, (now - this.lastTime) / 1000);
    this.lastTime = now;
    
    // Update
    if (this.gameState === 'playing' && !this.paused) {
      this.update(this.dt);
    }
    
    // Render
    this.render();
  },
  
  /**
   * Update game logic
   */
  update: function(dt) {
    var segmentLength = Config.SEGMENT_LENGTH;
    
    // Get input state
    var input = this.input.getState();
    
    // Calculate derived values
    var maxSpeed = segmentLength / Config.STEP;
    this.player.maxSpeed = maxSpeed * Config.PLAYER.MAX_SPEED_RATIO;
    
    // Update player
    var playerSegment = this.road.findSegment(this.position + this.player.z);
    this.road.playerSegment = playerSegment;
    
    this.player.update(dt, input, {
      playerSegment: playerSegment,
      position: this.position,
      trackLength: this.road.trackLength
    });
    
    // Update position
    var startPos = this.position;
    this.position = Utils.increase(this.position, dt * this.player.speed, this.road.trackLength);
    
    // Update distance and score
    var deltaZ = this.position - startPos;
    if (deltaZ < 0) deltaZ += this.road.trackLength;
    this.distance += deltaZ;
    this.score += Math.floor(deltaZ / segmentLength) * Config.SCORING.DISTANCE_POINTS;
    
    // Lap timing
    if (this.position < startPos) {
      // Crossed finish line
      if (this.currentLapTime > 0) {
        this.lastLapTime = this.currentLapTime;
        if (!this.bestLapTime || this.lastLapTime < this.bestLapTime) {
          this.bestLapTime = this.lastLapTime;
        }
      }
      this.currentLapTime = 0;
    } else {
      this.currentLapTime += dt;
    }
    
    // Level progression
    var newLevel = Math.floor(this.distance / (Config.DIFFICULTY.LEVEL_DISTANCE * segmentLength)) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.audio.playSFX('levelUp');
      this.increaseDifficulty();
    }
    
    // Update traffic
    this.traffic.setReferences(
      this.road.segments,
      this.road.trackLength,
      maxSpeed,
      this.player.speed
    );
    this.traffic.update(dt, playerSegment, this.player.x, this.player.width);
    
    // Check near misses
    this.traffic.checkNearMisses(this.player.x, this.player.width, function() {
      this.score += Config.SCORING.NEAR_MISS_BONUS;
      this.audio.playSFX('nearMiss');
    }.bind(this));
    
    // Update HUD
    this.updateHUD();
  },
  
  /**
   * Render the game
   */
  render: function() {
    var ctx = this.ctx;
    var w = this.width;
    var h = this.height;
    
    // Clear screen
    ctx.clearRect(0, 0, w, h);
    
    // Render based on game state
    switch (this.gameState) {
      case 'start':
        this.ui.renderStartScreen({
          onPlay: this.startPlaying.bind(this),
          onCars: this.showCarSelect.bind(this),
          onSettings: this.showSettings.bind(this),
          onHelp: this.showHelp.bind(this)
        });
        break;
        
      case 'playing':
        this.renderGame();
        if (this.paused) {
          this.ui.renderPause(
            this.togglePause.bind(this),
            this.restart.bind(this),
            this.quitToMenu.bind(this)
          );
        }
        break;
        
      case 'gameover':
        this.renderGame();
        this.ui.renderGameOver(
          this.score,
          this.ui.highScore,
          this.restart.bind(this),
          this.quitToMenu.bind(this)
        );
        break;
    }
  },
  
  /**
   * Render the actual game view
   */
  renderGame: function() {
    var ctx = this.ctx;
    var w = this.width;
    var h = this.height;
    var resolution = h / Config.HEIGHT;
    
    // Calculate camera parameters
    var baseSegment = this.road.findSegment(this.position);
    var basePercent = Utils.percentRemaining(this.position, Config.SEGMENT_LENGTH);
    var playerPercent = Utils.percentRemaining(this.position + this.player.z, Config.SEGMENT_LENGTH);
    var playerY = Utils.interpolate(
      baseSegment.p1.world.y,
      baseSegment.p2.world.y,
      playerPercent
    );
    
    var cameraDepth = 1 / Math.tan((Config.FIELD_OF_VIEW / 2) * Math.PI / 180);
    var cameraX = this.player.x * Config.ROAD_WIDTH;
    var cameraY = Config.CAMERA_HEIGHT + playerY;
    var cameraZ = this.position;
    
    // Draw background layers
    if (this.backgroundImages.sky) {
      Render.background(ctx, this.backgroundImages.sky, w, h, 
                        Config.BACKGROUND.SKY, this.road.skyOffset, 0);
    }
    if (this.backgroundImages.hills) {
      Render.background(ctx, this.backgroundImages.hills, w, h,
                        Config.BACKGROUND.HILLS, this.road.hillOffset, 0);
    }
    if (this.backgroundImages.trees) {
      Render.background(ctx, this.backgroundImages.trees, w, h,
                        Config.BACKGROUND.TREES, this.road.treeOffset, 0);
    }
    
    // Draw road
    this.road.render(ctx, w, h, resolution, cameraX, cameraY, cameraZ, cameraDepth,
                     baseSegment, Config.DRAW_DISTANCE, Config.FOG_DENSITY, playerY);
    
    // Draw sprites and cars
    for (var n = Config.DRAW_DISTANCE - 1; n > 0; n--) {
      var segment = this.road.segments[(baseSegment.index + n) % this.road.segments.length];
      
      // Render sprites
      this.road.renderSprites(ctx, w, h, resolution, Config.ROAD_WIDTH,
                              this.spritesImage, segment,
                              cameraX, cameraY, cameraZ, cameraDepth,
                              this.player.y ? h : 0);
    }
    
    // Draw player car
    Render.player(ctx, w, h, resolution, Config.ROAD_WIDTH, this.spritesImage,
                  this.player, this.player.steer, this.player.updown);
  },
  
  /**
   * Update HUD display
   */
  updateHUD: function() {
    var speed = Math.round(this.player.speed / 100);
    this.ui.updateHUD('speed', speed);
    this.ui.updateHUD('score', this.score);
    this.ui.updateHUD('distance', Math.floor(this.distance / Config.SEGMENT_LENGTH));
    this.ui.updateHUD('time', Utils.formatTime(this.currentLapTime));
    this.ui.updateHUD('level', this.level);
  },
  
  /**
   * Start playing
   */
  startPlaying: function() {
    this.resetGame();
    this.gameState = 'playing';
    this.paused = false;
    this.ui.setGameState('playing');
    this.audio.playMusic();
    this.audio.playSFX('start');
  },
  
  /**
   * Reset game state
   */
  resetGame: function() {
    this.position = 0;
    this.player.reset();
    this.player.setSkin(this.settings.carSkin);
    this.score = 0;
    this.distance = 0;
    this.level = 1;
    this.currentLapTime = 0;
    this.lastLapTime = null;
    
    // Repopulate traffic based on difficulty
    var trafficCount = Config.DIFFICULTY.INITIAL_TRAFFIC;
    var speedMod = Config.DIFFICULTY.INITIAL_SPEED_MODIFIER;
    this.traffic.populate(this.road.segments, trafficCount, speedMod);
    
    this.ui.clearHUD();
  },
  
  /**
   * Toggle pause
   */
  togglePause: function() {
    if (this.gameState !== 'playing') return;
    
    this.paused = !this.paused;
    if (this.paused) {
      this.audio.pauseMusic();
    } else {
      this.audio.resumeMusic();
      this.lastTime = Utils.timestamp();
    }
  },
  
  /**
   * Restart game
   */
  restart: function() {
    this.startPlaying();
  },
  
  /**
   * Quit to menu
   */
  quitToMenu: function() {
    this.gameState = 'start';
    this.paused = false;
    this.audio.pauseMusic();
    this.ui.setGameState('start');
  },
  
  /**
   * Show game over
   */
  showGameOver: function() {
    this.gameState = 'gameover';
    this.ui.saveHighScore(this.score);
    this.audio.pauseMusic();
  },
  
  /**
   * Increase difficulty for next level
   */
  increaseDifficulty: function() {
    var trafficCount = Config.DIFFICULTY.INITIAL_TRAFFIC + 
                       (this.level - 1) * Config.DIFFICULTY.TRAFFIC_INCREMENT;
    var speedMod = Config.DIFFICULTY.INITIAL_SPEED_MODIFIER + 
                   (this.level - 1) * Config.DIFFICULTY.SPEED_INCREMENT;
    
    this.traffic.clear();
    this.traffic.populate(this.road.segments, trafficCount, speedMod);
  },
  
  /**
   * Show car selection
   */
  showCarSelect: function() {
    var self = this;
    this.ui.renderCarSelect(this.settings.carSkin, function(skin) {
      self.settings.carSkin = skin;
    }, function() {
      self.gameState = 'start';
    });
  },
  
  /**
   * Show settings
   */
  showSettings: function() {
    var self = this;
    this.ui.renderSettings(this.settings, function() {
      // Save settings
      self.road.setTheme(self.settings.theme);
      self.createTrack();
    }, function() {
      self.gameState = 'start';
    });
  },
  
  /**
   * Show help
   */
  showHelp: function() {
    var self = this;
    this.ui.renderHelp(function() {
      self.gameState = 'start';
    });
  },
  
  /**
   * Handle action button
   */
  onAction: function() {
    if (this.gameState === 'start') {
      this.startPlaying();
    }
  },
  
  /**
   * Stop the game
   */
  stop: function() {
    this.running = false;
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
