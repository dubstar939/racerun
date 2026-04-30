/**
 * Render Helpers
 * Canvas rendering utilities for road, sprites, and effects
 */

const Render = {
  /**
   * Draw a polygon
   */
  polygon: function(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  },
  
  /**
   * Draw a road segment
   */
  segment: function(ctx, width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {
    var r1 = this.rumbleWidth(w1, lanes);
    var r2 = this.rumbleWidth(w2, lanes);
    var l1 = this.laneMarkerWidth(w1, lanes);
    var l2 = this.laneMarkerWidth(w2, lanes);
    
    // Grass
    ctx.fillStyle = color.grass || '#10AA10';
    ctx.fillRect(0, y2, width, y1 - y2);
    
    // Rumble strips
    this.polygon(ctx, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, color.rumble || '#555555');
    this.polygon(ctx, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, color.rumble || '#555555');
    
    // Road
    this.polygon(ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, color.road || '#6B6B6B');
    
    // Lane markers
    if (color.lane) {
      var lanew1 = w1 * 2 / lanes;
      var lanew2 = w2 * 2 / lanes;
      var lanex1 = x1 - w1 + lanew1;
      var lanex2 = x2 - w2 + lanew2;
      
      for (var lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++) {
        this.polygon(ctx, lanex1 - l1/2, y1, lanex1 + l1/2, y1, lanex2 + l2/2, y2, lanex2 - l2/2, y2, color.lane);
      }
    }
    
    // Fog overlay
    this.fog(ctx, 0, y1, width, y2 - y1, fog);
  },
  
  /**
   * Draw background layer
   */
  background: function(ctx, image, width, height, layer, rotation, offset) {
    if (!image) return;
    
    rotation = rotation || 0;
    offset = offset || 0;
    
    var imageW = layer.w / 2;
    var imageH = layer.h;
    
    var sourceX = layer.x + Math.floor(layer.w * rotation);
    var sourceY = layer.y;
    var sourceW = Math.min(imageW, layer.x + layer.w - sourceX);
    var sourceH = imageH;
    
    var destX = 0;
    var destY = offset;
    var destW = Math.floor(width * (sourceW / imageW));
    var destH = height;
    
    ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
    
    if (sourceW < imageW) {
      ctx.drawImage(image, layer.x, sourceY, imageW - sourceW, sourceH, destW - 1, destY, width - destW, destH);
    }
  },
  
  /**
   * Draw a sprite
   */
  sprite: function(ctx, width, height, resolution, roadWidth, sprites, sprite, scale, 
                   destX, destY, offsetX, offsetY, clipY) {
    var destW = (sprite.w * scale * width / 2) * (Config.SPRITES.SCALE * roadWidth);
    var destH = (sprite.h * scale * width / 2) * (Config.SPRITES.SCALE * roadWidth);
    
    destX = destX + (destW * (offsetX || 0));
    destY = destY + (destH * (offsetY || 0));
    
    var clipH = clipY ? Math.max(0, destY + destH - clipY) : 0;
    
    if (clipH < destH) {
      ctx.drawImage(
        sprites,
        sprite.x, sprite.y, sprite.w, sprite.h - (sprite.h * clipH / destH),
        destX, destY, destW, destH - clipH
      );
    }
  },
  
  /**
   * Draw player car
   */
  player: function(ctx, width, height, resolution, roadWidth, sprites, player, steer, updown) {
    var bounce = player.y;
    var sprite = player.getSprite();
    var scale = Config.SEGMENT_LENGTH / Config.STEP;
    
    this.sprite(ctx, width, height, resolution, roadWidth, sprites, 
                sprite, scale, width / 2, height - 20, -0.5, -1);
  },
  
  /**
   * Draw fog overlay
   */
  fog: function(ctx, x, y, width, height, fog) {
    if (fog < 1) {
      ctx.globalAlpha = 1 - fog;
      ctx.fillStyle = COLORS.FOG || '#005108';
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;
    }
  },
  
  /**
   * Calculate rumble strip width
   */
  rumbleWidth: function(projectedRoadWidth, lanes) {
    return projectedRoadWidth / Math.max(6, 2 * lanes);
  },
  
  /**
   * Calculate lane marker width
   */
  laneMarkerWidth: function(projectedRoadWidth, lanes) {
    return projectedRoadWidth / Math.max(32, 8 * lanes);
  },
  
  /**
   * Screen shake effect
   */
  shake: function(ctx, intensity, callback) {
    var dx = (Math.random() - 0.5) * intensity;
    var dy = (Math.random() - 0.5) * intensity;
    ctx.save();
    ctx.translate(dx, dy);
    callback();
    ctx.restore();
  },
  
  /**
   * Draw text with shadow
   */
  text: function(ctx, text, x, y, size, color, align) {
    ctx.font = 'bold ' + size + 'px Arial';
    ctx.textAlign = align || 'center';
    ctx.fillStyle = 'black';
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = color || 'white';
    ctx.fillText(text, x, y);
  },
  
  /**
   * Draw semi-transparent overlay
   */
  overlay: function(ctx, color, alpha) {
    ctx.fillStyle = color || 'rgba(0,0,0,0.5)';
    ctx.globalAlpha = alpha || 0.5;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Render;
}
