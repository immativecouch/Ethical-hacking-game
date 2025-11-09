# PWA Setup Guide - Ethical Hacker

## 📱 Making the Game Installable as a Mobile App

This guide will help you set up the Progressive Web App (PWA) so users can install it on their mobile devices like a native app.

## ✅ What's Already Done

1. **manifest.json** - PWA configuration file
2. **service-worker.js** - Offline functionality and caching
3. **HTML updates** - Meta tags and service worker registration
4. **Install button** - Appears when app can be installed

## 🎨 Step 1: Create App Icons

You need to create icon files for the app. Here are two options:

### Option A: Use the Icon Generator (Easiest)

1. Open `create-icons.html` in your browser
2. Click "Generate All Icons"
3. All icon files will be downloaded automatically
4. Create a folder named `icons` in your project root
5. Move all downloaded icons to the `icons` folder

### Option B: Create Custom Icons

1. Create a folder named `icons` in your project root
2. Create icons in these sizes:
   - 72x72.png
   - 96x96.png
   - 128x128.png
   - 144x144.png
   - 152x152.png
   - 192x192.png
   - 384x384.png
   - 512x512.png

3. Use a design tool (Figma, Photoshop, etc.) to create icons with:
   - Lock icon (🔐) or hacking theme
   - Green (#00ff41) and dark blue (#0a0e27) colors
   - Transparent or solid background

## 🚀 Step 2: Deploy with HTTPS

PWAs require HTTPS to work properly (except for localhost).

### For Local Testing:
- Use `http://localhost` - Service workers work on localhost
- Or use a local HTTPS server

### For Production:
- Deploy to a hosting service with HTTPS (GitHub Pages, Netlify, Vercel, etc.)
- The service worker will automatically cache files for offline use

## 📲 Step 3: Test Installation

### On Android:
1. Open the app in Chrome browser
2. Look for "Add to Home Screen" prompt
3. Or click the menu (3 dots) → "Add to Home Screen"
4. Or use the "📱 INSTALL APP" button in the menu

### On iOS (iPhone/iPad):
1. Open the app in Safari browser
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"
4. Customize the name if needed
5. Tap "Add"

### On Desktop:
1. Look for install icon in browser address bar
2. Or use the "📱 INSTALL APP" button in the menu

## ✨ Features Enabled

Once installed as PWA:

- ✅ **Standalone Mode** - Opens without browser UI
- ✅ **Offline Support** - Works without internet (cached files)
- ✅ **App Icon** - Shows on home screen
- ✅ **Splash Screen** - Custom loading screen
- ✅ **Full Screen** - No browser bars
- ✅ **Fast Loading** - Cached resources load instantly

## 🔧 Troubleshooting

### Icons not showing?
- Make sure `icons` folder exists in project root
- Check that all icon files are named correctly
- Verify paths in `manifest.json` match your folder structure

### Service Worker not registering?
- Make sure you're using HTTPS (or localhost)
- Check browser console for errors
- Clear browser cache and reload

### Install button not appearing?
- App might already be installed
- Browser might not support PWA
- Try clearing browser data and reloading

## 📝 File Structure

```
project-root/
├── index.html
├── manifest.json
├── service-worker.js
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── ... other files
```

## 🎯 Next Steps

1. Generate/create icons using `create-icons.html`
2. Test locally on your device
3. Deploy to a hosting service with HTTPS
4. Share the link - users can now install it as an app!

## 📱 Testing Checklist

- [ ] Icons folder created with all sizes
- [ ] manifest.json linked in HTML
- [ ] Service worker registered
- [ ] Test install on Android device
- [ ] Test install on iOS device
- [ ] Test offline functionality
- [ ] Verify app opens in standalone mode

---

**Note:** The app will work without icons, but they enhance the user experience significantly!

