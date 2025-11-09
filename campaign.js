// Campaign Progression System
class CampaignManager {
    constructor() {
        this.progress = this.loadProgress();
    }

    loadProgress() {
        try {
            const stored = localStorage.getItem('campaignProgress');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load campaign progress:', error);
        }
        return {
            level1: { completed: false, unlocked: true },
            level2: { completed: false, unlocked: false },
            level3: { completed: false, unlocked: false },
            allCompleted: false
        };
    }

    saveProgress() {
        try {
            localStorage.setItem('campaignProgress', JSON.stringify(this.progress));
        } catch (error) {
            console.error('Failed to save campaign progress:', error);
        }
    }

    completeLevel(levelId) {
        if (this.progress[levelId]) {
            this.progress[levelId].completed = true;
            
            // Unlock next level
            if (levelId === 'level1') {
                this.progress.level2.unlocked = true;
            } else if (levelId === 'level2') {
                this.progress.level3.unlocked = true;
            } else if (levelId === 'level3') {
                this.progress.allCompleted = true;
            }
            
            this.saveProgress();
            return this.progress.allCompleted;
        }
        return false;
    }

    getProgress() {
        return this.progress;
    }

    resetCampaign() {
        this.progress = {
            level1: { completed: false, unlocked: true },
            level2: { completed: false, unlocked: false },
            level3: { completed: false, unlocked: false },
            allCompleted: false
        };
        this.saveProgress();
    }
}

// Initialize campaign manager
const campaignManager = new CampaignManager();

// Make it globally available
if (typeof window !== 'undefined') {
    window.campaignManager = campaignManager;
}

