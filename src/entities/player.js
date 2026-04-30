/**
 * Player Car Entity
 * Handles player car physics, movement, and rendering
 */

const Player = {
  // Properties
  x: 0,           // X position (-1 to 1, relative to road center)
  y: 0,           // Y offset for bounce animation
  z: 0,           // Z distance from camera
  speed: 0,       // Current speed
  maxSpeed: 0,    // Maximum speed
  
  // Dimensions
  width: 0,
  height: 0,
  
  // State
  steer: 0,       // Current steering (-1 to 1)
  updown: 0,      // Going uphill flag
  
  // Settings
  accel: 0,
  braking: 0,
  decel: 0,
  offRoadDecel: 0,
  handling: 0,
  
  // Visuals
  skin: 'red',
  sprite: null,
  
  /**
   * Initialize player
   */
  init: function(options) {
    var cfg = Config.PLAYER;
    
    this.x = 0;
    this.speed = 0;
    this.steer = 0;
    this.updown = 0;
    this.skin = options.skin || 'red';
    
    // Dimensions will be set after sprites are loaded
    this.width = 0;
    this.height = 0;
    
    // Physics settings (will be scaled in game init)
    this.accel = cfg.ACCEL;
    this.braking = cfg.BRAKING;
    this.decel = cfg.DECEL;
    this.offRoadDecel = cfg.OFF_ROAD_DECEL;
    this.handling = cfg.HANDLING;
    
    return this;
  },
  
  /**
   * Update player physics and state
   */
  update: function(dt, input, roadState) {
    var segment = roadState.playerSegment;
    var speedRatio = this.speed / this.maxSpeed;
    
    // Steering
    var dx = dt * this.handling * speedRatio;
    
    if (input.left) {
      this.x -= dx;
      this.steer = -1;
    } else if (input.right) {
      this.x += dx;
      this.steer = 1;
    } else {
      this.steer = 0;
    }
    
    // Centrifugal force on curves
    this.x -= dx * speedRatio * segment.curve * Config.CENTRIFUGAL;
    
    // Acceleration/Braking
    if (input.accelerate) {
      this.speed = Utils.accelerate(this.speed, this.accel, dt);
    } else if (input.brake) {
      this.speed = Utils.accelerate(this.speed, this.braking, dt);
    } else {
      this.speed = Utils.accelerate(this.speed, this.decel, dt);
    }
    
    // Off-road deceleration
    if ((this.x < -1) || (this.x > 1)) {
      if (this.speed > this.maxSpeed * Config.OFF_ROAD_LIMIT) {
        this.speed = Utils.accelerate(this.speed, this.offRoadDecel, dt);
      }
      
      // Check collision with roadside objects
      for (var n = 0; n < segment.sprites.length; n++) {
        var sprite = segment.sprites[n];
        var spriteW = sprite.source.w * Config.SPRITES.SCALE;
        var spriteOffset = sprite.offset + spriteW / 2 * (sprite.offset > 0 ? 1 : -1);
        
        if (Utils.overlap(this.x, this.width, spriteOffset, spriteW)) {
          this.speed = this.maxSpeed / 5;
          roadState.position = Utils.increase(segment.p1.world.z, -this.z, roadState.trackLength);
          break;
        }
      }
    }
    
    // Collision with traffic
    for (var i = 0; i < segment.cars.length; i++) {
      var car = segment.cars[i];
      var carW = car.sprite.w * Config.SPRITES.SCALE;
      
      if (this.speed > car.speed) {
        if (Utils.overlap(this.x, this.width, car.offset, carW, 0.8)) {
          this.speed = car.speed * (car.speed / this.speed);
          roadState.position = Utils.increase(car.z, -this.z, roadState.trackLength);
          break;
        }
      }
    }
    
    // Clamp values
    this.x = Utils.limit(this.x, -3, 3);
    this.speed = Utils.limit(this.speed, 0, this.maxSpeed);
    
    // Bounce effect based on speed
    this.y = (1.5 * Math.random() * speedRatio) * Utils.randomChoice([-1, 1]);
    
    // Uphill detection
    this.updown = segment.p2.world.y > segment.p1.world.y ? 1 : 0;
  },
  
  /**
   * Get current sprite based on state
   */
  getSprite: function() {
    if (this.steer < 0) {
      return this.updown > 0 ? Config.SPRITES.PLAYER_UPHILL_LEFT : Config.SPRITES.PLAYER_LEFT;
    } else if (this.steer > 0) {
      return this.updown > 0 ? Config.SPRITES.PLAYER_UPHILL_RIGHT : Config.SPRITES.PLAYER_RIGHT;
    } else {
      return this.updown > 0 ? Config.SPRITES.PLAYER_UPHILL_STRAIGHT : Config.SPRITES.PLAYER_STRAIGHT;
    }
  },
  
  /**
   * Reset player to initial state
   */
  reset: function() {
    this.x = 0;
    this.speed = 0;
    this.steer = 0;
    this.updown = 0;
  },
  
  /**
   * Set player skin
   */
  setSkin: function(skinId) {
    this.skin = skinId;
    // In a full implementation, this would change the sprite
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Player;
}
