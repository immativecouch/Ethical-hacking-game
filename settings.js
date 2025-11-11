// Settings Management System
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.applySettings();
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('gameSettings');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        return {
            soundEnabled: true,
            soundVolume: 100,
            musicEnabled: true,
            musicVolume: 50,
            defaultDifficulty: 'easy',
            theme: 'cyberpunk',
            animationsEnabled: true,
            highContrast: false,
            fontSize: 'medium',
            screenReader: false,
            colorblindMode: false,
            autoSave: true,
            showHints: true,
            controlScheme: 'standard',
            uiScale: 100
        };
    }

    saveSettings() {
        try {
            localStorage.setItem('gameSettings', JSON.stringify(this.settings));
            this.applySettings();
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    applySettings() {
        // Apply sound settings
        if (typeof window.soundGenerator !== 'undefined') {
            // Sound volume will be applied when sounds play
        }

        // Apply theme - force update CSS variables
        const root = document.documentElement;
        root.setAttribute('data-theme', this.settings.theme);
        
        // Force CSS variable update for themes - make them visually distinct
        const themes = {
            cyberpunk: {
                '--primary-color': '#00ff41',
                '--secondary-color': '#00d4ff',
                '--glow-color': 'rgba(0, 255, 65, 0.5)',
                '--bg-dark': '#0a0a0a',
                '--bg-card': '#1a1a1a'
            },
            matrix: {
                '--primary-color': '#00ff00',
                '--secondary-color': '#00ff00',
                '--glow-color': 'rgba(0, 255, 0, 0.8)',
                '--bg-dark': '#000000',
                '--bg-card': '#0a0a0a',
                '--text-primary': '#00ff00',
                '--text-secondary': '#00cc00'
            },
            neon: {
                '--primary-color': '#ff00ff',
                '--secondary-color': '#00ffff',
                '--glow-color': 'rgba(255, 0, 255, 0.5)',
                '--bg-dark': '#0a0a0a',
                '--bg-card': '#1a1a1a'
            },
            dark: {
                '--primary-color': '#ffffff',
                '--secondary-color': '#cccccc',
                '--glow-color': 'rgba(255, 255, 255, 0.3)',
                '--bg-dark': '#0a0a0a',
                '--bg-card': '#1a1a1a'
            }
        };
        
        const theme = themes[this.settings.theme] || themes.cyberpunk;
        Object.keys(theme).forEach(key => {
            root.style.setProperty(key, theme[key]);
        });

        // Apply high contrast - ensure proper toggle
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
            // Override theme colors when high contrast is on
            root.style.setProperty('--primary-color', '#ffff00');
            root.style.setProperty('--secondary-color', '#00ffff');
        } else {
            document.body.classList.remove('high-contrast');
            // Restore theme colors when high contrast is off
            Object.keys(theme).forEach(key => {
                root.style.setProperty(key, theme[key]);
            });
        }

        // Apply font size
        document.body.setAttribute('data-font-size', this.settings.fontSize);

        // Apply UI scale - transform the entire body
        if (this.settings.uiScale !== undefined && this.settings.uiScale !== 100) {
            const scale = this.settings.uiScale / 100;
            document.body.style.transform = `scale(${scale})`;
            document.body.style.transformOrigin = 'top center';
        } else {
            document.body.style.transform = '';
            document.body.style.transformOrigin = '';
        }

        // Apply colorblind mode
        if (this.settings.colorblindMode) {
            document.body.classList.add('colorblind-mode');
        } else {
            document.body.classList.remove('colorblind-mode');
        }

        // Apply animations - toggle class to enable/disable all animations
        if (this.settings.animationsEnabled === false) {
            document.body.classList.add('no-animations');
            document.documentElement.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
            document.documentElement.classList.remove('no-animations');
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    getSetting(key) {
        return this.settings[key];
    }

    resetSettings() {
        this.settings = {
            soundEnabled: true,
            soundVolume: 100,
            musicEnabled: true,
            musicVolume: 50,
            defaultDifficulty: 'easy',
            theme: 'cyberpunk',
            animationsEnabled: true,
            highContrast: false,
            fontSize: 'medium',
            screenReader: false,
            colorblindMode: false,
            autoSave: true,
            showHints: true,
            controlScheme: 'standard'
        };
        this.saveSettings();
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager();

// Make it globally available
if (typeof window !== 'undefined') {
    window.settingsManager = settingsManager;
}

