/**
 * DrawDron - Audio Synthesis Engine
 * Handles Tone.js synthesis for drone sounds with configurable effects chain and arpeggiator
 */

const AudioEngine = {
    isInitialized: false,
    masterGain: null,
    limiter: null,
    activeSynths: new Map(), // Map of line ID to synth chain

    // Musical scales for arpeggiator
    scales: {
        major: [0, 2, 4, 5, 7, 9, 11],
        minor: [0, 2, 3, 5, 7, 8, 10],
        pentatonic: [0, 2, 4, 7, 9],
        chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    },

    /**
     * Initialize Tone.js audio context
     */
    async init() {
        if (this.isInitialized) return;

        await Tone.start();
        console.log('Audio context started');

        // Master chain
        this.limiter = new Tone.Limiter(-3).toDestination();
        this.masterGain = new Tone.Gain(0.7).connect(this.limiter);

        this.isInitialized = true;
    },

    /**
     * Generate arpeggio notes based on pattern
     * @param {string} baseNote - Base note (e.g., 'C3')
     * @param {number} octaves - Number of octaves
     * @param {string} pattern - Pattern type (up, down, upDown, downUp, random)
     * @returns {array} - Array of note names
     */
    generateArpNotes(baseNote, octaves = 2, pattern = 'up') {
        const scale = this.scales.pentatonic;
        const notes = [];

        // Parse base note
        const noteName = baseNote.slice(0, -1);
        const baseOctave = parseInt(baseNote.slice(-1));

        // Generate notes across octaves
        for (let oct = 0; oct < octaves; oct++) {
            for (const semitone of scale) {
                const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(noteName);
                const newNoteIndex = (noteIndex + semitone) % 12;
                const octaveOffset = Math.floor((noteIndex + semitone) / 12);
                const newNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][newNoteIndex];
                notes.push(`${newNote}${baseOctave + oct + octaveOffset}`);
            }
        }

        // Apply pattern
        switch (pattern) {
            case 'down':
                return notes.reverse();
            case 'upDown':
                return [...notes, ...notes.slice(1, -1).reverse()];
            case 'downUp':
                const reversed = notes.reverse();
                return [...reversed, ...reversed.slice(1, -1).reverse()];
            case 'random':
                // Shuffle array
                for (let i = notes.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [notes[i], notes[j]] = [notes[j], notes[i]];
                }
                return notes;
            default: // 'up'
                return notes;
        }
    },

    /**
     * Create a synth chain for a drawn line
     * Effects chain: osc -> filter -> tremolo -> distortion -> delay -> reverb -> panner -> gain -> master
     */
    createSynth(lineId, texture, x = 0.5, y = 0.5) {
        if (!this.isInitialized) {
            console.warn('Audio not initialized');
            return null;
        }

        // Calculate pan from x (-1 to 1)
        const pan = (x * 2) - 1;

        // Calculate filter frequency from y
        const minFreq = 80;
        const maxFreq = texture.filter?.maxFreq || 8000;
        const filterFreq = minFreq + ((1 - y) * (maxFreq - minFreq));

        const effects = texture.effects || {};
        const arp = texture.arpeggiator || {};
        const isArpEnabled = arp.enabled && arp.pattern;

        let osc, osc2, arpSequence = null;

        if (isArpEnabled) {
            // Create PolySynth for arpeggiator
            const notes = this.generateArpNotes(
                texture.note || 'C3',
                arp.octaves || 2,
                arp.pattern || 'up'
            );

            osc = new Tone.Synth({
                oscillator: { type: texture.oscillator?.type || 'sine' },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.5,
                    release: 0.3
                }
            });

            osc2 = new Tone.Synth({
                oscillator: { type: texture.oscillator?.type || 'sine' },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.5,
                    release: 0.3
                },
                detune: (texture.oscillator?.detune || 0) + 5
            });

            // Create arpeggio sequence
            let noteIndex = 0;
            arpSequence = new Tone.Loop((time) => {
                const note = notes[noteIndex % notes.length];
                osc.triggerAttackRelease(note, arp.rate || '8n', time);
                osc2.triggerAttackRelease(note, arp.rate || '8n', time);
                noteIndex++;
            }, arp.rate || '8n');

            arpSequence.start(0);
            Tone.Transport.start();

        } else {
            // Standard drone oscillators
            const oscType = texture.oscillator?.type || 'sine';
            osc = new Tone.Oscillator({
                type: oscType,
                frequency: texture.note || 'C3',
                detune: texture.oscillator?.detune || 0
            });

            osc2 = new Tone.Oscillator({
                type: oscType,
                frequency: texture.note || 'C3',
                detune: (texture.oscillator?.detune || 0) + 5
            });

            osc.start();
            osc2.start();
        }

        // Create filter
        const filter = new Tone.Filter({
            type: texture.filter?.type || 'lowpass',
            frequency: filterFreq,
            Q: texture.filter?.Q || 1,
            rolloff: -24
        });

        // Create effects - all configurable
        const tremolo = new Tone.Tremolo({
            frequency: effects.tremoloRate || 4,
            depth: effects.tremolo || 0,
            wet: effects.tremolo > 0 ? 1 : 0
        }).start();

        const distortion = new Tone.Distortion({
            distortion: effects.distortion || 0,
            wet: effects.distortion > 0 ? 1 : 0
        });

        const delay = new Tone.FeedbackDelay({
            delayTime: effects.delayTime || '8n',
            feedback: effects.delayFeedback || 0.3,
            wet: effects.delay || 0
        });

        const reverb = new Tone.Reverb({
            decay: effects.reverbDecay || 4,
            wet: effects.reverb || 0.5
        });

        const chorus = new Tone.Chorus({
            frequency: 1.5,
            delayTime: 3.5,
            depth: 0.7,
            wet: effects.chorus || 0
        }).start();

        const panner = new Tone.Panner(pan);
        const gain = new Tone.Gain(0);

        // Optional LFO for filter modulation
        let lfo = null;
        if (texture.lfo && texture.lfo.depth > 0) {
            lfo = new Tone.LFO({
                frequency: texture.lfo.rate || 1,
                min: Math.max(50, filterFreq * (1 - texture.lfo.depth)),
                max: Math.min(10000, filterFreq * (1 + texture.lfo.depth))
            }).connect(filter.frequency);
            lfo.start();
        }

        // Connect chain
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(tremolo);
        tremolo.connect(distortion);
        distortion.connect(delay);
        delay.connect(reverb);
        reverb.connect(chorus);
        chorus.connect(panner);
        panner.connect(gain);
        gain.connect(this.masterGain);

        // Ramp up gain (attack)
        const attackTime = texture.envelope?.attack || 1;
        const maxGain = 0.25;
        gain.gain.rampTo(maxGain, attackTime);

        // Store synth chain
        const synthChain = {
            osc,
            osc2,
            filter,
            tremolo,
            distortion,
            delay,
            reverb,
            chorus,
            panner,
            gain,
            lfo,
            arpSequence,
            isArp: isArpEnabled,
            texture,
            baseFilterFreq: filterFreq,
            maxGain,
            startTime: Tone.now(),
            isPlaying: true
        };

        this.activeSynths.set(lineId, synthChain);
        return synthChain;
    },

    /**
     * Update synth parameters based on line position
     */
    updateSynth(lineId, x, y) {
        const synth = this.activeSynths.get(lineId);
        if (!synth || !synth.isPlaying) return;

        const pan = (x * 2) - 1;
        synth.panner.pan.rampTo(pan, 0.1);

        const minFreq = 80;
        const maxFreq = synth.texture.filter?.maxFreq || 8000;
        const filterFreq = minFreq + ((1 - y) * (maxFreq - minFreq));
        synth.filter.frequency.rampTo(filterFreq, 0.1);
        synth.baseFilterFreq = filterFreq;
    },

    /**
     * Set gain for a synth (for fade effect)
     */
    setGain(lineId, volume) {
        const synth = this.activeSynths.get(lineId);
        if (!synth || !synth.isPlaying) return;
        synth.gain.gain.rampTo(volume * synth.maxGain, 0.1);
    },

    /**
     * Start fade out for a synth
     */
    fadeOut(lineId, duration) {
        const synth = this.activeSynths.get(lineId);
        if (!synth || !synth.isPlaying) return;

        const releaseTime = duration || synth.texture.envelope?.release || 5;
        synth.gain.gain.rampTo(0, releaseTime);
        synth.isPlaying = false;

        setTimeout(() => {
            this.destroySynth(lineId);
        }, releaseTime * 1000 + 500);
    },

    /**
     * Destroy a synth and free resources
     */
    destroySynth(lineId) {
        const synth = this.activeSynths.get(lineId);
        if (!synth) return;

        try {
            if (synth.arpSequence) {
                synth.arpSequence.stop();
                synth.arpSequence.dispose();
            }
            if (synth.isArp) {
                synth.osc.dispose();
                synth.osc2.dispose();
            } else {
                synth.osc.stop();
                synth.osc.dispose();
                synth.osc2.stop();
                synth.osc2.dispose();
            }
            synth.filter.dispose();
            synth.tremolo.dispose();
            synth.distortion.dispose();
            synth.delay.dispose();
            synth.reverb.dispose();
            synth.chorus.dispose();
            synth.panner.dispose();
            synth.gain.dispose();
            if (synth.lfo) synth.lfo.dispose();
        } catch (e) {
            // Ignore disposal errors
        }

        this.activeSynths.delete(lineId);
    },

    /**
     * Preview a texture
     */
    preview(texture) {
        const previewId = `preview-${Date.now()}`;
        this.createSynth(previewId, texture, 0.5, 0.3);
        setTimeout(() => {
            this.fadeOut(previewId, 1);
        }, 2000);
    },

    stopAll() {
        for (const [lineId] of this.activeSynths) {
            this.fadeOut(lineId, 0.5);
        }
    },

    getActiveCount() {
        return this.activeSynths.size;
    }
};

window.AudioEngine = AudioEngine;
