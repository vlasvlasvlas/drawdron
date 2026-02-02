/**
 * DrawDron - UI Module
 * Handles UI controls and texture editor with full effects and arpeggiator
 */

const UI = {
    editorPanel: null,
    currentEditIndex: -1,

    init() {
        this.editorPanel = document.getElementById('editor-panel');
        this.setupTextureButtons();
        this.setupEditor();
        this.setupKeyboardShortcuts();
        console.log('UI initialized');
    },

    setupTextureButtons() {
        this.renderTextureButtons();
        document.getElementById('addTexture')?.addEventListener('click', () => {
            this.openEditor(-1);
        });
    },

    renderTextureButtons() {
        const container = document.querySelector('.texture-bar');
        const addBtn = document.getElementById('addTexture');

        const existingBtns = container.querySelectorAll('.texture-btn:not(.add-btn)');
        existingBtns.forEach(btn => btn.remove());

        const textures = TextureManager.getAll();
        textures.forEach((texture, index) => {
            const btn = document.createElement('button');
            btn.className = 'texture-btn';
            btn.dataset.texture = index;
            btn.textContent = index + 1;

            if (index === TextureManager.currentIndex) {
                btn.classList.add('active');
                btn.style.backgroundColor = texture.color;
                btn.style.boxShadow = `0 0 20px ${texture.color}`;
            }

            btn.addEventListener('click', () => this.selectTexture(index));
            btn.addEventListener('dblclick', () => this.openEditor(index));
            container.insertBefore(btn, addBtn);
        });
    },

    selectTexture(index) {
        TextureManager.setCurrent(index);

        const btns = document.querySelectorAll('.texture-btn:not(.add-btn)');
        btns.forEach((btn, i) => {
            const texture = TextureManager.get(i);
            if (i === index) {
                btn.classList.add('active');
                btn.style.backgroundColor = texture.color;
                btn.style.boxShadow = `0 0 20px ${texture.color}`;
            } else {
                btn.classList.remove('active');
                btn.style.backgroundColor = '';
                btn.style.boxShadow = '';
            }
        });
    },

    setupEditor() {
        document.getElementById('closeEditor')?.addEventListener('click', () => this.closeEditor());
        document.getElementById('previewSound')?.addEventListener('click', () => {
            AudioEngine.preview(this.getEditorValues());
        });
        document.getElementById('saveTexture')?.addEventListener('click', () => this.saveTextureFromEditor());
        document.getElementById('exportTextures')?.addEventListener('click', () => this.exportTextures());
        document.getElementById('importTextures')?.addEventListener('click', () => {
            document.getElementById('importFile')?.click();
        });
        document.getElementById('importFile')?.addEventListener('change', (e) => {
            this.importTextures(e.target.files[0]);
        });

        this.setupSliderDisplays();
    },

    setupSliderDisplays() {
        const sliders = [
            { id: 'detune', display: 'detuneVal' },
            { id: 'filterQ', display: 'filterQVal' },
            { id: 'tremolo', display: 'tremoloVal' },
            { id: 'tremoloRate', display: 'tremoloRateVal' },
            { id: 'distortion', display: 'distortionVal' },
            { id: 'reverb', display: 'reverbVal' },
            { id: 'delay', display: 'delayVal' },
            { id: 'chorus', display: 'chorusVal' },
            { id: 'attack', display: 'attackVal' },
            { id: 'release', display: 'releaseVal' },
            { id: 'growthSpeed', display: 'growthVal' },
            { id: 'fadeTime', display: 'fadeVal' },
            { id: 'arpOctaves', display: 'arpOctavesVal' }
        ];

        sliders.forEach(({ id, display }) => {
            const slider = document.getElementById(id);
            const displayEl = document.getElementById(display);
            if (slider && displayEl) {
                slider.addEventListener('input', () => {
                    displayEl.textContent = slider.value;
                });
            }
        });
    },

    openEditor(index) {
        this.currentEditIndex = index;
        const texture = index >= 0
            ? TextureManager.get(index)
            : TextureManager.createBlank();
        this.populateEditor(texture);
        this.editorPanel?.classList.remove('hidden');
    },

    closeEditor() {
        this.editorPanel?.classList.add('hidden');
        this.currentEditIndex = -1;
    },

    populateEditor(texture) {
        // Basic
        document.getElementById('textureName').value = texture.name || 'New Texture';
        document.getElementById('textureColor').value = texture.color || '#ffffff';
        document.getElementById('note').value = texture.note || 'C3';

        // Oscillator
        document.getElementById('waveform').value = texture.oscillator?.type || 'sine';
        const detune = texture.oscillator?.detune || 0;
        document.getElementById('detune').value = detune;
        document.getElementById('detuneVal').textContent = detune;

        // Filter
        document.getElementById('filterType').value = texture.filter?.type || 'lowpass';
        const filterQ = texture.filter?.Q || 1;
        document.getElementById('filterQ').value = filterQ;
        document.getElementById('filterQVal').textContent = filterQ;

        // Envelope
        const attack = texture.envelope?.attack || 1;
        document.getElementById('attack').value = attack;
        document.getElementById('attackVal').textContent = attack;
        const release = texture.envelope?.release || 5;
        document.getElementById('release').value = release;
        document.getElementById('releaseVal').textContent = release;

        // Effects
        const effects = texture.effects || {};

        const tremolo = effects.tremolo || 0;
        document.getElementById('tremolo').value = tremolo;
        document.getElementById('tremoloVal').textContent = tremolo;

        const tremoloRate = effects.tremoloRate || 4;
        document.getElementById('tremoloRate').value = tremoloRate;
        document.getElementById('tremoloRateVal').textContent = tremoloRate;

        const distortion = effects.distortion || 0;
        document.getElementById('distortion').value = distortion;
        document.getElementById('distortionVal').textContent = distortion;

        const delayVal = effects.delay || 0.3;
        document.getElementById('delay').value = delayVal;
        document.getElementById('delayVal').textContent = delayVal;

        const reverb = effects.reverb || 0.5;
        document.getElementById('reverb').value = reverb;
        document.getElementById('reverbVal').textContent = reverb;

        const chorus = effects.chorus || 0;
        document.getElementById('chorus').value = chorus;
        document.getElementById('chorusVal').textContent = chorus;

        // Arpeggiator
        const arp = texture.arpeggiator || {};
        document.getElementById('arpEnabled').checked = arp.enabled || false;
        document.getElementById('arpPattern').value = arp.pattern || 'up';
        const arpOctaves = arp.octaves || 2;
        document.getElementById('arpOctaves').value = arpOctaves;
        document.getElementById('arpOctavesVal').textContent = arpOctaves;
        document.getElementById('arpRate').value = arp.rate || '8n';

        // Growth
        const growthSpeed = texture.growthSpeed || 1;
        document.getElementById('growthSpeed').value = growthSpeed;
        document.getElementById('growthVal').textContent = growthSpeed;
        const fadeTime = texture.fadeTime || 15;
        document.getElementById('fadeTime').value = fadeTime;
        document.getElementById('fadeVal').textContent = fadeTime;
    },

    getEditorValues() {
        return {
            name: document.getElementById('textureName').value,
            color: document.getElementById('textureColor').value,
            note: document.getElementById('note').value,
            growthSpeed: parseFloat(document.getElementById('growthSpeed').value),
            fadeTime: parseFloat(document.getElementById('fadeTime').value),
            oscillator: {
                type: document.getElementById('waveform').value,
                detune: parseFloat(document.getElementById('detune').value)
            },
            filter: {
                type: document.getElementById('filterType').value,
                maxFreq: 8000,
                Q: parseFloat(document.getElementById('filterQ').value)
            },
            effects: {
                tremolo: parseFloat(document.getElementById('tremolo').value),
                tremoloRate: parseFloat(document.getElementById('tremoloRate').value),
                distortion: parseFloat(document.getElementById('distortion').value),
                delay: parseFloat(document.getElementById('delay').value),
                delayTime: '8n',
                delayFeedback: 0.4,
                reverb: parseFloat(document.getElementById('reverb').value),
                reverbDecay: 5,
                chorus: parseFloat(document.getElementById('chorus').value)
            },
            envelope: {
                attack: parseFloat(document.getElementById('attack').value),
                release: parseFloat(document.getElementById('release').value)
            },
            arpeggiator: {
                enabled: document.getElementById('arpEnabled').checked,
                pattern: document.getElementById('arpPattern').value,
                octaves: parseInt(document.getElementById('arpOctaves').value),
                rate: document.getElementById('arpRate').value
            }
        };
    },

    saveTextureFromEditor() {
        const texture = this.getEditorValues();

        if (this.currentEditIndex >= 0) {
            TextureManager.update(this.currentEditIndex, texture);
        } else {
            const newIndex = TextureManager.add(texture);
            this.selectTexture(newIndex);
        }

        this.renderTextureButtons();
        this.closeEditor();
    },

    exportTextures() {
        const json = TextureManager.export();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'drawdron-textures.json';
        a.click();
        URL.revokeObjectURL(url);
    },

    importTextures(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const success = TextureManager.import(e.target.result);
            if (success) {
                this.renderTextureButtons();
                this.selectTexture(0);
            } else {
                alert('Failed to import textures.');
            }
        };
        reader.readAsText(file);
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (index < TextureManager.getAll().length) {
                    this.selectTexture(index);
                }
            }
            if (e.key === 'Escape') this.closeEditor();
            if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
                CanvasEngine.clear();
            }
        });
    }
};

window.UI = UI;
