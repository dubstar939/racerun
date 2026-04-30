/**
 * Utility Functions
 * General purpose math and helper functions
 */

const Utils = {
  /**
   * Get current timestamp in milliseconds
   */
  timestamp: function() {
    return Date.now();
  },

  /**
   * Parse integer with default value
   */
  toInt: function(obj, def) {
    if (obj !== null) {
      var x = parseInt(obj, 10);
      if (!isNaN(x)) return x;
    }
    return this.toInt(def, 0);
  },

  /**
   * Parse float with default value
   */
  toFloat: function(obj, def) {
    if (obj !== null) {
      var x = parseFloat(obj);
      if (!isNaN(x)) return x;
    }
    return this.toFloat(def, 0.0);
  },

  /**
   * Clamp value between min and max
   */
  limit: function(value, min, max) {
    return Math.max(min, Math.min(value, max));
  },

  /**
   * Random integer between min and max (inclusive)
   */
  randomInt: function(min, max) {
    return Math.round(this.interpolate(min, max, Math.random()));
  },

  /**
   * Random choice from array
   */
  randomChoice: function(options) {
    return options[this.randomInt(0, options.length - 1)];
  },

  /**
   * Get percentage remaining after dividing by total
   */
  percentRemaining: function(n, total) {
    return (n % total) / total;
  },

  /**
   * Accelerate/decelerate value
   */
  accelerate: function(v, accel, dt) {
    return v + (accel * dt);
  },

  /**
   * Linear interpolation
   */
  interpolate: function(a, b, percent) {
    return a + (b - a) * percent;
  },

  /**
   * Ease in interpolation
   */
  easeIn: function(a, b, percent) {
    return a + (b - a) * Math.pow(percent, 2);
  },

  /**
   * Ease out interpolation
   */
  easeOut: function(a, b, percent) {
    return a + (b - a) * (1 - Math.pow(1 - percent, 2));
  },

  /**
   * Ease in/out interpolation
   */
  easeInOut: function(a, b, percent) {
    return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
  },

  /**
   * Exponential fog calculation
   */
  exponentialFog: function(distance, density) {
    return 1 / Math.pow(Math.E, distance * distance * density);
  },

  /**
   * Increase value with looping (wrap around)
   */
  increase: function(start, increment, max) {
    var result = start + increment;
    while (result >= max) result -= max;
    while (result < 0) result += max;
    return result;
  },

  /**
   * Project 3D world point to 2D screen
   */
  project: function(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth / p.camera.z;
    p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
    p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
    p.screen.w = Math.round(p.screen.scale * roadWidth * width / 2);
  },

  /**
   * Check overlap between two intervals
   */
  overlap: function(x1, w1, x2, w2, percent) {
    var half = (percent || 1) / 2;
    var min1 = x1 - (w1 * half);
    var max1 = x1 + (w1 * half);
    var min2 = x2 - (w2 * half);
    var max2 = x2 + (w2 * half);
    return !((max1 < min2) || (min1 > max2));
  },

  /**
   * Format time as mm:ss.tt
   */
  formatTime: function(dt) {
    var minutes = Math.floor(dt / 60);
    var seconds = Math.floor(dt - (minutes * 60));
    var tenths = Math.floor(10 * (dt - Math.floor(dt)));
    if (minutes > 0) {
      return minutes + '.' + (seconds < 10 ? '0' : '') + seconds + '.' + tenths;
    } else {
      return seconds + '.' + tenths;
    }
  },

  /**
   * Local storage wrapper with error handling
   */
  storage: {
    get: function(key, def) {
      try {
        var val = localStorage.getItem(key);
        return val !== null ? val : def;
      } catch (e) {
        return def;
      }
    },
    set: function(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // Storage full or disabled
      }
    },
    remove: function(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
