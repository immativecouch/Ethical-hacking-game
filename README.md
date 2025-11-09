# Ethical Hacker - Cybersecurity Training Game

[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

An interactive cybersecurity training game that teaches password security, encryption, and ethical hacking concepts through engaging gameplay.

## 🎮 Features

### Core Gameplay
- **Brute Force Simulation**: Learn password cracking techniques through interactive grid-based gameplay
- **File Retrieval**: Master sensor-based minigame to retrieve encrypted files
- **Encryption Challenges**: Decrypt files using pattern recognition and logical thinking
- **Campaign Mode**: Progressive difficulty levels with story-based missions
  - Mission 1: First Breach (Easy)
  - Mission 2: Corporate Espionage (Medium)
  - Mission 3: Government Files (Hard)

### Game Features
- **Statistics Dashboard**: Track your progress, win rates, and performance metrics
- **Achievement System**: Unlock achievements as you progress
- **Daily Challenges**: New challenges refresh every day at midnight
- **Leaderboard**: Compete for high scores and track your rankings
- **Settings Menu**: Customize audio, gameplay, appearance, and accessibility options
- **Interactive Tutorial**: Learn how to play and understand cybersecurity concepts
- **Creator Mode**: Generate and view passcodes for reference

### Technical Features
- **Full Input Support**: Keyboard, mouse, and gamepad controls
- **PWA (Progressive Web App)**: Installable, works offline
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, skip links
- **Theme Customization**: Multiple themes (Matrix, Neon, Dark)
- **High Contrast Mode**: Enhanced visibility for accessibility
- **Sound System**: Programmatic sound generation using Web Audio API

## 🚀 Quick Start

### Option 1: Direct File Access
1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. Start playing!

### Option 2: Local Server (Recommended for PWA features)
```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📋 Requirements

- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions recommended)
- **JavaScript**: Must be enabled
- **Web Audio API**: Required for sound effects
- **Gamepad API**: Optional, for gamepad support
- **LocalStorage**: Required for saving game data

## 🎯 How to Play

### Basic Gameplay
1. **Start Game** or **Campaign Mode**
2. Select a device (Laptop, Mobile, or PC)
3. Choose difficulty level:
   - **Easy**: 4-character password, 60 seconds, 10 attempts
   - **Medium**: 6-character password, 45 seconds, 5 attempts
   - **Hard**: 8-character password, 30 seconds, 3 attempts
4. Navigate the grid using:
   - **Keyboard**: Arrow keys to move, Enter to select
   - **Gamepad**: D-pad/Left stick to move, A/X button to select
   - **Mouse/Touch**: Click/tap cells to select
5. Find the password by selecting correct cells
6. Complete file retrieval minigame
7. Decrypt files to finish the mission

### Scoring System
- **Base Score**: Time remaining × 10
- **File Retrieval**: +500 points
- **Decryption**: +1000 points
- **Bonus**: Faster completion = higher score

## 🛠️ Technologies

- **Vanilla JavaScript**: No frameworks, pure JS
- **Web Audio API**: Programmatic sound generation
- **Gamepad API**: Controller support
- **LocalStorage**: Data persistence
- **PWA**: Progressive Web App capabilities
- **CSS3**: Modern styling with animations
- **HTML5**: Semantic markup

## 📱 Browser Support

### ✅ Fully Supported
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### ⚠️ Limited Support
- Older browsers may have issues with Web Audio API
- Gamepad API requires modern browser
- Some PWA features require HTTPS

## 🎨 Customization

### Themes
- **Matrix**: Green terminal aesthetic
- **Neon**: Cyan/pink neon colors
- **Dark**: Classic dark theme

### Accessibility Options
- High contrast mode
- Font size adjustment (Small, Medium, Large)
- Colorblind mode
- Reduced animations

## 📖 Educational Content

This game is designed for **educational purposes only** to teach:
- Password security best practices
- Encryption concepts
- Cybersecurity awareness
- Ethical hacking principles

**Disclaimer**: This game is for educational purposes. Always practice ethical hacking with proper authorization.

## 🔧 Development

### Project Structure
```
├── index.html          # Main HTML file
├── game.js            # Core game logic
├── gamepad.js         # Gamepad API integration
├── leaderboard.js     # Leaderboard management
├── sound-generator.js # Web Audio API sound generation
├── statistics.js      # Statistics tracking
├── achievements.js    # Achievement system
├── settings.js        # Settings management
├── daily-challenges.js # Daily challenges
├── campaign.js        # Campaign progression
├── styles.css         # All styling
├── manifest.json      # PWA manifest
└── service-worker.js  # Service worker for offline support
```

### Debug Mode
Set `DEBUG = true` in `game.js` to enable console logging:
```javascript
const DEBUG = true; // Enable debug logging
```

### Version Info
- **Version**: 1.0.0
- **Build Date**: See `game.js` for current build date

## 🐛 Troubleshooting

### Game won't start?
- Check browser console (F12) for errors
- Ensure all files are in the same directory
- Try refreshing the page (Ctrl+F5 / Cmd+Shift+R)
- Check JavaScript is enabled

### Sounds not working?
- Click anywhere on the page first (browser autoplay policy)
- Check browser audio permissions
- Try a different browser
- Ensure Web Audio API is supported

### Gamepad not detected?
- Connect gamepad before opening the page
- Press any button to wake the gamepad
- Check browser compatibility (Chrome/Edge recommended)
- Try reconnecting the gamepad

### Leaderboard empty?
- Play a game first and save your score
- Scores are stored in browser localStorage
- Different browsers have separate storage
- Clear browser data will reset leaderboard

### Mobile issues?
- Test on actual device, not just browser dev tools
- Some features may be limited on mobile
- Touch controls work for most interactions
- Use landscape orientation for best experience

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📧 Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Test in incognito/private mode to rule out extensions
4. Check browser compatibility

## 🎓 Educational Resources

- Learn about password security
- Understand encryption basics
- Practice ethical hacking principles
- Improve cybersecurity awareness

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select source branch
4. Your game will be live at `https://username.github.io/repository-name`

### Other Hosting
- Netlify
- Vercel
- Firebase Hosting
- Any static hosting service

**Note**: PWA features require HTTPS in production.

## 📊 Performance

- **Client-side only**: No server required
- **Lightweight**: All sounds generated programmatically
- **Fast loading**: Optimized assets and code
- **Offline capable**: Works with service worker

## 🔒 Security

- All game data stored locally (localStorage)
- No external API calls (except optional leaderboard API)
- Input validation and sanitization
- XSS protection

## 📝 Changelog

### Version 1.0.0
- Initial release
- Campaign mode with 3 missions
- Statistics and achievements
- Daily challenges
- Full accessibility support
- PWA capabilities
- Custom confirmation modals
- Input validation
- SEO optimization

---

**Enjoy the game and stay secure!** 🎮🔒

**Educational Purpose Only** - This game is for educational purposes to teach cybersecurity awareness.
