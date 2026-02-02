/**
 * DrawDron - L-System Generator
 * Handles fractal branching growth for visual feedback
 */

const LSystem = {
    /**
     * L-System production rules
     * Each rule set creates different branching patterns
     */
    rules: {
        // Default tree-like growth
        default: {
            axiom: 'X',
            productions: {
                'X': 'F[−X][+X]FX',
                'F': 'FF'
            },
            angle: 25,
            lengthFactor: 0.7
        },
        // More organic/coral-like
        organic: {
            axiom: 'X',
            productions: {
                'X': 'F−[[X]+X]+F[+FX]−X',
                'F': 'FF'
            },
            angle: 22.5,
            lengthFactor: 0.6
        },
        // Minimal branching
        minimal: {
            axiom: 'F',
            productions: {
                'F': 'F[+F]F[−F]F'
            },
            angle: 30,
            lengthFactor: 0.5
        }
    },

    /**
     * Apply L-System productions to a string
     * @param {string} input - Current string
     * @param {object} productions - Production rules
     * @returns {string} - Expanded string
     */
    produce(input, productions) {
        let output = '';
        for (const char of input) {
            output += productions[char] || char;
        }
        return output;
    },

    /**
     * Generate L-System string for given iterations
     * @param {string} axiom - Starting string
     * @param {object} productions - Production rules
     * @param {number} iterations - Number of iterations
     * @returns {string} - Final L-System string
     */
    generate(axiom, productions, iterations) {
        let current = axiom;
        for (let i = 0; i < iterations; i++) {
            current = this.produce(current, productions);
        }
        return current;
    },

    /**
     * Interpret L-System string as drawing commands
     * Uses turtle graphics interpretation
     * @param {string} lstring - L-System string
     * @param {object} startPoint - Starting point {x, y}
     * @param {number} startAngle - Starting angle in degrees
     * @param {number} segmentLength - Length of each segment
     * @param {number} angleIncrement - Angle change for +/- commands
     * @param {number} lengthFactor - Length reduction per iteration
     * @returns {array} - Array of path segments
     */
    interpret(lstring, startPoint, startAngle, segmentLength, angleIncrement, lengthFactor = 0.7) {
        const segments = [];
        const stack = [];

        let x = startPoint.x;
        let y = startPoint.y;
        let angle = startAngle;
        let length = segmentLength;
        let depth = 0;

        for (const char of lstring) {
            switch (char) {
                case 'F': // Move forward and draw
                    const newX = x + length * Math.cos(angle * Math.PI / 180);
                    const newY = y + length * Math.sin(angle * Math.PI / 180);
                    segments.push({
                        from: { x, y },
                        to: { x: newX, y: newY },
                        depth
                    });
                    x = newX;
                    y = newY;
                    break;

                case '+': // Turn right
                    angle += angleIncrement;
                    break;

                case '−': // Turn left (using minus sign)
                case '-':
                    angle -= angleIncrement;
                    break;

                case '[': // Save state
                    stack.push({ x, y, angle, length, depth });
                    length *= lengthFactor;
                    depth++;
                    break;

                case ']': // Restore state
                    const state = stack.pop();
                    if (state) {
                        x = state.x;
                        y = state.y;
                        angle = state.angle;
                        length = state.length;
                        depth = state.depth;
                    }
                    break;

                case 'X': // Variable, ignored in interpretation
                    break;
            }
        }

        return segments;
    },

    /**
     * Create an animated branch growth from a point
     * @param {object} startPoint - {x, y} start position
     * @param {number} direction - Direction angle in degrees
     * @param {object} texture - Texture configuration
     * @returns {object} - Branch growth object
     */
    createBranch(startPoint, direction, texture) {
        const ruleSet = this.rules.default;
        const iterations = 3; // Fixed for performance

        // Generate L-System string
        const lstring = this.generate(
            ruleSet.axiom,
            ruleSet.productions,
            iterations
        );

        // Interpret to get segments
        const baseLength = 10 + Math.random() * 10;
        const segments = this.interpret(
            lstring,
            startPoint,
            direction,
            baseLength,
            ruleSet.angle + (Math.random() * 10 - 5), // Add some randomness
            ruleSet.lengthFactor
        );

        return {
            id: `branch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            startPoint,
            direction,
            segments,
            texture,
            growthSpeed: texture.growthSpeed || 1,
            fadeTime: texture.fadeTime || 15,
            currentSegment: 0,
            opacity: 1,
            startTime: Date.now(),
            isComplete: false,
            isDead: false
        };
    },

    /**
     * Get current visible segments based on growth progress
     * @param {object} branch - Branch object
     * @param {number} progress - Progress 0-1
     * @returns {array} - Visible segments
     */
    getVisibleSegments(branch, progress) {
        const visibleCount = Math.floor(branch.segments.length * progress);
        return branch.segments.slice(0, visibleCount);
    }
};

// Export for use in other modules
window.LSystem = LSystem;
