// Statistics Management System
class StatisticsManager {
    constructor() {
        this.stats = this.loadStats();
    }

    loadStats() {
        try {
            const stored = localStorage.getItem('gameStatistics');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
        return {
            totalGames: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalScore: 0,
            bestScore: 0,
            bestTime: null,
            averageScore: 0,
            totalTimePlayed: 0,
            difficultyStats: {
                easy: { played: 0, won: 0, bestScore: 0 },
                medium: { played: 0, won: 0, bestScore: 0 },
                hard: { played: 0, won: 0, bestScore: 0 }
            },
            deviceStats: {
                laptop: { played: 0, won: 0 },
                mobile: { played: 0, won: 0 }
            },
            achievements: [],
            playHistory: []
        };
    }

    saveStats() {
        try {
            localStorage.setItem('gameStatistics', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Failed to save statistics:', error);
        }
    }

    recordGame(gameData) {
        this.stats.totalGames++;
        this.stats.totalScore += gameData.score;
        this.stats.totalTimePlayed += (gameData.timeLimit - gameData.timeRemaining);
        
        if (gameData.won) {
            this.stats.gamesWon++;
        } else {
            this.stats.gamesLost++;
        }

        if (gameData.score > this.stats.bestScore) {
            this.stats.bestScore = gameData.score;
        }

        if (gameData.timeRemaining) {
            if (!this.stats.bestTime || gameData.timeRemaining > this.stats.bestTime) {
                this.stats.bestTime = gameData.timeRemaining;
            }
        }

        this.stats.averageScore = Math.round(this.stats.totalScore / this.stats.totalGames);

        // Difficulty stats
        if (gameData.difficulty && this.stats.difficultyStats[gameData.difficulty]) {
            this.stats.difficultyStats[gameData.difficulty].played++;
            if (gameData.won) {
                this.stats.difficultyStats[gameData.difficulty].won++;
            }
            if (gameData.score > this.stats.difficultyStats[gameData.difficulty].bestScore) {
                this.stats.difficultyStats[gameData.difficulty].bestScore = gameData.score;
            }
        }

        // Device stats
        if (gameData.device && this.stats.deviceStats[gameData.device]) {
            this.stats.deviceStats[gameData.device].played++;
            if (gameData.won) {
                this.stats.deviceStats[gameData.device].won++;
            }
        }

        // Add to play history (keep last 50)
        this.stats.playHistory.unshift({
            date: new Date().toISOString(),
            score: gameData.score,
            difficulty: gameData.difficulty,
            device: gameData.device,
            won: gameData.won,
            timeRemaining: gameData.timeRemaining
        });
        if (this.stats.playHistory.length > 50) {
            this.stats.playHistory.pop();
        }

        this.saveStats();
    }

    getWinRate() {
        if (this.stats.totalGames === 0) return 0;
        return Math.round((this.stats.gamesWon / this.stats.totalGames) * 100);
    }

    getStats() {
        return {
            ...this.stats,
            winRate: this.getWinRate()
        };
    }

    resetStats() {
        this.stats = this.loadStats();
        this.stats = {
            totalGames: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalScore: 0,
            bestScore: 0,
            bestTime: null,
            averageScore: 0,
            totalTimePlayed: 0,
            difficultyStats: {
                easy: { played: 0, won: 0, bestScore: 0 },
                medium: { played: 0, won: 0, bestScore: 0 },
                hard: { played: 0, won: 0, bestScore: 0 }
            },
            deviceStats: {
                laptop: { played: 0, won: 0 },
                mobile: { played: 0, won: 0 }
            },
            achievements: [],
            playHistory: []
        };
        this.saveStats();
    }
}

// Initialize statistics manager
const statisticsManager = new StatisticsManager();

// Make it globally available
if (typeof window !== 'undefined') {
    window.statisticsManager = statisticsManager;
}

