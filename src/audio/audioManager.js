/**
 * Audio Manager
 * Handles music and sound effects
 */

const AudioManager = {
  music: null,
  sfx: {},
  
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.05,
  sfxVolume: 0.3,
  
  /**
   * Initialize audio system
   */
  init: function() {
    // Load music
    this.music = document.getElementById('music');
    if (this.music) {
      this.music.loop = true;
      this.music.volume = this.musicVolume;
      
      // Check for muted state
      var muted = Utils.storage.get('muted', 'false') === 'true';
      this.music.muted = muted;
      this.musicEnabled = !muted;
    }
    
    // Create SFX pool
    this.createSFX();
    
    return this;
  },
  
  /**
   * Create sound effect elements
   */
  createSFX: function() {
    // Simple synthesized sounds using Web Audio API would be ideal
    // For now, we'll use placeholder approach
    this.sfx = {
      crash: this.createOscillator(150, 'sawtooth', 0.3),
      nearMiss: this.createOscillator(400, 'sine', 0.1),
      overtake: this.createOscillator(600, 'sine', 0.1),
      start: this.createOscillator(800, 'square', 0.2),
      levelUp: this.createOscillator(1000, 'sine', 0.3)
    };
  },
  
  /**
   * Create an oscillator-based sound effect
   */
  createOscillator: function(frequency, type, duration) {
    return {
      frequency: frequency,
      type: type,
      duration: duration
    };
  },
  
  /**
   * Play a sound effect
   */
  playSFX: function(name) {
    if (!this.sfxEnabled) return;
    
    var sfx = this.sfx[name];
    if (!sfx) return;
    
    try {
      var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var oscillator = audioCtx.createOscillator();
      var gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.frequency.value = sfx.frequency;
      oscillator.type = sfx.type;
      
      gainNode.gain.setValueAtTime(this.sfxVolume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + sfx.duration);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + sfx.duration);
    } catch (e) {
      // Web Audio not supported or user gesture required
    }
  },
  
  /**
   * Play music
   */
  playMusic: function() {
    if (this.music && this.musicEnabled) {
      this.music.play().catch(function(e) {
        // Autoplay may be blocked - will start on user interaction
      });
    }
  },
  
  /**
   * Pause music
   */
  pauseMusic: function() {
    if (this.music) {
      this.music.pause();
    }
  },
  
  /**
   * Resume music
   */
  resumeMusic: function() {
    if (this.music && this.musicEnabled) {
      this.music.play().catch(function(e) {});
    }
  },
  
  /**
   * Toggle music on/off
   */
  toggleMusic: function() {
    this.musicEnabled = !this.musicEnabled;
    
    if (this.music) {
      this.music.muted = !this.musicEnabled;
      Utils.storage.set('muted', this.music.muted.toString());
    }
    
    // Update mute button UI
    var muteBtn = document.getElementById('mute');
    if (muteBtn) {
      if (this.musicEnabled) {
        muteBtn.classList.remove('on');
        this.resumeMusic();
      } else {
        muteBtn.classList.add('on');
        this.pauseMusic();
      }
    }
    
    return this.musicEnabled;
  },
  
  /**
   * Toggle SFX on/off
   */
  toggleSFX: function() {
    this.sfxEnabled = !this.sfxEnabled;
    Utils.storage.set('sfx_enabled', this.sfxEnabled.toString());
    return this.sfxEnabled;
  },
  
  /**
   * Set music volume
   */
  setMusicVolume: function(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  },
  
  /**
   * Set SFX volume
   */
  setSFXVolume: function(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  },
  
  /**
   * Load saved audio preferences
   */
  loadPreferences: function() {
    this.sfxEnabled = Utils.storage.get('sfx_enabled', 'true') === 'true';
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
