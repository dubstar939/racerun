/**
 * Game Configuration
 * Centralized configuration for difficulty, car stats, and environment themes
 */

const Config = {
  // Game settings
  FPS: 60,
  STEP: 1/60,
  
  // Canvas dimensions (logical)
  WIDTH: 1024,
  HEIGHT: 768,
  
  // Road settings
  ROAD_WIDTH: 2000,        // Half road width (road spans from -ROAD_WIDTH to +ROAD_WIDTH)
  SEGMENT_LENGTH: 200,     // Length of a single segment
  RUMBLE_LENGTH: 3,        // Segments per red/white rumble strip
  LANES: 3,                // Number of lanes
  
  // Camera settings
  FIELD_OF_VIEW: 100,      // Angle in degrees
  CAMERA_HEIGHT: 1000,     // Z height of camera
  DRAW_DISTANCE: 300,      // Number of segments to draw
  FOG_DENSITY: 5,          // Exponential fog density
  
  // Physics & Movement
  CENTRIFUGAL: 0.3,        // Force multiplier when going around curves
  OFF_ROAD_LIMIT: 0.25,    // Max speed ratio when off-road
  
  // Car stats (player)
  PLAYER: {
    ACCEL: 1.0,            // Acceleration rate
    BRAKING: 5.0,          // Braking deceleration
    DECEL: 1.0,            // Natural deceleration
    OFF_ROAD_DECEL: 2.5,   // Off-road deceleration
    MAX_SPEED_RATIO: 1.0,  // Max speed as ratio of segmentLength/step
    HANDLING: 2.0          // Lateral movement speed
  },
  
  // Difficulty progression
  DIFFICULTY: {
    INITIAL_TRAFFIC: 50,       // Initial number of cars
    TRAFFIC_INCREMENT: 10,     // Cars added per level
    INITIAL_SPEED_MODIFIER: 1.0,
    SPEED_INCREMENT: 0.05,     // Speed increase per level
    LEVEL_DISTANCE: 5000       // Distance (segments) per level
  },
  
  // Environment themes
  THEMES: {
    DAY: {
      name: 'Day',
      sky: '#72D7EE',
      grass: '#10AA10',
      road: '#6B6B6B',
      rumble: '#555555',
      lane: '#CCCCCC',
      fog: '#005108',
      background: 'day'
    },
    DUSK: {
      name: 'Dusk',
      sky: '#FF6B35',
      grass: '#8B4513',
      road: '#555555',
      rumble: '#888888',
      lane: '#AAAAAA',
      fog: '#4A3728',
      background: 'dusk'
    },
    NIGHT: {
      name: 'Night',
      sky: '#0A0A2A',
      grass: '#1a1a2e',
      road: '#333333',
      rumble: '#666666',
      lane: '#888888',
      fog: '#0a0a1a',
      background: 'night'
    },
    CITY: {
      name: 'City',
      sky: '#87CEEB',
      grass: '#228B22',
      road: '#4a4a4a',
      rumble: '#666666',
      lane: '#FFFFFF',
      fog: '#555566',
      background: 'city'
    },
    DESERT: {
      name: 'Desert',
      sky: '#FFE4B5',
      grass: '#DEB887',
      road: '#696969',
      rumble: '#8B4513',
      lane: '#F4A460',
      fog: '#D2B48C',
      background: 'desert'
    },
    COAST: {
      name: 'Coast',
      sky: '#87CEEB',
      grass: '#90EE90',
      road: '#696969',
      rumble: '#4682B4',
      lane: '#FFFFFF',
      fog: '#B0E0E6',
      background: 'coast'
    }
  },
  
  // Car skins (player selectable)
  CAR_SKINS: [
    { id: 'red', name: 'Red Racer', color: '#DC143C' },
    { id: 'blue', name: 'Blue Bolt', color: '#1E90FF' },
    { id: 'green', name: 'Green Machine', color: '#228B22' },
    { id: 'yellow', name: 'Yellow Flash', color: '#FFD700' }
  ],
  
  // Traffic car types
  TRAFFIC_CARS: ['car01', 'car02', 'car03', 'car04', 'semi', 'truck'],
  
  // Scoring
  SCORING: {
    DISTANCE_POINTS: 1,      // Points per segment traveled
    NEAR_MISS_BONUS: 100,    // Bonus for near misses
    OVERTAKE_BONUS: 50,      // Bonus for overtaking cars
    CRASH_PENALTY: 500       // Points lost on crash
  },
  
  // Audio settings
  AUDIO: {
    MUSIC_VOLUME: 0.05,
    SFX_VOLUME: 0.3,
    ENABLE_MUSIC: true,
    ENABLE_SFX: true
  },
  
  // Mobile controls
  MOBILE: {
    ENABLE_TOUCH: true,
    BUTTON_SIZE: 80,
    OPACITY: 0.5
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Config;
}
