// Leaderboard API Management
class LeaderboardAPI {
    constructor() {
        this.apiUrl = 'https://api.jsonbin.io/v3/b'; // Using JSONBin.io as a free API
        this.apiKey = 'YOUR_API_KEY'; // Will be set by user or use localStorage
        this.binId = null;
        this.scores = [];
        this.init();
    }

    init() {
        // Try to get bin ID from localStorage
        const storedBinId = localStorage.getItem('leaderboardBinId');
        if (storedBinId) {
            this.binId = storedBinId;
            this.loadScores();
        } else {
            // Initialize with local storage as fallback
            this.loadFromLocalStorage();
        }
    }

    // Save score to leaderboard
    async saveScore(playerName, score, difficulty, device, timeRemaining) {
        const scoreEntry = {
            name: playerName || 'Anonymous',
            score: score,
            difficulty: difficulty,
            device: device,
            timeRemaining: timeRemaining,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.scores.push(scoreEntry);
        
        // Sort by score (descending)
        this.scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 100 scores
        if (this.scores.length > 100) {
            this.scores = this.scores.slice(0, 100);
        }

        // Save to localStorage as primary storage
        this.saveToLocalStorage();

        // Try to save to API if available
        if (this.binId && this.apiKey && this.apiKey !== 'YOUR_API_KEY') {
            try {
                await this.saveToAPI();
            } catch (error) {
                console.log('API save failed, using local storage:', error);
            }
        }

        return scoreEntry;
    }

    // Load scores from API
    async loadScores() {
        if (this.binId && this.apiKey && this.apiKey !== 'YOUR_API_KEY') {
            try {
                const response = await fetch(`${this.apiUrl}/${this.binId}/latest`, {
                    headers: {
                        'X-Master-Key': this.apiKey,
                        'X-Bin-Meta': 'false'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.record && Array.isArray(data.record)) {
                        this.scores = data.record;
                        this.saveToLocalStorage();
                        return this.scores;
                    }
                }
            } catch (error) {
                console.log('API load failed, using local storage:', error);
            }
        }

        // Fallback to localStorage
        return this.loadFromLocalStorage();
    }

    // Save to API
    async saveToAPI() {
        if (!this.binId || !this.apiKey || this.apiKey === 'YOUR_API_KEY') {
            return;
        }

        const response = await fetch(`${this.apiUrl}/${this.binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': this.apiKey
            },
            body: JSON.stringify(this.scores)
        });

        if (!response.ok) {
            throw new Error('Failed to save to API');
        }
    }

    // Local Storage methods (primary storage)
    saveToLocalStorage() {
        try {
            localStorage.setItem('leaderboardScores', JSON.stringify(this.scores));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('leaderboardScores');
            if (stored) {
                this.scores = JSON.parse(stored);
                return this.scores;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
        this.scores = [];
        return this.scores;
    }

    // Get filtered scores
    getScores(filter = 'all') {
        if (filter === 'all') {
            return this.scores;
        }
        return this.scores.filter(score => score.difficulty === filter);
    }

    // Get top scores
    getTopScores(limit = 10, filter = 'all') {
        const filtered = this.getScores(filter);
        return filtered.slice(0, limit);
    }

    // Clear leaderboard (for testing)
    clearLeaderboard() {
        this.scores = [];
        this.saveToLocalStorage();
        if (this.binId && this.apiKey && this.apiKey !== 'YOUR_API_KEY') {
            this.saveToAPI();
        }
    }
}

// Initialize leaderboard
const leaderboardAPI = new LeaderboardAPI();

// Enhanced Leaderboard with search, filtering, and badges
function loadLeaderboard(filter = 'all', searchQuery = '', dateFilter = 'all') {
    let scores = leaderboardAPI.getTopScores(100, filter);
    const listContainer = document.getElementById('leaderboardList');
    
    if (!listContainer) return;

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        scores = scores.filter(score => 
            score.name.toLowerCase().includes(query)
        );
    }

    // Apply date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        scores = scores.filter(score => {
            const scoreDate = new Date(score.date || score.timestamp);
            switch(dateFilter) {
                case 'today':
                    return scoreDate >= today;
                case 'week':
                    return scoreDate >= weekAgo;
                case 'month':
                    return scoreDate >= monthAgo;
                default:
                    return true;
            }
        });
    }

    // Get user's best score for highlighting
    const userBestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;

    if (scores.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No scores found. Try different filters or be the first to play!</p>';
        return;
    }

    listContainer.innerHTML = '';
    
    scores.slice(0, 50).forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        // Add badge for top 3
        let badge = '';
        if (index === 0) badge = '🥇';
        else if (index === 1) badge = '🥈';
        else if (index === 2) badge = '🥉';
        
        // Highlight user's best score
        const isUserBest = score.score === userBestScore && index < 3;
        if (isUserBest) item.classList.add('user-best');
        
        const rank = document.createElement('div');
        rank.className = 'leaderboard-rank';
        rank.textContent = badge ? `${badge} #${index + 1}` : `#${index + 1}`;
        
        const name = document.createElement('div');
        name.className = 'leaderboard-name';
        name.textContent = score.name;
        
        const scoreValue = document.createElement('div');
        scoreValue.className = 'leaderboard-score';
        scoreValue.textContent = score.score.toLocaleString();
        
        const difficulty = document.createElement('div');
        difficulty.className = 'leaderboard-difficulty';
        difficulty.textContent = score.difficulty.toUpperCase();
        
        // Add date
        const date = document.createElement('div');
        date.className = 'leaderboard-date';
        const scoreDate = new Date(score.date || score.timestamp);
        date.textContent = scoreDate.toLocaleDateString();
        date.style.fontSize = '0.85rem';
        date.style.color = 'var(--text-secondary)';
        
        item.appendChild(rank);
        item.appendChild(name);
        item.appendChild(scoreValue);
        item.appendChild(difficulty);
        item.appendChild(date);
        
        listContainer.appendChild(item);
    });
    
    // Show result count
    const resultCount = document.createElement('p');
    resultCount.style.cssText = 'text-align: center; color: var(--text-secondary); margin-top: 1rem; font-size: 0.9rem;';
    resultCount.textContent = `Showing ${Math.min(scores.length, 50)} of ${scores.length} scores`;
    listContainer.appendChild(resultCount);
}

// Filter buttons
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter || 'all';
            loadLeaderboard(filter);
        });
    });
});

// Save score function (called from game.js)
function saveScore() {
    const playerName = prompt('Enter your name for the leaderboard:');
    if (playerName === null) return; // User cancelled
    
    const name = playerName.trim() || 'Anonymous';
    
    leaderboardAPI.saveScore(
        name,
        gameState.score,
        gameState.selectedDifficulty,
        gameState.selectedDevice,
        gameState.timeRemaining
    ).then(() => {
        alert('Score saved successfully!');
        loadLeaderboard();
        showScreen('leaderboardScreen');
    }).catch(error => {
        console.error('Failed to save score:', error);
        alert('Score saved locally!');
    });
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.leaderboardAPI = leaderboardAPI;
    window.loadLeaderboard = loadLeaderboard;
    window.saveScore = saveScore;
}

