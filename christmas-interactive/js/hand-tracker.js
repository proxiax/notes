export class HandTracker {
    constructor(onGestureCallback) {
        this.onGesture = onGestureCallback;
        this.hands = null;
        this.camera = null;
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('handCanvas');
        this.canvasCtx = this.canvasElement ? this.canvasElement.getContext('2d') : null;
        
        this.previousGesture = null;
        this.gestureState = {
            bothHandsOpen: false,
            bothHandsClosed: false,
            oneFist: false,
            openAfterFist: false,
            pinching: false,
            pinchPosition: { x: 0, y: 0 }
        };
        
        this.wasFist = false;
    }

    async init() {
        try {
            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onResults(results));

            // Setup camera
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                } 
            });
            
            this.videoElement.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
            });

            // Setup camera for MediaPipe
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    await this.hands.send({ image: this.videoElement });
                },
                width: 640,
                height: 480
            });

            this.camera.start();
            
            return true;
        } catch (error) {
            console.error('Error initializing hand tracker:', error);
            throw error;
        }
    }

    onResults(results) {
        // Clear canvas
        if (this.canvasCtx) {
            this.canvasCtx.save();
            this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // Draw hands (optional visualization)
            if (this.canvasCtx) {
                for (const landmarks of results.multiHandLandmarks) {
                    this.drawHand(landmarks);
                }
            }

            // Detect gestures
            this.detectGestures(results.multiHandLandmarks, results.multiHandedness);
        } else {
            // No hands detected
            this.gestureState.bothHandsOpen = false;
            this.gestureState.bothHandsClosed = false;
            this.gestureState.oneFist = false;
            this.gestureState.pinching = false;
        }

        if (this.canvasCtx) {
            this.canvasCtx.restore();
        }
    }

    drawHand(landmarks) {
        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17] // Palm
        ];

        this.canvasCtx.strokeStyle = '#00ff00';
        this.canvasCtx.lineWidth = 2;

        for (const [start, end] of connections) {
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(
                landmarks[start].x * this.canvasElement.width,
                landmarks[start].y * this.canvasElement.height
            );
            this.canvasCtx.lineTo(
                landmarks[end].x * this.canvasElement.width,
                landmarks[end].y * this.canvasElement.height
            );
            this.canvasCtx.stroke();
        }

        // Draw landmarks
        for (const landmark of landmarks) {
            this.canvasCtx.fillStyle = '#ff0000';
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                landmark.x * this.canvasElement.width,
                landmark.y * this.canvasElement.height,
                3,
                0,
                2 * Math.PI
            );
            this.canvasCtx.fill();
        }
    }

    detectGestures(handsLandmarks, handedness) {
        const numHands = handsLandmarks.length;
        
        if (numHands === 2) {
            // Two hands detected
            const hand1Open = this.isHandOpen(handsLandmarks[0]);
            const hand2Open = this.isHandOpen(handsLandmarks[1]);
            
            if (hand1Open && hand2Open) {
                // Both hands open
                if (!this.gestureState.bothHandsOpen) {
                    this.gestureState.bothHandsOpen = true;
                    this.gestureState.bothHandsClosed = false;
                    this.onGesture('bothHandsOpen', { spread: 1.5 });
                }
            } else if (!hand1Open && !hand2Open) {
                // Both hands closed
                if (!this.gestureState.bothHandsClosed) {
                    this.gestureState.bothHandsClosed = true;
                    this.gestureState.bothHandsOpen = false;
                    this.onGesture('bothHandsClosed', { spread: 0.3 });
                }
            }
            
            // Check for fist
            const hand1Fist = this.isFist(handsLandmarks[0]);
            const hand2Fist = this.isFist(handsLandmarks[1]);
            
            if (hand1Fist || hand2Fist) {
                if (!this.wasFist) {
                    this.wasFist = true;
                    this.gestureState.oneFist = true;
                    this.onGesture('fist', {});
                }
            } else if (this.wasFist && (hand1Open || hand2Open)) {
                // Open hand after fist
                this.wasFist = false;
                this.gestureState.openAfterFist = true;
                this.onGesture('openAfterFist', {});
            }
        } else if (numHands === 1) {
            // One hand detected
            const hand = handsLandmarks[0];
            const handOpen = this.isHandOpen(hand);
            const handFist = this.isFist(hand);
            
            // Check for pinch gesture
            const isPinching = this.isPinching(hand);
            
            if (isPinching) {
                // Get pinch position (thumb and index finger midpoint)
                const thumb = hand[4];
                const index = hand[8];
                const pinchX = (thumb.x + index.x) / 2;
                const pinchY = (thumb.y + index.y) / 2;
                
                this.gestureState.pinchPosition.x = pinchX * window.innerWidth;
                this.gestureState.pinchPosition.y = pinchY * window.innerHeight;
                
                if (!this.gestureState.pinching) {
                    this.gestureState.pinching = true;
                    this.onGesture('pinchStart', this.gestureState.pinchPosition);
                } else {
                    this.onGesture('pinchMove', this.gestureState.pinchPosition);
                }
            } else {
                if (this.gestureState.pinching) {
                    this.gestureState.pinching = false;
                    this.onGesture('pinchEnd', {});
                }
            }
            
            // Check for fist with one hand
            if (handFist) {
                if (!this.wasFist) {
                    this.wasFist = true;
                    this.gestureState.oneFist = true;
                    this.onGesture('fist', {});
                }
            } else if (this.wasFist && handOpen) {
                this.wasFist = false;
                this.gestureState.openAfterFist = true;
                this.onGesture('openAfterFist', {});
            }
        }
    }

    isHandOpen(landmarks) {
        // Check if fingers are extended
        const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky tips
        const fingerMids = [6, 10, 14, 18]; // Mid joints
        
        let openFingers = 0;
        
        for (let i = 0; i < fingerTips.length; i++) {
            const tip = landmarks[fingerTips[i]];
            const mid = landmarks[fingerMids[i]];
            
            // If tip is higher than mid (extended), finger is open
            if (tip.y < mid.y) {
                openFingers++;
            }
        }
        
        // Check thumb separately (horizontal check)
        const thumbTip = landmarks[4];
        const thumbMid = landmarks[2];
        if (Math.abs(thumbTip.x - thumbMid.x) > 0.05) {
            openFingers++;
        }
        
        return openFingers >= 3; // At least 3 fingers open
    }

    isFist(landmarks) {
        // Check if all fingers are curled
        const fingerTips = [8, 12, 16, 20];
        const palm = landmarks[0];
        
        let closedFingers = 0;
        
        for (const tipIndex of fingerTips) {
            const tip = landmarks[tipIndex];
            const distance = this.distance(tip, palm);
            
            // If fingertip is close to palm, finger is closed
            if (distance < 0.2) {
                closedFingers++;
            }
        }
        
        return closedFingers >= 3; // At least 3 fingers closed
    }

    isPinching(landmarks) {
        // Check distance between thumb tip and index finger tip
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        const distance = this.distance(thumbTip, indexTip);
        
        // Pinching if distance is small
        return distance < 0.06;
    }

    distance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = (point1.z || 0) - (point2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    getHandSpread(landmarks) {
        // Calculate average distance from palm to fingertips
        const palm = landmarks[0];
        const fingerTips = [4, 8, 12, 16, 20];
        
        let totalDistance = 0;
        for (const tipIndex of fingerTips) {
            totalDistance += this.distance(palm, landmarks[tipIndex]);
        }
        
        return totalDistance / fingerTips.length;
    }

    destroy() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}
