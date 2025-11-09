// Daily Challenges System
class DailyChallengesManager {
    constructor() {
        this.challenges = this.loadChallenges();
        this.updateChallengesIfNeeded();
    }

    getTodayKey() {
        const today = new Date();
        return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    }

    loadChallenges() {
        try {
            const stored = localStorage.getItem('dailyChallenges');
            if (stored) {
                const data = JSON.parse(stored);
                // Check if challenges are for today
                if (data.date === this.getTodayKey()) {
                    return data.challenges;
                }
            }
        } catch (error) {
            console.error('Failed to load challenges:', error);
        }
        return this.generateChallenges();
    }

    generateChallenges() {
        return [
            {
                id: 'challenge_1',
                name: 'Speed Runner',
                description: 'Complete a game in under 45 seconds',
                reward: 50,
                progress: 0,
                target: 1,
                type: 'time',
                completed: false
            },
            {
                id: 'challenge_2',
                name: 'Perfect Score',
                description: 'Score over 3000 points in a single game',
                reward: 75,
                progress: 0,
                target: 3000,
                type: 'score',
                completed: false
            },
            {
                id: 'challenge_3',
                name: 'No Mistakes',
                description: 'Complete a game with 0 failed attempts',
                reward: 100,
                progress: 0,
                target: 1,
                type: 'perfect',
                completed: false
            },
            {
                id: 'challenge_4',
                name: 'Hard Mode Master',
                description: 'Win 2 games on Hard difficulty',
                reward: 150,
                progress: 0,
                target: 2,
                type: 'hard_wins',
                completed: false
            },
            {
                id: 'challenge_5',
                name: 'Daily Player',
                description: 'Play 3 games today',
                reward: 25,
                progress: 0,
                target: 3,
                type: 'games_played',
                completed: false
            }
        ];
    }

    updateChallengesIfNeeded() {
        const today = this.getTodayKey();
        const stored = localStorage.getItem('dailyChallenges');
        
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date !== today) {
                // New day, generate new challenges
                this.challenges = this.generateChallenges();
                this.saveChallenges();
            }
        } else {
            this.saveChallenges();
        }
    }

    saveChallenges() {
        try {
            localStorage.setItem('dailyChallenges', JSON.stringify({
                date: this.getTodayKey(),
                challenges: this.challenges
            }));
        } catch (error) {
            console.error('Failed to save challenges:', error);
        }
    }

    checkChallengeProgress(gameData) {
        let rewardsEarned = 0;
        
        this.challenges.forEach(challenge => {
            if (challenge.completed) return;

            switch (challenge.type) {
                case 'time':
                    if (gameData.timeLimit - gameData.timeRemaining < 45 && gameData.won) {
                        challenge.progress = 1;
                        challenge.completed = true;
                        rewardsEarned += challenge.reward;
                    }
                    break;
                case 'score':
                    if (gameData.score >= challenge.target) {
                        challenge.progress = challenge.target;
                        challenge.completed = true;
                        rewardsEarned += challenge.reward;
                    } else {
                        challenge.progress = Math.max(challenge.progress, gameData.score);
                    }
                    break;
                case 'perfect':
                    if (gameData.attempts === 0 && gameData.won) {
                        challenge.progress = 1;
                        challenge.completed = true;
                        rewardsEarned += challenge.reward;
                    }
                    break;
                case 'hard_wins':
                    if (gameData.difficulty === 'hard' && gameData.won) {
                        challenge.progress++;
                        if (challenge.progress >= challenge.target) {
                            challenge.completed = true;
                            rewardsEarned += challenge.reward;
                        }
                    }
                    break;
                case 'games_played':
                    challenge.progress++;
                    if (challenge.progress >= challenge.target) {
                        challenge.completed = true;
                        rewardsEarned += challenge.reward;
                    }
                    break;
            }
        });

        if (rewardsEarned > 0) {
            this.saveChallenges();
        }

        return rewardsEarned;
    }

    getChallenges() {
        return this.challenges;
    }

    getTimeRemaining() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diff = tomorrow - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    getCompletedCount() {
        return this.challenges.filter(c => c.completed).length;
    }
}

// Initialize daily challenges manager
const dailyChallengesManager = new DailyChallengesManager();

// Make it globally available
if (typeof window !== 'undefined') {
    window.dailyChallengesManager = dailyChallengesManager;
}

