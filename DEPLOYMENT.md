# Deployment Guide - Ethical Hacker Game

## Quick Deployment Options

### Option 1: GitHub Pages (Recommended - Free)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ethical Hacker Game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ethical-hacker-game.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Select source: `main` branch
   - Select folder: `/ (root)`
   - Click Save
   - Your game will be live at: `https://YOUR_USERNAME.github.io/ethical-hacker-game/`

### Option 2: Netlify (Free & Easy)

1. **Drag and Drop**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Drag your project folder to Netlify dashboard
   - Your site is live instantly!

2. **Git Integration**
   - Connect your GitHub repository
   - Netlify auto-deploys on every push

### Option 3: Vercel (Free)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   Follow the prompts. Your site will be live!

### Option 4: Traditional Web Hosting

1. **Upload Files**
   - Upload all files to your web server
   - Ensure `index.html` is in the root directory
   - No server-side code needed - pure client-side!

2. **File Structure**
   ```
   /
   ├── index.html
   ├── styles.css
   ├── game.js
   ├── gamepad.js
   ├── leaderboard.js
   ├── sound-generator.js
   ├── README.md
   └── assets/
       └── sounds/
   ```

## Pre-Deployment Checklist

- [ ] Test all game features
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test gamepad functionality (if available)
- [ ] Verify leaderboard saves scores
- [ ] Check mobile responsiveness
- [ ] Test all difficulty levels
- [ ] Verify educational content displays correctly
- [ ] Check all navigation buttons work
- [ ] Test sound system
- [ ] Verify no console errors

## Post-Deployment

1. **Test the live site**
   - Play through all difficulty levels
   - Test leaderboard functionality
   - Verify all features work

2. **Share your project**
   - Update README with live URL
   - Share on social media
   - Submit to E.D.G.E 25

## Troubleshooting

### Sounds not working?
- Check browser console for Web Audio API errors
- Some browsers require user interaction before playing sounds
- Try clicking anywhere on the page first

### Leaderboard not saving?
- Check browser localStorage permissions
- Leaderboard uses local storage by default (no API key needed)
- For API integration, see leaderboard.js comments

### Gamepad not working?
- Ensure gamepad is connected before page load
- Try pressing a button to wake the gamepad
- Check browser compatibility (Chrome/Edge recommended)

### Mobile issues?
- Test on actual device, not just browser dev tools
- Some features may be limited on mobile
- Touch controls work for most interactions

## Performance Tips

- Game runs entirely client-side (no server needed)
- All sounds generated programmatically (no large audio files)
- Leaderboard uses localStorage (works offline)
- No external dependencies required

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Test in incognito/private mode to rule out extensions
4. Check browser compatibility

---

**Ready to deploy!** 🚀

