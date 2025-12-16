# 🎄 Quick Start Guide

## Get Started in 3 Steps

### 1. Serve the Files
Choose your preferred method:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

### 2. Open in Browser
Navigate to: `http://localhost:8000/christmas-interactive/`

### 3. Allow Camera Access
Click "Allow" when your browser asks for camera permission.

---

## 🎮 Gesture Cheat Sheet

| Gesture | Action | Effect |
|---------|--------|--------|
| ✋ Both hands open | Spread wide | Expands particle cloud |
| 🤏 Both hands closed | Bring together | Contracts particle cloud |
| ✊ Make a fist | Close hand tightly | Forms Christmas tree |
| 🖐️ Open after fist | Open hand | Tree rotates & explodes |
| 🤏 Thumb+Index pinch | Touch tips | Zooms uploaded images |

---

## ⌨️ Keyboard Shortcuts

- `1` - Switch to cloud formation
- `2` - Switch to tree formation
- `3` - Start tree rotation
- `F` - Toggle fullscreen

---

## 🎨 Try These Fun Experiments

### Experiment 1: Cloud Dance
1. Open both hands wide → cloud expands
2. Slowly close hands → cloud contracts
3. Repeat rhythmically → creates breathing effect

### Experiment 2: Build the Tree
1. Make a fist → particles spiral into tree
2. Open your hand → tree explodes and spins
3. Upload a photo → pinch to zoom it

### Experiment 3: Photo Gallery
1. Upload multiple images (click "Upload Image" multiple times)
2. Make a fist to arrange as tree
3. Use pinch gesture to zoom each photo
4. Open hand to create spinning photo gallery

---

## 🐛 Troubleshooting Quick Fixes

### Camera Not Working?
- Ensure you're on `localhost` or `https://`
- Check browser permissions (look for camera icon in address bar)
- Try a different browser (Chrome/Firefox recommended)

### Gestures Not Detected?
- Ensure good lighting
- Keep hands visible in camera frame
- Try moving closer/farther from camera
- Make gestures more pronounced

### Performance Issues?
- Close other browser tabs
- Try reducing particle count in `js/particle-system.js` line 8
- Update your graphics drivers

---

## 📱 Browser Recommendations

**Best Experience:**
- Chrome 90+ ✅
- Edge 90+ ✅
- Firefox 88+ ✅

**Mobile:**
- Works on mobile but may be slower
- Hand tracking less accurate on smaller cameras

---

## 🎯 Pro Tips

1. **Best Lighting**: Sit facing a window or light source
2. **Camera Position**: Position camera at arm's length
3. **Hand Position**: Keep hands at chest level for best tracking
4. **Smooth Gestures**: Move slowly for better detection
5. **Multiple Photos**: Upload several images for best pinch-zoom effect

---

## 🎁 What's Next?

After getting familiar with basic gestures:

1. **Customize Colors**: Edit `js/particle-system.js` line 101
2. **Add More Emojis**: Edit line 68 in same file
3. **Adjust Sensitivity**: Edit `js/hand-tracker.js` thresholds
4. **Change Particle Count**: Edit `js/particle-system.js` line 8

See `README.md` for detailed customization guide.

---

## ❓ Quick Help

**Status Messages:**
- 🟢 Green: Everything working correctly
- 🔴 Red: Error occurred (check console)
- 🟠 Orange: Warning or initializing

**Need More Help?**
- Check `README.md` for full documentation
- Check `FEATURES.md` for complete feature list
- Open browser console (F12) to see detailed errors

---

**Have fun creating your interactive Christmas magic! 🎄✨**
