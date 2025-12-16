# 🎄 Christmas Interactive 3D Particle System

A real-time, interactive 3D particle system powered by Three.js and MediaPipe Hands, featuring gesture-controlled animations and effects.

## Features

- **🎨 3D Particle System**: 300+ particles with emoji textures rendered using `THREE.InstancedMesh` for optimal performance
- **👋 Hand Gesture Recognition**: Real-time hand tracking using MediaPipe Hands
- **✨ Post-Processing Effects**: UnrealBloomPass for beautiful glow effects
- **🖼️ Image Integration**: Upload and interact with your own images as particles
- **🎯 Multiple Formations**: Cloud, Christmas Tree, and Rotating states

## Tech Stack

- **Three.js** (v0.159.0) - 3D rendering engine
- **MediaPipe Hands** - Real-time hand tracking and gesture recognition
- **GSAP** (v3.12.5) - Smooth animations and transitions
- **Vanilla JavaScript** - No frameworks, pure ES6+ modules

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A working webcam
- HTTPS connection (required for camera access) or localhost

### Installation

1. Clone the repository or download the files
2. Serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

3. Open your browser and navigate to:
```
http://localhost:8000/christmas-interactive/
```

4. Allow camera access when prompted

## Hand Gestures

### 👐 Open/Close Hands (Two Hands)
- **Action**: Open both hands wide or close them
- **Effect**: Controls the scale/spread of the particle cloud
- **Use Case**: Create dynamic breathing effects with the particle cloud

### ✊ Fist (One or Both Hands)
- **Action**: Make a fist with one or both hands
- **Effect**: Particles aggregate into a spiral Christmas Tree formation
- **Use Case**: Transform chaotic particles into a structured tree shape

### 🖐️ Open Hand (After Fist)
- **Action**: Open your hand after making a fist
- **Effect**: The tree "explodes" slightly and begins rotating
- **Use Case**: Add dynamic movement to the tree formation

### 🤏 Pinch (Thumb + Index)
- **Action**: Bring thumb and index finger together
- **Effect**: Zooms into the nearest particle containing a user-uploaded image
- **Use Case**: Focus on and highlight specific photo particles

## UI Controls

### 📸 Upload Image
- Click the "Upload Image" button to add photos to the particle system
- Supported formats: JPG, PNG, GIF, WebP
- Images are randomly assigned to particles
- Use pinch gesture to zoom and view uploaded images

### ⛶ Fullscreen
- Toggle fullscreen mode for an immersive experience
- Keyboard shortcut: Press `F` key

### ⌨️ Keyboard Shortcuts
- `1` - Cloud formation
- `2` - Tree formation
- `3` - Rotating tree
- `F` - Toggle fullscreen

## File Structure

```
christmas-interactive/
├── index.html              # Main HTML entry point
├── css/
│   └── style.css          # Styling and UI layout
├── js/
│   ├── main.js            # Application entry point and coordination
│   ├── particle-system.js # Three.js particle system logic
│   └── hand-tracker.js    # MediaPipe hand tracking and gesture detection
└── README.md              # This file
```

## Architecture

### Particle System (`particle-system.js`)

**Key Components:**
- **InstancedMesh**: Renders 300 particles efficiently
- **Materials**: StandardMaterial with metalness and roughness for reflective properties
- **Textures**: 9 emoji textures (🔴, 🎁, 🧦, 🔔, 👔, 🔺, 🧊, 🌳, 🎅)
- **Special Elements**: Glowing light bulb particle at tree top
- **Post-Processing**: UnrealBloomPass for glow effects

**States:**
1. **Cloud**: Particles arranged in scattered cloud formation
2. **Tree**: Spiral Christmas tree formation with varying scales
3. **Rotating**: Tree rotates with slight explosion effect

### Hand Tracker (`hand-tracker.js`)

**Gesture Detection Methods:**
- `isHandOpen()`: Checks if fingers are extended
- `isFist()`: Detects closed fist
- `isPinching()`: Measures thumb-index distance
- `detectGestures()`: Main gesture recognition loop

**Features:**
- Supports 1-2 hands simultaneously
- Real-time landmark detection (21 points per hand)
- Configurable confidence thresholds
- Optional hand visualization canvas

### Main Application (`main.js`)

**Responsibilities:**
- Initializes both particle system and hand tracker
- Handles gesture-to-particle state transitions
- Manages UI controls and status updates
- Coordinates between hand tracking and particle animations

## Performance Optimizations

1. **InstancedMesh**: Renders all particles in a single draw call
2. **Efficient Updates**: Only updates matrices when positions change
3. **Post-Processing**: Optimized bloom with reasonable parameters
4. **MediaPipe**: Balanced model complexity (1) for speed vs. accuracy
5. **Gesture Smoothing**: Prevents rapid state changes

## Troubleshooting

### Camera Not Working
- Ensure you're accessing via HTTPS or localhost
- Check browser permissions for camera access
- Try refreshing the page
- Test with a different browser

### Poor Performance
- Reduce particle count in `particle-system.js` (line 5)
- Lower post-processing quality (adjust bloomPass parameters)
- Close other browser tabs
- Use a device with better GPU

### Gestures Not Detected
- Ensure good lighting conditions
- Keep hands within camera frame
- Try adjusting MediaPipe confidence thresholds in `hand-tracker.js`
- Check browser console for errors

### Images Not Appearing
- Verify file format is supported (JPG, PNG, GIF, WebP)
- Check file size (very large images may cause issues)
- Look for console errors after upload
- Try a different image

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |

## Customization

### Changing Particle Count
In `particle-system.js`, line 5:
```javascript
this.particleCount = 300; // Adjust this value
```

### Adding New Emojis
In `particle-system.js`, line 68:
```javascript
this.emojis = ['🔴', '🎁', '🧦', '🔔', '👔', '🔺', '🧊', '🌳', '🎅', '⭐']; // Add more
```

### Adjusting Gesture Sensitivity
In `hand-tracker.js`, modify threshold values:
- `isHandOpen()`: Line 208 - adjust `openFingers >= 3`
- `isFist()`: Line 225 - adjust `distance < 0.2`
- `isPinching()`: Line 238 - adjust `distance < 0.06`

### Changing Colors
In `particle-system.js`, line 101:
```javascript
color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6)
```

## Known Limitations

1. **Two-Hand Gestures**: May not work reliably with poor lighting
2. **Image Zoom**: Only works for uploaded images, not emoji particles
3. **Mobile Support**: Hand tracking may be slower on mobile devices
4. **Firefox**: Some post-processing effects may render differently

## Future Enhancements

- [ ] Support for custom particle shapes (not just emojis)
- [ ] Audio reactivity with Web Audio API
- [ ] More gesture patterns (peace sign, okay sign, etc.)
- [ ] Particle collision physics
- [ ] Save/export particle arrangements
- [ ] VR support using WebXR

## License

This project is open source and available for educational purposes.

## Credits

- Three.js team for the amazing 3D library
- Google MediaPipe team for hand tracking
- GreenSock (GSAP) for smooth animations

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Made with ❤️ for the holiday season 🎄**
