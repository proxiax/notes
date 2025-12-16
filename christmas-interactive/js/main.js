import { ParticleSystem } from './particle-system.js';
import { HandTracker } from './hand-tracker.js';

class ChristmasInteractive {
    constructor() {
        this.container = document.getElementById('container');
        this.statusElement = document.getElementById('status');
        this.particleSystem = null;
        this.handTracker = null;
        this.isPinching = false;
        this.pinnedParticle = null;
        
        this.init();
    }

    async init() {
        try {
            this.updateStatus('Initializing 3D scene...', 'warning');
            
            // Initialize particle system
            this.particleSystem = new ParticleSystem(this.container);
            
            this.updateStatus('Requesting camera access...', 'warning');
            
            // Initialize hand tracking
            this.handTracker = new HandTracker((gesture, data) => {
                this.handleGesture(gesture, data);
            });
            
            await this.handTracker.init();
            
            this.updateStatus('Ready! Start using hand gestures 👋', 'success');
            
            // Setup UI controls
            this.setupControls();
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.updateStatus('Error: ' + error.message, 'error');
            
            if (error.name === 'NotAllowedError') {
                this.updateStatus('Camera permission denied. Please allow camera access.', 'error');
            } else if (error.name === 'NotFoundError') {
                this.updateStatus('No camera found. Please connect a camera.', 'error');
            }
        }
    }

    handleGesture(gesture, data) {
        console.log('Gesture detected:', gesture, data);
        
        switch (gesture) {
            case 'bothHandsOpen':
                // Expand particle cloud
                this.particleSystem.updateParticleState('cloud', { spread: data.spread });
                this.updateStatus('Hands open - Cloud expanded ☁️', 'success');
                break;
                
            case 'bothHandsClosed':
                // Contract particle cloud
                this.particleSystem.updateParticleState('cloud', { spread: data.spread });
                this.updateStatus('Hands closed - Cloud contracted 🤏', 'success');
                break;
                
            case 'fist':
                // Form Christmas tree
                this.particleSystem.updateParticleState('tree');
                this.updateStatus('Fist - Forming Christmas tree 🎄', 'success');
                break;
                
            case 'openAfterFist':
                // Rotate tree
                this.particleSystem.updateParticleState('rotating');
                this.updateStatus('Open hand - Tree rotating 🔄', 'success');
                break;
                
            case 'pinchStart':
                // Find and zoom to nearest particle with image
                this.isPinching = true;
                const closestParticle = this.particleSystem.findClosestParticle(data.x, data.y);
                
                if (closestParticle >= 0) {
                    this.pinnedParticle = closestParticle;
                    this.particleSystem.zoomToParticle(closestParticle);
                    this.updateStatus('Pinch - Zooming image 🖼️', 'success');
                } else {
                    this.updateStatus('Pinch detected but no image found nearby', 'warning');
                }
                break;
                
            case 'pinchMove':
                // Track pinch movement (optional: could move the zoomed particle)
                break;
                
            case 'pinchEnd':
                // Release zoom
                if (this.pinnedParticle !== null) {
                    this.particleSystem.resetZoom();
                    this.pinnedParticle = null;
                    this.isPinching = false;
                    this.updateStatus('Released pinch - Image restored 👌', 'success');
                }
                break;
        }
    }

    setupControls() {
        // Image upload
        const imageUpload = document.getElementById('imageUpload');
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.particleSystem.addUserImage(event.target.result);
                    this.updateStatus('Image uploaded successfully! 📸', 'success');
                };
                reader.readAsDataURL(file);
            }
        });

        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                fullscreenBtn.textContent = '⛶ Exit Fullscreen';
            } else {
                document.exitFullscreen();
                fullscreenBtn.textContent = '⛶ Fullscreen';
            }
        });

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fullscreenBtn.textContent = '⛶ Fullscreen';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case '1':
                    this.particleSystem.updateParticleState('cloud', { spread: 1 });
                    this.updateStatus('Cloud formation (key 1)', 'success');
                    break;
                case '2':
                    this.particleSystem.updateParticleState('tree');
                    this.updateStatus('Tree formation (key 2)', 'success');
                    break;
                case '3':
                    this.particleSystem.updateParticleState('rotating');
                    this.updateStatus('Rotating tree (key 3)', 'success');
                    break;
                case 'f':
                case 'F':
                    fullscreenBtn.click();
                    break;
            }
        });
    }

    updateStatus(message, type = 'success') {
        this.statusElement.textContent = message;
        this.statusElement.className = '';
        this.statusElement.classList.add(type);
        
        // Auto-clear success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (this.statusElement.textContent === message) {
                    this.updateStatus('Ready! Use hand gestures 👋', 'success');
                }
            }, 3000);
        }
    }

    destroy() {
        if (this.handTracker) {
            this.handTracker.destroy();
        }
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new ChristmasInteractive();
    });
} else {
    window.app = new ChristmasInteractive();
}

// Handle cleanup
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.destroy();
    }
});
