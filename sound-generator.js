// Web Audio API Sound Generator
// Generates sounds programmatically so we don't need external audio files

class SoundGenerator {
    constructor() {
        this.audioContext = null;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.audioEnabled = false;
        this.init();
    }

    init() {
        try {
            // Use lower sample rate on mobile to reduce crackling
            const sampleRate = this.isMobile ? 22050 : 44100;
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
        } catch (error) {
            console.error('Web Audio API not supported:', error);
        }
    }

    // Resume audio context (required for mobile browsers)
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                this.audioEnabled = true;
            } catch (error) {
                console.warn('Failed to resume audio context:', error);
            }
        }
    }

    // Generate a beep sound
    beep(frequency = 440, duration = 200, type = 'sine') {
        if (!this.audioContext) return;
        
        // Resume context if suspended (mobile requirement)
        if (this.audioContext.state === 'suspended') {
            this.resumeContext();
            return; // Skip this sound, next one will work
        }

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            // Get volume from settings
            let volumeMultiplier = 1;
            if (window.settingsManager) {
                const soundEnabled = window.settingsManager.getSetting('soundEnabled');
                if (!soundEnabled) return; // Don't play if disabled
                const soundVolume = window.settingsManager.getSetting('soundVolume') || 100;
                volumeMultiplier = soundVolume / 100;
            }

            // Lower volume on mobile to reduce crackling
            const baseVolume = this.isMobile ? 0.15 : 0.3;
            const volume = baseVolume * volumeMultiplier;
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Sound generation error:', error);
        }
    }

    // Select sound (short high beep)
    select() {
        this.beep(800, 100, 'sine');
    }

    // Success sound (ascending tones)
    success() {
        if (!this.audioContext) return;
        
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.beep(freq, 150, 'sine');
            }, index * 100);
        });
    }

    // Error sound (low descending tone)
    error() {
        this.beep(200, 300, 'sawtooth');
    }

    // Typing sound (short click)
    typing() {
        this.beep(600, 50, 'square');
    }

    // Background music (simple loop) - Disabled on mobile to reduce issues
    startBackgroundMusic() {
        if (!this.audioContext) return;
        
        // Skip background music on mobile to prevent audio issues
        if (this.isMobile) {
            return null;
        }
        
        try {
            // Resume context first
            if (this.audioContext.state === 'suspended') {
                this.resumeContext();
            }
            
            // Create a simple ambient tone
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = 110; // Low A

            lfo.type = 'sine';
            lfo.frequency.value = 0.1; // Very slow modulation
            lfoGain.gain.value = 5;

            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);

            gainNode.gain.value = 0.05; // Very quiet

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            lfo.start();

            return { oscillator, lfo, gainNode };
        } catch (error) {
            console.warn('Background music error:', error);
            return null;
        }
    }
}

// Create sound generator instance
const soundGenerator = new SoundGenerator();

// Sound generator is available globally
// game.js will use it directly via window.soundGenerator

// Export
if (typeof window !== 'undefined') {
    window.soundGenerator = soundGenerator;
}

