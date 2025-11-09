// Achievement System
class AchievementManager {
    constructor() {
        this.achievements = this.loadAchievements();
        this.definitions = this.getAchievementDefinitions();
    }

    getAchievementDefinitions() {
        return [
            {
                id: 'first_win',
                name: 'First Victory',
                description: 'Complete your first game successfully',
                icon: '🏆',
                points: 10,
                category: 'beginner',
                tier: 'common'
            },
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete a game in under 30 seconds',
                icon: '⚡',
                points: 25
            },
            {
                id: 'perfect_run',
                name: 'Perfect Run',
                description: 'Complete a game with no failed attempts',
                icon: '✨',
                points: 50
            },
            {
                id: 'master_hacker',
                name: 'Master Hacker',
                description: 'Score over 5000 points in a single game',
                icon: '👑',
                points: 100
            },
            {
                id: 'hard_mode_warrior',
                name: 'Hard Mode Warrior',
                description: 'Win 10 games on Hard difficulty',
                icon: '🔥',
                points: 75
            },
            {
                id: 'century_club',
                name: 'Century Club',
                description: 'Play 100 games',
                icon: '💯',
                points: 50
            },
            {
                id: 'no_hints',
                name: 'No Hints Needed',
                description: 'Complete a game without using any hints',
                icon: '🧠',
                points: 30
            },
            {
                id: 'time_master',
                name: 'Time Master',
                description: 'Complete a game with over 50 seconds remaining',
                icon: '⏱️',
                points: 40
            },
            {
                id: 'device_master',
                name: 'Device Master',
                description: 'Win on all device types',
                icon: '📱',
                points: 35
            },
            {
                id: 'streak_king',
                name: 'Streak King',
                description: 'Win 5 games in a row',
                icon: '🔥',
                points: 60
            }
        ];
    }

    loadAchievements() {
        try {
            const stored = localStorage.getItem('achievements');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load achievements:', error);
        }
        return [];
    }

    saveAchievements() {
        try {
            localStorage.setItem('achievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.error('Failed to save achievements:', error);
        }
    }

    checkAchievements(gameData) {
        const newAchievements = [];
        const stats = statisticsManager.getStats();

        // Check each achievement definition
        this.definitions.forEach(achievement => {
            // Skip if already unlocked
            if (this.achievements.find(a => a.id === achievement.id)) {
                return;
            }

            let unlocked = false;

            switch (achievement.id) {
                case 'first_win':
                    unlocked = gameData.won && stats.totalGames === 1;
                    break;
                case 'speed_demon':
                    unlocked = gameData.won && gameData.timeLimit - gameData.timeRemaining < 30;
                    break;
                case 'perfect_run':
                    unlocked = gameData.won && gameData.attempts === 0;
                    break;
                case 'master_hacker':
                    unlocked = gameData.score >= 5000;
                    break;
                case 'hard_mode_warrior':
                    unlocked = stats.difficultyStats.hard.won >= 10;
                    break;
                case 'century_club':
                    unlocked = stats.totalGames >= 100;
                    break;
                case 'no_hints':
                    unlocked = gameData.won && gameData.hintsUsed === 0;
                    break;
                case 'time_master':
                    unlocked = gameData.won && gameData.timeRemaining >= 50;
                    break;
                case 'device_master':
                    unlocked = stats.deviceStats.laptop.won > 0 && 
                               stats.deviceStats.mobile.won > 0;
                    break;
                case 'streak_king':
                    // Check last 5 games
                    const recentWins = stats.playHistory.slice(0, 5).filter(g => g.won).length;
                    unlocked = recentWins >= 5;
                    break;
            }

            if (unlocked) {
                const achievementData = {
                    ...achievement,
                    unlockedAt: new Date().toISOString()
                };
                this.achievements.push(achievementData);
                newAchievements.push(achievementData);
                this.saveAchievements();
            }
        });

        return newAchievements;
    }

    getAchievements() {
        return this.achievements;
    }

    getUnlockedCount() {
        return this.achievements.length;
    }

    getTotalPoints() {
        return this.achievements.reduce((sum, a) => sum + (a.points || 0), 0);
    }
}

// Initialize achievement manager
const achievementManager = new AchievementManager();

// Make it globally available
if (typeof window !== 'undefined') {
    window.achievementManager = achievementManager;
}

