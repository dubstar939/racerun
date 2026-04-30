/**
 * Road/Track Manager
 * Handles road geometry, segments, and rendering
 */

const Road = {
  segments: [],
  trackLength: 0,
  
  // Scroll offsets for background layers
  skyOffset: 0,
  hillOffset: 0,
  treeOffset: 0,
  
  // Current theme colors
  colors: null,
  
  /**
   * Initialize road system
   */
  init: function() {
    this.segments = [];
    this.trackLength = 0;
    this.skyOffset = 0;
    this.hillOffset = 0;
    this.treeOffset = 0;
    return this;
  },
  
  /**
   * Set current environment theme
   */
  setTheme: function(themeName) {
    var theme = Config.THEMES[themeName.toUpperCase()] || Config.THEMES.DAY;
    this.colors = {
      road: theme.road,
      grass: theme.grass,
      rumble: theme.rumble,
      lane: theme.lane,
      fog: theme.fog
    };
    return this;
  },
  
  /**
   * Create road segments with curves and hills
   */
  createTrack: function(options) {
    options = options || {};
    
    var segmentLength = Config.SEGMENT_LENGTH;
    var rumbleLength = Config.RUMBLE_LENGTH;
    var lanes = Config.LANES;
    var roadWidth = Config.ROAD_WIDTH;
    
    // Track definition - array of road features
    var sections = options.sections || [
      { type: 'straight', length: 50 },
      { type: 'curve', curve: 2, length: 50 },
      { type: 'straight', length: 30 },
      { type: 'curve', curve: -2, length: 50 },
      { type: 'hill', y: 100, length: 40 },
      { type: 'straight', length: 30 },
      { type: 'hill', y: -100, length: 40 },
      { type: 'curve', curve: 3, length: 60 },
      { type: 'straight', length: 100 }
    ];
    
    this.segments = [];
    
    for (var s = 0; s < sections.length; s++) {
      var section = sections[s];
      var start = this.segments.length;
      
      for (var i = 0; i < section.length; i++) {
        var index = this.segments.length;
        var z = index * segmentLength;
        
        // Calculate properties based on section type
        var curve = 0;
        var y = 0;
        
        if (section.type === 'curve') {
          curve = section.curve || 0;
          // Ease in/out curve intensity
          var t = i / section.length;
          curve *= Math.sin(t * Math.PI);
        } else if (section.type === 'hill') {
          // Parabolic hill shape
          var t = i / section.length;
          y = section.y * 4 * t * (1 - t);
        }
        
        // Add segment
        this.addSegment(z, curve, y, roadWidth, lanes, rumbleLength);
      }
    }
    
    // Set track length
    this.trackLength = this.segments.length * segmentLength;
    
    // Mark start/finish line
    this.markStartFinish();
    
    return this;
  },
  
  /**
   * Add a single segment
   */
  addSegment: function(z, curve, y, roadWidth, lanes, rumbleLength) {
    var n = this.segments.length;
    var dark = Math.floor(n / rumbleLength) % 2;
    
    // Use theme colors if set, otherwise use defaults
    var roadColor = dark ? '#696969' : '#6B6B6B';
    var grassColor = dark ? '#009A00' : '#10AA10';
    var rumbleColor = dark ? '#BBBBBB' : '#555555';
    var laneColor = dark ? null : '#CCCCCC';
    
    var segment = {
      index: n,
      p1: { world: { x: 0, y: y, z: z }, camera: {}, screen: {} },
      p2: { world: { x: 0, y: y, z: z + Config.SEGMENT_LENGTH }, camera: {}, screen: {} },
      curve: curve,
      sprites: [],
      cars: [],
      color: {
        road: roadColor,
        grass: grassColor,
        rumble: rumbleColor,
        lane: laneColor
      },
      grassColor: grassColor
    };
    
    // Override colors if theme is set
    if (this.colors) {
      segment.color = {
        road: this.colors.road,
        grass: this.colors.grass,
        rumble: this.colors.rumble,
        lane: this.colors.lane
      };
    }
    
    this.segments.push(segment);
    return segment;
  },
  
  /**
   * Mark start/finish line segments
   */
  markStartFinish: function() {
    var rumbleLength = Config.RUMBLE_LENGTH;
    var startLineIndex = 0;
    var finishLineIndex = this.segments.length - 1;
    
    // Start/finish colors
    var startColor = { road: 'white', grass: 'white', rumble: 'white', lane: 'white' };
    var finishColor = { road: 'black', grass: 'black', rumble: 'black', lane: 'black' };
    
    // Mark start line
    for (var i = 0; i < rumbleLength * 3; i++) {
      var idx = (startLineIndex + i) % this.segments.length;
      this.segments[idx].color = startColor;
    }
    
    // Mark finish line
    for (var i = 0; i < rumbleLength * 3; i++) {
      var idx = (finishLineIndex - i + this.segments.length) % this.segments.length;
      this.segments[idx].color = finishColor;
    }
  },
  
  /**
   * Find segment at Z position
   */
  findSegment: function(z) {
    return this.segments[Math.floor(z / Config.SEGMENT_LENGTH) % this.segments.length];
  },
  
  /**
   * Add roadside sprite
   */
  addSprite: function(z, sprite, offset) {
    var segment = this.findSegment(z);
    if (segment) {
      segment.sprites.push({ source: sprite, offset: offset });
    }
    return this;
  },
  
  /**
   * Populate track with random sprites
   */
  populateSprites: function() {
    var sprites = Config.SPRITES.PLANTS;
    var billboards = Config.SPRITES.BILLBOARDS;
    var segmentLength = Config.SEGMENT_LENGTH;
    
    for (var n = 0; n < this.segments.length; n += 10) {
      var segment = this.segments[n];
      
      // Random chance to add sprite
      if (Math.random() < 0.3) {
        var sprite = Utils.randomChoice(sprites);
        var offset = (Math.random() > 0.5 ? 1.5 : -1.5) + (Math.random() - 0.5);
        this.addSprite(n * segmentLength, sprite, offset);
      }
      
      // Occasional billboard
      if (Math.random() < 0.05) {
        var bb = Utils.randomChoice(billboards);
        var offset = (Math.random() > 0.5 ? 2 : -2);
        this.addSprite(n * segmentLength, bb, offset);
      }
    }
    
    return this;
  },
  
  /**
   * Update background scroll offsets
   */
  updateBackgrounds: function(playerSegment, deltaZ) {
    var segmentLength = Config.SEGMENT_LENGTH;
    
    this.skyOffset = Utils.increase(
      this.skyOffset,
      Config.skySpeed * playerSegment.curve * (deltaZ / segmentLength),
      1
    );
    
    this.hillOffset = Utils.increase(
      this.hillOffset,
      Config.hillSpeed * playerSegment.curve * (deltaZ / segmentLength),
      1
    );
    
    this.treeOffset = Utils.increase(
      this.treeOffset,
      Config.treeSpeed * playerSegment.curve * (deltaZ / segmentLength),
      1
    );
  },
  
  /**
   * Render the road
   */
  render: function(ctx, width, height, resolution, cameraX, cameraY, cameraZ, cameraDepth, 
                   baseSegment, drawDistance, fogDensity, playerY) {
    var lanes = Config.LANES;
    var segmentLength = Config.SEGMENT_LENGTH;
    var maxy = height;
    
    var x = 0;
    var dx = -(baseSegment.curve * Utils.percentRemaining(cameraZ, segmentLength));
    
    for (var n = 0; n < drawDistance; n++) {
      var segment = this.segments[(baseSegment.index + n) % this.segments.length];
      var looped = segment.index < baseSegment.index;
      var fog = Utils.exponentialFog(n / drawDistance, fogDensity);
      
      // Offset for looping
      var cameraZAdjusted = cameraZ - (looped ? this.trackLength : 0);
      
      // Project segment points
      Utils.project(segment.p1, cameraX, cameraY, cameraZAdjusted, cameraDepth, width, height, Config.ROAD_WIDTH);
      Utils.project(segment.p2, cameraX, cameraY, cameraZAdjusted, cameraDepth, width, height, Config.ROAD_WIDTH);
      
      // Skip if behind camera or clipped
      if ((segment.p1.camera.z <= cameraDepth) || 
          (segment.p2.screen.y >= segment.p1.screen.y) || 
          (segment.p2.screen.y >= maxy)) {
        continue;
      }
      
      // Draw segment
      Render.segment(
        ctx, width, lanes,
        segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
        segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
        fog, segment.color
      );
      
      maxy = segment.p1.screen.y;
      x += dx;
      dx += segment.curve;
    }
    
    return this;
  },
  
  /**
   * Render all sprites and cars in a segment
   */
  renderSprites: function(ctx, width, height, resolution, roadWidth, spritesImage, 
                          segment, cameraX, cameraY, cameraZ, cameraDepth, clipY) {
    var segmentLength = Config.SEGMENT_LENGTH;
    
    // Sort sprites by distance (painter's algorithm)
    var sprites = segment.sprites.concat(segment.cars.map(function(c) {
      return { source: c.sprite, offset: c.offset, percent: c.percent };
    }));
    
    sprites.sort(function(a, b) {
      return (b.offset > 0) - (a.offset > 0);
    });
    
    for (var i = 0; i < sprites.length; i++) {
      var sprite = sprites[i];
      var spriteScale = segment.p1.screen.scale;
      var spriteX = segment.p1.screen.x + (spriteScale * sprite.offset * Config.ROAD_WIDTH * width / 2);
      var spriteY = segment.p1.screen.y;
      
      Render.sprite(ctx, width, height, resolution, roadWidth, spritesImage,
                    sprite.source, spriteScale, spriteX, spriteY,
                    sprite.offset > 0 ? -0.5 : 0.5, -1, clipY);
    }
    
    return this;
  },
  
  /**
   * Reset road state
   */
  reset: function() {
    this.skyOffset = 0;
    this.hillOffset = 0;
    this.treeOffset = 0;
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Road;
}
