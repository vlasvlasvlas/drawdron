/**
 * DrawDron - Texture Management
 * Handles loading, saving, and managing drone textures
 */

const TextureManager = {
  textures: [],
  currentIndex: 0,
  storageKey: 'drawdron-textures',

  /**
   * Initialize texture manager
   */
  async init() {
    // Try to load from localStorage first
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.textures = JSON.parse(stored);
        console.log('Loaded textures from localStorage');
        return;
      } catch (e) {
        console.warn('Failed to parse stored textures, loading defaults');
      }
    }

    // Load default textures from JSON
    await this.loadDefaults();
  },

  /**
   * Load default textures from JSON file
   */
  async loadDefaults() {
    try {
      const response = await fetch('data/textures.json');
      const data = await response.json();
      this.textures = data.textures;
      this.save();
      console.log('Loaded default textures');
    } catch (e) {
      console.error('Failed to load default textures:', e);
      // Fallback to hardcoded defaults
      this.textures = this.getHardcodedDefaults();
      this.save();
    }
  },

  /**
   * Get hardcoded default textures as fallback
   */
  getHardcodedDefaults() {
    return [
      {
        id: 'deep-hum',
        name: 'Deep Hum',
        color: '#00D9FF',
        growthSpeed: 0.8,
        fadeTime: 15,
        oscillator: { type: 'sawtooth', detune: 8 },
        filter: { type: 'lowpass', baseFreq: 200, Q: 1 },
        effects: { reverb: 0.6, delay: 0.2, chorus: 0.1 },
        envelope: { attack: 2, release: 5 },
        note: 'C2'
      },
      {
        id: 'shimmer',
        name: 'Shimmer',
        color: '#A855F7',
        growthSpeed: 1.2,
        fadeTime: 10,
        oscillator: { type: 'sine', detune: 3 },
        filter: { type: 'highpass', baseFreq: 800, Q: 0.5 },
        effects: { reverb: 0.8, delay: 0.5, chorus: 0.4 },
        envelope: { attack: 0.5, release: 8 },
        note: 'E3'
      },
      {
        id: 'pulse',
        name: 'Pulse',
        color: '#EF4444',
        growthSpeed: 0.5,
        fadeTime: 20,
        oscillator: { type: 'square', detune: 0 },
        filter: { type: 'bandpass', baseFreq: 400, Q: 4 },
        effects: { reverb: 0.3, delay: 0.7, chorus: 0 },
        envelope: { attack: 0.1, release: 3 },
        lfo: { rate: 2, depth: 0.5 },
        note: 'A2'
      }
    ];
  },

  /**
   * Get current texture
   */
  getCurrent() {
    return this.textures[this.currentIndex] || this.textures[0];
  },

  /**
   * Set current texture by index
   */
  setCurrent(index) {
    if (index >= 0 && index < this.textures.length) {
      this.currentIndex = index;
      return this.getCurrent();
    }
    return null;
  },

  /**
   * Get texture by index
   */
  get(index) {
    return this.textures[index];
  },

  /**
   * Get all textures
   */
  getAll() {
    return this.textures;
  },

  /**
   * Add a new texture
   */
  add(texture) {
    // Generate unique ID
    texture.id = texture.id || `texture-${Date.now()}`;
    this.textures.push(texture);
    this.save();
    return this.textures.length - 1; // Return new index
  },

  /**
   * Update a texture
   */
  update(index, texture) {
    if (index >= 0 && index < this.textures.length) {
      this.textures[index] = { ...this.textures[index], ...texture };
      this.save();
      return true;
    }
    return false;
  },

  /**
   * Delete a texture
   */
  delete(index) {
    if (index >= 0 && index < this.textures.length && this.textures.length > 1) {
      this.textures.splice(index, 1);
      if (this.currentIndex >= this.textures.length) {
        this.currentIndex = this.textures.length - 1;
      }
      this.save();
      return true;
    }
    return false;
  },

  /**
   * Save textures to localStorage
   */
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.textures));
  },

  /**
   * Export textures as JSON string
   */
  export() {
    return JSON.stringify({ textures: this.textures }, null, 2);
  },

  /**
   * Import textures from JSON string
   */
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.textures && Array.isArray(data.textures)) {
        this.textures = data.textures;
        this.currentIndex = 0;
        this.save();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import textures:', e);
      return false;
    }
  },

  /**
   * Reset to default textures
   */
  async reset() {
    localStorage.removeItem(this.storageKey);
    await this.loadDefaults();
    this.currentIndex = 0;
  },

  /**
   * Create a blank texture template
   */
  createBlank() {
    return {
      id: `texture-${Date.now()}`,
      name: 'New Texture',
      color: '#ffffff',
      note: 'C3',
      growthSpeed: 1.0,
      fadeTime: 15,
      oscillator: { type: 'sine', detune: 0 },
      filter: { type: 'lowpass', maxFreq: 8000, Q: 1 },
      effects: {
        tremolo: 0,
        tremoloRate: 4,
        distortion: 0,
        delay: 0.3,
        delayTime: '8n',
        delayFeedback: 0.4,
        reverb: 0.5,
        reverbDecay: 5,
        chorus: 0
      },
      envelope: { attack: 1, release: 5 },
      arpeggiator: {
        enabled: false,
        pattern: 'up',
        octaves: 2,
        rate: '8n'
      }
    };
  }
};

// Export for use in other modules
window.TextureManager = TextureManager;
