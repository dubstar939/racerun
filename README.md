# RacerUN - Arcade Racing Game

A retro-style arcade racing game built with HTML5 Canvas and JavaScript. Experience the thrill of high-speed racing with classic pseudo-3D graphics inspired by games like OutRun.

## 🎮 Features

### Core Gameplay
- **Tight, responsive controls** - Keyboard (Arrow keys/WASD) and touch controls
- **Clear collision detection** - Road edges, traffic cars, and roadside obstacles
- **Arcade physics** - Fun handling with centrifugal force on curves
- **Progressive difficulty** - More traffic and faster cars as you advance

### Game Structure
- **Start Screen** - Play, Car Selection, Settings, How to Play
- **In-game HUD** - Speed, Score, Distance, Time, Level
- **Endless mode** - Continuous play with increasing difficulty
- **Lap timing** - Track your best lap times
- **Game Over screen** - Final score, high score (saved locally), quick restart

### Content & Variety
- **Multiple road types** - Straights, curves, and hills
- **4 car skins** - Red Racer, Blue Bolt, Green Machine, Yellow Flash
- **6 environment themes** - Day, Dusk, Night, City, Desert, Coast
- **Varied traffic** - Cars, trucks, and semis with different speeds

### Polish & Feedback
- **Screen shake** - Visual feedback on crashes
- **Synthesized SFX** - Crash, near-miss, overtake sounds
- **Background music** - Looping track with volume toggle
- **Visual warnings** - Off-road slowdown indication
- **Pause menu** - ESC/P key or button

### Mobile Ready
- **Responsive design** - Adapts to any screen size
- **Touch controls** - Large, easy-to-hit buttons
- **Orientation aware** - Works in portrait or landscape

## 🚀 Quick Start

### Local Development

1. **Clone or download** this repository

2. **Start a local server** (any HTTP server works):
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Using Node.js (if http-server is installed)
   npx http-server -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser**: Navigate to `http://localhost:8080/game.html`

### Production Deployment (Vercel)

1. Push code to GitHub

2. Connect repository to Vercel

3. Deploy! The game is static and requires no build step

## 📁 Project Structure

```
/workspace
├── game.html              # Main game entry point
├── package.json           # NPM configuration
├── README.md              # This file
│
├── src/                   # Source code
│   ├── config/
│   │   └── gameConfig.js  # Game configuration & constants
│   ├── core/
│   │   ├── game.js        # Main game engine & loop
│   │   ├── utils.js       # Utility functions
│   │   └── render.js      # Rendering helpers
│   ├── entities/
│   │   ├── player.js      # Player car entity
│   │   ├── traffic.js     # Traffic AI system
│   │   └── road.js        # Road/track generation
│   ├── input/
│   │   └── inputHandler.js # Keyboard & touch input
│   ├── ui/
│   │   └── uiManager.js   # UI rendering & menus
│   └── audio/
│       └── audioManager.js # Music & sound effects
│
├── images/                # Game assets
│   ├── sprites.png        # Sprite sheet
│   ├── background/        # Background layers
│   │   ├── sky.png
│   │   ├── hills.png
│   │   └── trees.png
│   └── mute.png           # Mute button icon
│
└── music/                 # Audio files
    ├── racer.mp3
    └── racer.ogg
```

## 🎯 Controls

### Desktop
| Key | Action |
|-----|--------|
| ↑ / W | Accelerate |
| ↓ / S | Brake |
| ← / A | Steer Left |
| → / D | Steer Right |
| ESC / P | Pause |
| SPACE / ENTER | Select/Confirm |

### Mobile
- On-screen touch buttons appear automatically
- Left side: Steering (◄ ►)
- Right side: Pedals (▼ ▲)

## ⚙️ Configuration

Edit `src/config/gameConfig.js` to customize:

```javascript
Config.PLAYER = {
  ACCEL: 1.0,        // Acceleration rate
  BRAKING: 5.0,      // Braking power
  HANDLING: 2.0      // Steering responsiveness
};

Config.DIFFICULTY = {
  INITIAL_TRAFFIC: 50,    // Starting car count
  TRAFFIC_INCREMENT: 10,  // Cars added per level
  LEVEL_DISTANCE: 5000    // Segments per level
};

Config.THEMES = {
  DAY: { /* colors */ },
  NIGHT: { /* colors */ },
  // ... more themes
};
```

## 🏆 Scoring

| Action | Points |
|--------|--------|
| Distance traveled | +1 per segment |
| Near miss | +100 |
| Overtake | +50 |
| Crash | -500 |

## 🔧 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Android)

## 📝 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Credits

Built using techniques from classic arcade racers and inspired by:
- OutRun (Sega, 1986)
- Lotus Turbo Challenge (Gremlin, 1990)
- JavaScript Racer tutorials by Chris DeLeon

---

**Enjoy the race! 🏁**
