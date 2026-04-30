/**
 * Traffic Manager
 * Handles AI cars on the road
 */

const Traffic = {
  cars: [],
  
  /**
   * Initialize traffic system
   */
  init: function() {
    this.cars = [];
    return this;
  },
  
  /**
   * Add a car to the road
   */
  addCar: function(z, offset, speed, sprite) {
    this.cars.push({
      z: z,
      offset: offset,
      speed: speed,
      sprite: sprite,
      percent: 0
    });
  },
  
  /**
   * Populate road with traffic
   */
  populate: function(segments, totalCars, speedModifier) {
    this.cars = [];
    
    var cars = Config.TRAFFIC_CARS;
    var segmentLength = Config.SEGMENT_LENGTH;
    var maxSpeed = segmentLength / Config.STEP;
    
    for (var n = 0; n < totalCars; n++) {
      // Random position along track
      var z = Math.floor(Math.random() * segments.length) * segmentLength;
      
      // Random lane offset (-0.8 to 0.8 to stay in road)
      var offset = (Math.random() * 1.6 - 0.8);
      
      // Random speed (30% to 70% of max)
      var speed = maxSpeed * (0.3 + Math.random() * 0.4) * speedModifier;
      
      // Random sprite
      var sprite = Utils.randomChoice(cars);
      
      // Find segment and add car
      var segment = segments[Math.floor(z / segmentLength) % segments.length];
      if (segment) {
        this.addCar(z, offset, speed, sprite);
        segment.cars.push(this.cars[this.cars.length - 1]);
      }
    }
    
    return this;
  },
  
  /**
   * Update all traffic cars
   */
  update: function(dt, playerSegment, playerX, playerW) {
    var segments = this.segments;
    var segmentLength = Config.SEGMENT_LENGTH;
    var trackLength = this.trackLength;
    
    for (var n = 0; n < this.cars.length; n++) {
      var car = this.cars[n];
      var oldSegment = this.findSegment(car.z);
      
      // Update car offset (steering around other cars/player)
      car.offset += this.updateCarOffset(car, oldSegment, playerSegment, playerX, playerW);
      
      // Move car forward
      car.z = Utils.increase(car.z, dt * car.speed, trackLength);
      car.percent = Utils.percentRemaining(car.z, segmentLength);
      
      // Move car to new segment if needed
      var newSegment = this.findSegment(car.z);
      if (oldSegment !== newSegment) {
        var index = oldSegment.cars.indexOf(car);
        if (index >= 0) {
          oldSegment.cars.splice(index, 1);
        }
        newSegment.cars.push(car);
      }
    }
  },
  
  /**
   * Calculate steering offset for a car
   */
  updateCarOffset: function(car, carSegment, playerSegment, playerX, playerW) {
    var lookahead = 20;
    var carW = car.sprite.w * Config.SPRITES.SCALE;
    
    // Don't steer when out of sight
    if ((carSegment.index - playerSegment.index) > Config.DRAW_DISTANCE) {
      return 0;
    }
    
    var dir, segment, otherCar, otherCarW;
    
    // Look ahead for obstacles
    for (var i = 1; i < lookahead; i++) {
      segment = this.segments[(carSegment.index + i) % this.segments.length];
      
      // Check for player collision
      if ((segment === playerSegment) && (car.speed > this.playerSpeed) && 
          Utils.overlap(playerX, playerW, car.offset, carW, 1.2)) {
        if (playerX > 0.5) dir = -1;
        else if (playerX < -0.5) dir = 1;
        else dir = (car.offset > playerX) ? 1 : -1;
        
        return dir * (1/i) * (car.speed - this.playerSpeed) / this.maxSpeed;
      }
      
      // Check for other cars
      for (var j = 0; j < segment.cars.length; j++) {
        otherCar = segment.cars[j];
        otherCarW = otherCar.sprite.w * Config.SPRITES.SCALE;
        
        if ((car.speed > otherCar.speed) && Utils.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
          if (otherCar.offset > 0.5) dir = -1;
          else if (otherCar.offset < -0.5) dir = 1;
          else dir = (car.offset > otherCar.offset) ? 1 : -1;
          
          return dir * (1/i) * (car.speed - otherCar.speed) / this.maxSpeed;
        }
      }
    }
    
    // Steer back on road if off-road
    if (car.offset < -0.9) return 0.1;
    else if (car.offset > 0.9) return -0.1;
    else return 0;
  },
  
  /**
   * Find segment containing a Z position
   */
  findSegment: function(z) {
    return this.segments[Math.floor(z / Config.SEGMENT_LENGTH) % this.segments.length];
  },
  
  /**
   * Clear all traffic
   */
  clear: function() {
    // Remove cars from segments
    for (var i = 0; i < this.segments.length; i++) {
      this.segments[i].cars = [];
    }
    this.cars = [];
  },
  
  /**
   * Set references
   */
  setReferences: function(segments, trackLength, maxSpeed, playerSpeed) {
    this.segments = segments;
    this.trackLength = trackLength;
    this.maxSpeed = maxSpeed;
    this.playerSpeed = playerSpeed;
  },
  
  /**
   * Get near miss detections
   */
  checkNearMisses: function(playerX, playerW, callback) {
    for (var n = 0; n < this.cars.length; n++) {
      var car = this.cars[n];
      var carW = car.sprite.w * Config.SPRITES.SCALE;
      
      // Check if player passed close to this car
      if (Utils.overlap(playerX, playerW, car.offset, carW, 1.5)) {
        if (!car.nearMissCounted) {
          car.nearMissCounted = true;
          if (callback) callback();
        }
      }
    }
  },
  
  /**
   * Reset near miss tracking
   */
  resetNearMissTracking: function() {
    for (var n = 0; n < this.cars.length; n++) {
      this.cars[n].nearMissCounted = false;
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Traffic;
}
