# Quick Start Guide

## Running the Game Locally

1. **Download/Clone the project**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ethical-hacker-game.git
   cd ethical-hacker-game
   ```

2. **Open in Browser**
   - Simply open `index.html` in any modern web browser
   - No server or build process needed!
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (if you have http-server installed)
     npx http-server
     
     # Then open: http://localhost:8000
     ```

## Game Controls

### Keyboard
- **WASD** or **Arrow Keys**: Move selection box
- **Space** or **Enter**: Select character/Confirm action
- **ESC**: (Future: Pause menu)

### Gamepad
- **D-Pad** or **Left Stick**: Move
- **A/X Button**: Select/Confirm
- **B/Circle Button**: Back (if implemented)

## Game Flow

1. **Main Menu** → Select "START GAME"
2. **Device Selection** → Choose Laptop, Mobile, or PC
3. **Difficulty Selection** → Easy, Medium, or Hard
4. **Brute Force Game** → Find the password in the grid
5. **File Retrieval** → Align sensor with target zone
6. **Decryption** (Medium/Hard only) → Solve the key pattern
7. **Success Screen** → Save your score!

## Tips for Playing

### Brute Force Game
- Look for the password characters scattered in the grid
- Move the selection box to highlight characters
- Select characters in order to build the password
- Wrong passwords reset your current attempt

### File Retrieval
- Move the green sensor pointer with WASD/Arrow keys
- Align it with the blue target zone
- Hold Space when aligned to retrieve files
- Progress bar shows your retrieval status

### Decryption (Medium/Hard)
- Look at the pattern hint (shows every other character)
- The key follows a pattern like: A1B2C3D4 or ABCD1234
- Enter the full key to decrypt all files
- Case doesn't matter (automatically converted to uppercase)

## Scoring System

- **Base Score**: Time remaining × 10
- **File Retrieval**: +500 points
- **Decryption**: +1000 points
- **Bonus**: Faster completion = higher score

## Leaderboard

- Scores saved automatically to browser localStorage
- View leaderboard from main menu
- Filter by difficulty level
- Top 100 scores kept

## Educational Content

- **Tutorial**: Learn how to play and about cybersecurity
- **About**: Project information and educational purpose
- **In-Game**: Tips on protecting yourself from attacks

## Troubleshooting

### Game won't start?
- Check browser console (F12) for errors
- Ensure all files are in the same directory
- Try refreshing the page

### Sounds not working?
- Click anywhere on the page first (browser autoplay policy)
- Check browser audio permissions
- Try a different browser

### Gamepad not detected?
- Connect gamepad before opening the page
- Press any button to wake the gamepad
- Check browser compatibility (Chrome/Edge recommended)

### Leaderboard empty?
- Play a game first and save your score
- Scores are stored in browser localStorage
- Different browsers have separate storage

## Browser Compatibility

✅ **Fully Supported:**
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

⚠️ **Limited Support:**
- Older browsers may have issues with Web Audio API
- Gamepad API requires modern browser

## Next Steps

1. **Play the game** and try all difficulty levels
2. **Read the tutorial** to learn about cybersecurity
3. **Check the leaderboard** and compete for high scores
4. **Share with friends** and spread cybersecurity awareness!

---

**Enjoy the game and stay secure!** 🎮🔒

