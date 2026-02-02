/**
 * DrawDron - Canvas Module
 * Handles Paper.js canvas drawing and branch visualization
 */

const CanvasEngine = {
    canvas: null,
    isDrawing: false,
    branches: [],
    drawPath: null,
    lastPoint: null,
    animationFrame: null,
    hintElement: null,

    /**
     * Initialize Paper.js canvas
     */
    init() {
        this.canvas = document.getElementById('canvas');
        this.hintElement = document.getElementById('hint');

        // Setup Paper.js
        paper.setup(this.canvas);

        // Create drawing layer
        this.drawLayer = new paper.Layer();
        this.drawLayer.activate();

        // Setup event handlers
        this.setupEvents();

        // Start animation loop
        this.startAnimation();

        console.log('Canvas initialized');
    },

    /**
     * Setup mouse/touch event handlers
     */
    setupEvents() {
        const tool = new paper.Tool();

        tool.onMouseDown = (event) => {
            this.onDrawStart(event.point);
        };

        tool.onMouseDrag = (event) => {
            this.onDrawMove(event.point);
        };

        tool.onMouseUp = (event) => {
            this.onDrawEnd(event.point);
        };

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const point = new paper.Point(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
            this.onDrawStart(point);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const point = new paper.Point(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
            this.onDrawMove(point);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onDrawEnd(this.lastPoint);
        });
    },

    /**
     * Handle draw start
     */
    onDrawStart(point) {
        // Hide hint on first interaction
        if (this.hintElement) {
            this.hintElement.classList.add('hidden');
        }

        this.isDrawing = true;
        this.lastPoint = point;

        // Start a new path for visual feedback
        const texture = TextureManager.getCurrent();
        this.drawPath = new paper.Path({
            strokeColor: texture.color,
            strokeWidth: 2,
            strokeCap: 'round'
        });
        this.drawPath.add(point);

        // Update info panel
        this.updateInfoPanel(point);
    },

    /**
     * Handle draw move
     */
    onDrawMove(point) {
        if (!this.isDrawing) return;

        // Add to drawing path
        if (this.drawPath) {
            this.drawPath.add(point);
        }

        // Calculate distance from last point
        const distance = point.getDistance(this.lastPoint);

        // Create offshoot branches at intervals
        if (distance > 30) {
            this.createOffshoot(point);
            this.lastPoint = point;
        }

        // Update info panel
        this.updateInfoPanel(point);
    },

    /**
     * Handle draw end
     */
    onDrawEnd(point) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        // Fade out the main draw path
        if (this.drawPath) {
            this.fadeOutPath(this.drawPath, 2);
            this.drawPath = null;
        }

        // Create one final offshoot
        if (point) {
            this.createOffshoot(point);
        }
    },

    /**
     * Create an offshoot branch at a point
     */
    createOffshoot(point) {
        const texture = TextureManager.getCurrent();

        // Calculate direction based on movement
        let direction = -90; // Default upward
        if (this.lastPoint) {
            direction = Math.atan2(
                point.y - this.lastPoint.y,
                point.x - this.lastPoint.x
            ) * 180 / Math.PI;
        }

        // Add some randomness to direction
        direction += (Math.random() - 0.5) * 60;

        // Create L-System branch
        const branch = LSystem.createBranch(
            { x: point.x, y: point.y },
            direction,
            texture
        );

        // Create audio synth for this branch
        const canvasWidth = paper.view.size.width;
        const canvasHeight = paper.view.size.height;
        const normalizedX = point.x / canvasWidth;
        const normalizedY = point.y / canvasHeight;

        AudioEngine.createSynth(
            branch.id,
            texture,
            normalizedX,
            normalizedY
        );

        // Add to branches array
        this.branches.push(branch);
    },

    /**
     * Update info panel with current position data
     */
    updateInfoPanel(point) {
        const canvasWidth = paper.view.size.width;
        const canvasHeight = paper.view.size.height;

        // Calculate normalized values
        const normalizedX = point.x / canvasWidth;
        const normalizedY = point.y / canvasHeight;

        // Pan display (-L to +R)
        const pan = ((normalizedX * 2) - 1).toFixed(2);
        const panDisplay = document.getElementById('panDisplay');
        if (panDisplay) {
            if (pan < -0.1) {
                panDisplay.textContent = `L ${Math.abs(pan)}`;
            } else if (pan > 0.1) {
                panDisplay.textContent = `R ${pan}`;
            } else {
                panDisplay.textContent = 'C';
            }
        }

        // Filter display (Y position)
        const filterDisplay = document.getElementById('filterDisplay');
        if (filterDisplay) {
            const filterPercent = Math.round((1 - normalizedY) * 100);
            filterDisplay.textContent = `${filterPercent}%`;
        }
    },

    /**
     * Fade out a path over time
     */
    fadeOutPath(path, duration) {
        const startOpacity = path.opacity;
        const startTime = Date.now();

        const fade = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = elapsed / duration;

            if (progress >= 1) {
                path.remove();
                return;
            }

            path.opacity = startOpacity * (1 - progress);
            requestAnimationFrame(fade);
        };

        fade();
    },

    /**
     * Main animation loop
     */
    startAnimation() {
        const animate = () => {
            this.animationFrame = requestAnimationFrame(animate);
            this.updateBranches();
            paper.view.update();
        };

        animate();
    },

    /**
     * Update all branches (growth and fade)
     */
    updateBranches() {
        const now = Date.now();
        const toRemove = [];

        for (const branch of this.branches) {
            if (branch.isDead) {
                toRemove.push(branch);
                continue;
            }

            const elapsed = (now - branch.startTime) / 1000; // seconds
            const growthDuration = 3 / branch.growthSpeed; // Growth phase
            const totalDuration = growthDuration + branch.fadeTime;

            if (elapsed < growthDuration) {
                // Growth phase
                const growthProgress = elapsed / growthDuration;
                this.renderBranch(branch, growthProgress, 1);
            } else if (elapsed < totalDuration) {
                // Fade phase
                const fadeElapsed = elapsed - growthDuration;
                const fadeProgress = fadeElapsed / branch.fadeTime;
                const opacity = 1 - fadeProgress;

                this.renderBranch(branch, 1, opacity);

                // Update audio volume
                AudioEngine.setGain(branch.id, opacity);
            } else {
                // Dead
                branch.isDead = true;
                AudioEngine.fadeOut(branch.id, 0.5);
                this.clearBranchPaths(branch);
            }
        }

        // Remove dead branches
        for (const branch of toRemove) {
            const index = this.branches.indexOf(branch);
            if (index > -1) {
                this.branches.splice(index, 1);
            }
        }
    },

    /**
     * Render a branch at current growth progress
     */
    renderBranch(branch, growthProgress, opacity) {
        // Clear previous paths for this branch
        this.clearBranchPaths(branch);

        // Get visible segments
        const segments = LSystem.getVisibleSegments(branch, growthProgress);

        // Create paths for segments
        branch.paths = [];

        for (const segment of segments) {
            const path = new paper.Path.Line({
                from: new paper.Point(segment.from.x, segment.from.y),
                to: new paper.Point(segment.to.x, segment.to.y),
                strokeColor: branch.texture.color,
                strokeWidth: Math.max(1, 3 - segment.depth * 0.5),
                strokeCap: 'round',
                opacity: opacity * (1 - segment.depth * 0.15)
            });

            branch.paths.push(path);
        }
    },

    /**
     * Clear all paths for a branch
     */
    clearBranchPaths(branch) {
        if (branch.paths) {
            for (const path of branch.paths) {
                path.remove();
            }
            branch.paths = [];
        }
    },

    /**
     * Clear all branches and stop audio
     */
    clear() {
        for (const branch of this.branches) {
            this.clearBranchPaths(branch);
            AudioEngine.fadeOut(branch.id, 0.5);
        }
        this.branches = [];

        // Clear any active draw path
        if (this.drawPath) {
            this.drawPath.remove();
            this.drawPath = null;
        }

        paper.project.activeLayer.removeChildren();
    },

    /**
     * Get current branch count
     */
    getBranchCount() {
        return this.branches.length;
    }
};

// Export for use in other modules
window.CanvasEngine = CanvasEngine;
