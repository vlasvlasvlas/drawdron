/**
 * DrawDron - Main Entry Point
 * Generative Drone Instrument
 * 
 * Draw on canvas to create evolving drone sounds with L-System branching visuals
 */

// Logger para debugging
const Logger = {
    logs: [],

    log(level, message, data = null) {
        const entry = {
            time: new Date().toISOString(),
            level,
            message,
            data
        };
        this.logs.push(entry);

        const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✓';
        if (data) {
            console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`${prefix} ${message}`, data);
        } else {
            console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`${prefix} ${message}`);
        }
    },

    info(msg, data) { this.log('info', msg, data); },
    warn(msg, data) { this.log('warn', msg, data); },
    error(msg, data) { this.log('error', msg, data); },

    export() {
        return JSON.stringify(this.logs, null, 2);
    }
};

window.Logger = Logger;

// Initialization
(async function () {
    Logger.info('🎵 DrawDron Initializing...');

    // Wait for DOM
    if (document.readyState !== 'complete') {
        await new Promise(resolve => {
            window.addEventListener('load', resolve);
        });
    }

    try {
        // Initialize texture manager first
        await TextureManager.init();
        Logger.info('Textures loaded', { count: TextureManager.getAll().length });

        // Initialize canvas BEFORE audio (no user interaction needed)
        CanvasEngine.init();
        Logger.info('Canvas initialized');

        // Initialize UI
        UI.init();
        Logger.info('UI initialized');

        // Audio init on first interaction
        const initAudio = async () => {
            if (!AudioEngine.isInitialized) {
                try {
                    await AudioEngine.init();
                    Logger.info('Audio engine ready');
                } catch (e) {
                    Logger.error('Audio init failed', e);
                }
            }
        };

        // Multiple ways to trigger audio init
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('mousedown', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });

        Logger.info('🎵 DrawDron Ready!');
        console.log('');
        console.log('Controls:');
        console.log('  - Dibujá en el canvas para crear sonidos');
        console.log('  - Teclas 1-3 para cambiar texturas');
        console.log('  - Doble-click en botón para editar');
        console.log('  - Tecla C para limpiar');

    } catch (error) {
        Logger.error('Failed to initialize DrawDron', error);

        // Show error to user
        const hint = document.getElementById('hint');
        if (hint) {
            hint.textContent = 'Error al cargar. Recargá la página.';
            hint.style.color = '#EF4444';
        }
    }
})();
