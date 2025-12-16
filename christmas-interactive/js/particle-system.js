export class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particleCount = 300;
        this.currentState = 'cloud'; // 'cloud', 'tree', 'rotating'
        this.userImages = [];
        this.selectedParticle = null;
        
        this.initScene();
        this.createParticles();
        this.setupPostProcessing();
        this.setupLighting();
        this.animate();
    }

    initScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        this.container.appendChild(this.renderer.domElement);

        // Environment map for reflections
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
        this.scene.environment = cubeRenderTarget.texture;

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Point lights
        const pointLight1 = new THREE.PointLight(0xff6b9d, 2, 100);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x6bcfff, 2, 100);
        pointLight2.position.set(-10, -10, 10);
        this.scene.add(pointLight2);

        // Special light for top of tree
        this.topLight = new THREE.PointLight(0xffeb3b, 3, 20);
        this.topLight.position.set(0, 15, 0);
        this.scene.add(this.topLight);
    }

    createParticles() {
        // Create emoji textures
        this.emojis = ['🔴', '🎁', '🧦', '🔔', '👔', '🔺', '🧊', '🌳', '🎅'];
        this.textures = this.emojis.map(emoji => this.createEmojiTexture(emoji));
        
        // Geometry for particles
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        
        // Material with reflections
        this.material = new THREE.MeshStandardMaterial({
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1.5,
            emissive: 0x222222,
            emissiveIntensity: 0.3
        });

        // Create instanced mesh
        this.instancedMesh = new THREE.InstancedMesh(
            geometry,
            this.material,
            this.particleCount
        );

        // Initialize particles with random positions
        this.particleData = [];
        const dummy = new THREE.Object3D();
        
        for (let i = 0; i < this.particleCount; i++) {
            const particle = {
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20
                ),
                targetPosition: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                scale: 1,
                targetScale: 1,
                rotation: new THREE.Euler(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                ),
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
                textureIndex: Math.floor(Math.random() * this.textures.length),
                isImage: false,
                imageTexture: null
            };
            
            this.particleData.push(particle);
            
            dummy.position.copy(particle.position);
            dummy.rotation.copy(particle.rotation);
            dummy.scale.setScalar(particle.scale);
            dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, dummy.matrix);
            this.instancedMesh.setColorAt(i, particle.color);
        }
        
        this.scene.add(this.instancedMesh);
        
        // Create special glowing light bulb at top
        this.createTopLightBulb();
    }

    createTopLightBulb() {
        const geometry = new THREE.SphereGeometry(0.8, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffeb3b,
            emissive: 0xffeb3b,
            emissiveIntensity: 2,
            metalness: 0.5,
            roughness: 0.1
        });
        
        this.lightBulb = new THREE.Mesh(geometry, material);
        this.lightBulb.position.set(0, 15, 0);
        this.scene.add(this.lightBulb);
    }

    createEmojiTexture(emoji) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, 128, 128);
        
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    setupPostProcessing() {
        // Composer
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom pass
        this.bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, // strength
            0.4, // radius
            0.85 // threshold
        );
        this.composer.addPass(this.bloomPass);
    }

    updateParticleState(state, params = {}) {
        this.currentState = state;
        
        switch (state) {
            case 'cloud':
                this.arrangeAsCloud(params.spread || 1);
                break;
            case 'tree':
                this.arrangeAsTree();
                break;
            case 'rotating':
                this.startTreeRotation();
                break;
        }
    }

    arrangeAsCloud(spread) {
        const baseSpread = 20;
        const targetSpread = baseSpread * spread;
        
        this.particleData.forEach((particle, i) => {
            const angle = (i / this.particleCount) * Math.PI * 2 * 5;
            const radius = (Math.random() * 0.5 + 0.5) * targetSpread;
            
            particle.targetPosition.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * targetSpread,
                Math.sin(angle) * radius
            );
            particle.targetScale = 0.8 + Math.random() * 0.4;
        });
    }

    arrangeAsTree() {
        const treeHeight = 25;
        const baseWidth = 10;
        
        this.particleData.forEach((particle, i) => {
            const progress = i / this.particleCount;
            const height = progress * treeHeight - treeHeight / 2;
            const treeRadius = baseWidth * (1 - progress * 0.8);
            
            // Spiral arrangement
            const spiralAngle = progress * Math.PI * 10;
            const spiralRadius = treeRadius * Math.sin(progress * Math.PI);
            
            particle.targetPosition.set(
                Math.cos(spiralAngle) * spiralRadius,
                height,
                Math.sin(spiralAngle) * spiralRadius
            );
            particle.targetScale = 0.6 + (1 - progress) * 0.4;
        });
        
        // Position light bulb at top
        if (this.lightBulb) {
            gsap.to(this.lightBulb.position, {
                y: treeHeight / 2 + 2,
                duration: 1.5,
                ease: 'power2.inOut'
            });
        }
    }

    startTreeRotation() {
        this.isRotating = true;
        this.rotationSpeed = 0.01;
        
        // Add slight explosion effect
        this.particleData.forEach(particle => {
            const direction = particle.targetPosition.clone().normalize();
            particle.targetPosition.add(direction.multiplyScalar(2));
        });
    }

    updateParticles(deltaTime) {
        const dummy = new THREE.Object3D();
        
        this.particleData.forEach((particle, i) => {
            // Smooth movement towards target
            particle.velocity.lerp(
                particle.targetPosition.clone().sub(particle.position).multiplyScalar(0.05),
                0.1
            );
            particle.position.add(particle.velocity);
            
            // Smooth scale transition
            particle.scale += (particle.targetScale - particle.scale) * 0.05;
            
            // Rotation
            particle.rotation.x += 0.01;
            particle.rotation.y += 0.01;
            
            // Update instance matrix
            dummy.position.copy(particle.position);
            dummy.rotation.copy(particle.rotation);
            dummy.scale.setScalar(particle.scale);
            
            // Apply texture if it's an image particle
            if (particle.isImage && particle.imageTexture) {
                // Image particles handled separately
            }
            
            dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, dummy.matrix);
        });
        
        this.instancedMesh.instanceMatrix.needsUpdate = true;
        
        // Rotate entire tree if in rotating state
        if (this.isRotating && this.currentState === 'rotating') {
            this.instancedMesh.rotation.y += this.rotationSpeed;
            if (this.lightBulb) {
                this.lightBulb.rotation.y += this.rotationSpeed;
            }
        }
        
        // Animate light bulb glow
        if (this.lightBulb) {
            this.lightBulb.material.emissiveIntensity = 
                2 + Math.sin(Date.now() * 0.003) * 0.5;
        }
    }

    addUserImage(imageUrl) {
        const loader = new THREE.TextureLoader();
        loader.load(imageUrl, (texture) => {
            // Find a random particle to convert to image
            const randomIndex = Math.floor(Math.random() * this.particleCount);
            const particle = this.particleData[randomIndex];
            
            particle.isImage = true;
            particle.imageTexture = texture;
            this.userImages.push({ index: randomIndex, texture });
            
            console.log('Image added to particle', randomIndex);
        });
    }

    zoomToParticle(index) {
        if (this.selectedParticle !== null) return; // Already zooming
        
        this.selectedParticle = index;
        const particle = this.particleData[index];
        
        // Smooth zoom with GSAP
        gsap.to(particle, {
            targetScale: 3,
            duration: 0.8,
            ease: 'power2.out'
        });
        
        // Enhance glow
        this.bloomPass.strength = 2.5;
    }

    resetZoom() {
        if (this.selectedParticle === null) return;
        
        const particle = this.particleData[this.selectedParticle];
        
        gsap.to(particle, {
            targetScale: 1,
            duration: 0.8,
            ease: 'power2.in'
        });
        
        this.bloomPass.strength = 1.5;
        this.selectedParticle = null;
    }

    findClosestParticle(screenX, screenY) {
        // Convert screen coordinates to world coordinates
        const mouse = new THREE.Vector2(
            (screenX / window.innerWidth) * 2 - 1,
            -(screenY / window.innerHeight) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Find closest particle with image
        let closestIndex = -1;
        let closestDistance = Infinity;
        
        this.userImages.forEach(({ index }) => {
            const particle = this.particleData[index];
            const distance = raycaster.ray.distanceToPoint(particle.position);
            
            if (distance < closestDistance && distance < 5) {
                closestDistance = distance;
                closestIndex = index;
            }
        });
        
        return closestIndex;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = 0.016;
        this.updateParticles(deltaTime);
        
        // Render with post-processing
        this.composer.render();
    }
}
