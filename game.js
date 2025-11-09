// Game Version and Build Info
const GAME_VERSION = '1.0.0';
const BUILD_DATE = new Date().toISOString().split('T')[0];

// Debug Mode - Set to false for production
const DEBUG = false; // Change to false before deployment

// Logging utilities
const log = (...args) => DEBUG && console.log(...args);
const logError = (...args) => console.error(...args);
const logWarn = (...args) => DEBUG && console.warn(...args);

// Input validation and sanitization
function sanitizeInput(input, maxLength = 50) {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength).replace(/[<>]/g, ''); // Remove potential HTML tags
}

function validateInput(input, type = 'text') {
    if (!input || typeof input !== 'string') return false;
    const trimmed = input.trim();
    if (trimmed.length === 0) return false;
    
    switch (type) {
        case 'name':
            return trimmed.length >= 1 && trimmed.length <= 20 && /^[a-zA-Z0-9\s_-]+$/.test(trimmed);
        case 'decryption':
            return trimmed.length >= 1 && trimmed.length <= 16 && /^[a-zA-Z0-9]+$/.test(trimmed);
        default:
            return trimmed.length > 0;
    }
}

// Complete Game Reset Function - Clears ALL stored data
function resetAllGameData() {
    try {
        // Clear all localStorage keys used by the game
        const keysToRemove = [
            'gameSaveState',           // Game state
            'creatorPasscodes',        // Creator mode passcodes
            'soundEnabled',            // Sound preference
            'gameSettings',            // Settings
            'campaignProgress',        // Campaign progress
            'dailyChallenges',         // Daily challenges
            'achievements',            // Achievements
            'gameStatistics',          // Statistics
            'leaderboardScores',       // Leaderboard scores
            'leaderboardBinId'         // Leaderboard API bin ID
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Reset all manager instances
        if (window.statisticsManager) {
            window.statisticsManager.stats = window.statisticsManager.loadStats();
            window.statisticsManager.saveStats();
        }
        
        if (window.achievementManager) {
            window.achievementManager.achievements = [];
            window.achievementManager.saveAchievements();
        }
        
        if (window.campaignManager) {
            window.campaignManager.resetCampaign();
        }
        
        if (window.dailyChallengesManager) {
            window.dailyChallengesManager.challenges = window.dailyChallengesManager.generateChallenges();
            window.dailyChallengesManager.saveChallenges();
        }
        
        if (window.settingsManager) {
            window.settingsManager.resetSettings();
        }
        
        if (window.leaderboardAPI) {
            window.leaderboardAPI.scores = [];
            window.leaderboardAPI.saveToLocalStorage();
        }
        
        // Reset game state
        if (typeof gameState !== 'undefined') {
            gameState.reset();
            gameState.clearSaveState();
            gameState.isCampaignMode = false;
            gameState.currentCampaignLevel = null;
        }
        
        // Clear passcodes array
        if (typeof allGeneratedPasscodes !== 'undefined') {
            allGeneratedPasscodes = [];
            savePasscodesToStorage();
        }
        
        log('All game data has been reset successfully');
        return true;
    } catch (error) {
        logError('Failed to reset game data:', error);
        return false;
    }
}

// Selective data reset functions
function resetStatistics() {
    if (window.statisticsManager) {
        window.statisticsManager.stats = window.statisticsManager.loadStats();
        window.statisticsManager.saveStats();
    }
    localStorage.removeItem('gameStatistics');
}

function resetAchievements() {
    if (window.achievementManager) {
        window.achievementManager.achievements = [];
        window.achievementManager.saveAchievements();
    }
    localStorage.removeItem('achievements');
}

function resetCampaign() {
    if (window.campaignManager) {
        window.campaignManager.resetCampaign();
    }
    localStorage.removeItem('campaignProgress');
}

function resetLeaderboard() {
    if (window.leaderboardAPI) {
        window.leaderboardAPI.scores = [];
        window.leaderboardAPI.saveToLocalStorage();
    }
    localStorage.removeItem('leaderboardScores');
    localStorage.removeItem('leaderboardBinId');
}

function resetChallenges() {
    if (window.dailyChallengesManager) {
        window.dailyChallengesManager.challenges = window.dailyChallengesManager.generateChallenges();
        window.dailyChallengesManager.saveChallenges();
    }
    localStorage.removeItem('dailyChallenges');
}

// Export/Import functions
function exportGameData() {
    try {
        const data = {
            statistics: localStorage.getItem('gameStatistics'),
            achievements: localStorage.getItem('achievements'),
            campaign: localStorage.getItem('campaignProgress'),
            leaderboard: localStorage.getItem('leaderboardScores'),
            challenges: localStorage.getItem('dailyChallenges'),
            settings: localStorage.getItem('gameSettings'),
            passcodes: localStorage.getItem('creatorPasscodes'),
            exportDate: new Date().toISOString(),
            version: GAME_VERSION
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ethical-hacker-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        logError('Failed to export data:', error);
        return false;
    }
}

function importGameData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.statistics) localStorage.setItem('gameStatistics', data.statistics);
                if (data.achievements) localStorage.setItem('achievements', data.achievements);
                if (data.campaign) localStorage.setItem('campaignProgress', data.campaign);
                if (data.leaderboard) localStorage.setItem('leaderboardScores', data.leaderboard);
                if (data.challenges) localStorage.setItem('dailyChallenges', data.challenges);
                if (data.settings) localStorage.setItem('gameSettings', data.settings);
                if (data.passcodes) localStorage.setItem('creatorPasscodes', data.passcodes);
                
                // Reload managers
                if (window.statisticsManager) window.statisticsManager.stats = window.statisticsManager.loadStats();
                if (window.achievementManager) window.achievementManager.achievements = window.achievementManager.loadAchievements();
                if (window.campaignManager) window.campaignManager.progress = window.campaignManager.loadProgress();
                if (window.dailyChallengesManager) window.dailyChallengesManager.challenges = window.dailyChallengesManager.loadChallenges();
                if (window.settingsManager) window.settingsManager.settings = window.settingsManager.loadSettings();
                
                resolve(true);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--primary-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--secondary-color)'};
        color: var(--bg-dark);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10003;
        font-weight: bold;
        box-shadow: 0 0 20px var(--glow-color);
        animation: toastSlideIn 0.3s ease;
        max-width: 400px;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.resetAllGameData = resetAllGameData;
    window.resetStatistics = resetStatistics;
    window.resetAchievements = resetAchievements;
    window.resetCampaign = resetCampaign;
    window.resetLeaderboard = resetLeaderboard;
    window.resetChallenges = resetChallenges;
    window.exportGameData = exportGameData;
    window.importGameData = importGameData;
    window.showToast = showToast;
}

// Display version info
if (DEBUG) {
    console.log(`%cEthical Hacker v${GAME_VERSION}`, 'color: #00ff41; font-size: 16px; font-weight: bold;');
    console.log(`%cBuild Date: ${BUILD_DATE}`, 'color: #00ff41;');
}

// Game State Management
class GameState {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.selectedDevice = null;
        this.selectedDifficulty = null;
        this.password = '';
        this.passwordLength = 4;
        this.currentPassword = [];
        this.selectedCell = { row: 0, col: 0 };
        this.gridSize = 8;
        this.grid = [];
        this.attempts = 0;
        this.maxAttempts = 10;
        this.score = 0;
        this.timeRemaining = 60;
        this.timerInterval = null;
        this.gameStarted = false;
        this.filesRetrieved = false;
        this.filesDecrypted = false;
        this.encryptedFiles = [];
        this.decryptionKey = '';
        this.passwordHint = '';
        this.lastMoveTime = 0;
        this.moveCooldown = 200; // milliseconds between moves
        this.passwordPositions = [];
        this.breachSequence = [];
        this.breachInput = [];
        this.hintLevel = 0;
        this.hintNotificationShown = false;
        this.isCampaignMode = false;
        this.currentCampaignLevel = null;
    }

    reset() {
        this.currentPassword = [];
        this.selectedCell = { row: 0, col: 0 };
        this.attempts = 0;
        this.score = 0;
        this.filesRetrieved = false;
        this.filesDecrypted = false;
        this.encryptedFiles = [];
        this.decryptionKey = '';
        this.passwordHint = '';
        this.lastMoveTime = 0;
        this.passwordPositions = [];
        this.breachSequence = [];
        this.breachInput = [];
        this.hintLevel = 0;
        this.hintNotificationShown = false;
    }

    saveGameState() {
        if (!window.settingsManager || !window.settingsManager.getSetting('autoSave')) {
            return;
        }
        try {
            const saveData = {
                currentScreen: this.currentScreen,
                selectedDevice: this.selectedDevice,
                selectedDifficulty: this.selectedDifficulty,
                password: this.password,
                currentPassword: [...this.currentPassword],
                selectedCell: {...this.selectedCell},
                attempts: this.attempts,
                score: this.score,
                timeRemaining: this.timeRemaining,
                grid: this.grid.map(row => [...row]),
                passwordPositions: [...this.passwordPositions],
                gameStarted: this.gameStarted,
                filesRetrieved: this.filesRetrieved,
                filesDecrypted: this.filesDecrypted,
                timestamp: Date.now()
            };
            localStorage.setItem('gameSaveState', JSON.stringify(saveData));
        } catch (error) {
            logError('Failed to save game state:', error);
        }
    }

    loadGameState() {
        try {
            const saveData = localStorage.getItem('gameSaveState');
            if (saveData) {
                const data = JSON.parse(saveData);
                // Check if save is not too old (24 hours)
                if (Date.now() - data.timestamp < 86400000) {
                    this.currentScreen = data.currentScreen || this.currentScreen;
                    this.selectedDevice = data.selectedDevice;
                    this.selectedDifficulty = data.selectedDifficulty;
                    this.password = data.password || '';
                    this.currentPassword = data.currentPassword || [];
                    this.selectedCell = data.selectedCell || { row: 0, col: 0 };
                    this.attempts = data.attempts || 0;
                    this.score = data.score || 0;
                    this.timeRemaining = data.timeRemaining || 60;
                    this.grid = data.grid || [];
                    this.passwordPositions = data.passwordPositions || [];
                    this.gameStarted = data.gameStarted || false;
                    this.filesRetrieved = data.filesRetrieved || false;
                    this.filesDecrypted = data.filesDecrypted || false;
                    return true;
                } else {
                    // Save is too old, clear it
                    this.clearSaveState();
                }
            }
        } catch (error) {
            logError('Failed to load game state:', error);
        }
        return false;
    }

    clearSaveState() {
        localStorage.removeItem('gameSaveState');
    }
}

const gameState = new GameState();

// Screen Management
function showScreen(screenId) {
    // Hide all screens including pause menu
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    // Ensure pause menu is also hidden
    const pauseMenu = document.getElementById('pauseMenu');
    if (pauseMenu && screenId !== 'pauseMenu') {
        pauseMenu.style.display = 'none';
        pauseMenu.classList.remove('active');
        isPaused = false;
    }
    
    // Show target screen
    let screen = document.getElementById(screenId);
    
    // Handle dynamically created screens (like campaign complete)
    if (!screen && screenId === 'campaignComplete') {
        screen = document.querySelector('.campaign-complete');
    }
    
    if (screen) {
        screen.style.display = 'flex';
        screen.classList.add('active');
        gameState.currentScreen = screenId;
        
        // Reset menu selection when showing main menu
        if (screenId === 'mainMenu') {
            const mainMenuButtons = document.querySelectorAll('#mainMenu .menu-buttons .btn');
            if (mainMenuButtons.length > 0) {
                menuButtons = Array.from(mainMenuButtons);
                currentMenuIndex = 0;
                updateMenuSelection();
            }
        }
    } else {
        logError('Screen not found:', screenId);
    }
}

// Auto-detect device type
function detectDeviceType() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    (window.innerWidth <= 768 && window.innerHeight <= 1024);
    return isMobile ? 'mobile' : 'laptop';
}

// Store all generated passcodes for creator mode
let allGeneratedPasscodes = [];

// Initialize Game
function initializeGame() {
    gameState.reset();
    gameState.gameStarted = true;
    
    // Auto-detect device if not selected
    if (!gameState.selectedDevice) {
        gameState.selectedDevice = detectDeviceType();
    }
    
    // Generate random password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    gameState.password = '';
    for (let i = 0; i < gameState.passwordLength; i++) {
        gameState.password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Store passcode for creator mode
    const passcodeEntry = {
        password: gameState.password,
        device: gameState.selectedDevice,
        difficulty: gameState.selectedDifficulty,
        timestamp: new Date().toISOString(),
        time: Date.now()
    };
    allGeneratedPasscodes.push(passcodeEntry);
    savePasscodesToStorage();
    
    // Generate hint (show unique characters in password) - make it more helpful
    const uniqueChars = [...new Set(gameState.password.split(''))];
    const charCounts = {};
    gameState.password.split('').forEach(char => {
        charCounts[char] = (charCounts[char] || 0) + 1;
    });
    
    // Create detailed hint
    let hintText = `Password contains: ${uniqueChars.join(', ')}`;
    if (Object.keys(charCounts).length < gameState.passwordLength) {
        const repeated = Object.entries(charCounts).filter(([char, count]) => count > 1);
        if (repeated.length > 0) {
            hintText += ` (${repeated.map(([char, count]) => `${char} appears ${count} times`).join(', ')})`;
        }
    }
    gameState.passwordHint = hintText;
    gameState.passwordPositions = []; // Store password positions for highlighting
    
    // Reset hint system
    gameState.hintLevel = 0;
    gameState.hintNotificationShown = false;
    hideHintNotification();
    
    // Update UI
    updateDeviceDisplay();
    updatePasswordSlots();
    createCrosswordGrid();
    updateHint();
    updateAttemptsDisplay();
    startTimer();
    
    // Start background music (using sound generator)
    if (window.soundGenerator && !window.bgMusicNode) {
        window.bgMusicNode = window.soundGenerator.startBackgroundMusic();
    }
}

// Creator Mode Functions
function savePasscodesToStorage() {
    try {
        localStorage.setItem('creatorPasscodes', JSON.stringify(allGeneratedPasscodes));
    } catch (error) {
        logError('Failed to save passcodes:', error);
    }
}

function loadPasscodesFromStorage() {
    try {
        const stored = localStorage.getItem('creatorPasscodes');
        if (stored) {
            allGeneratedPasscodes = JSON.parse(stored);
        }
    } catch (error) {
        logError('Failed to load passcodes:', error);
        allGeneratedPasscodes = [];
    }
}

function showCreatorMode() {
    loadPasscodesFromStorage();
    updateCreatorDashboard();
    showScreen('creatorMode');
    
    // Force re-attach tab listeners when Creator Mode is shown
    setTimeout(() => {
        // Direct handler for achievements button
        const achievementsTab = document.getElementById('creatorAchievementsTab');
        if (achievementsTab) {
            achievementsTab.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                log('Achievements tab clicked directly');
                
                // Update active tab
                document.querySelectorAll('.creator-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Hide all tab contents
                document.querySelectorAll('.creator-tab-content').forEach(c => {
                    c.classList.remove('active');
                    c.style.display = 'none';
                });
                
                // Show achievements tab content
                const content = document.getElementById('tab-achievements');
                if (content) {
                    content.classList.add('active');
                    content.style.display = 'flex';
                    updateCreatorAchievements();
                    playSound('select');
                } else {
                    logError('Achievements tab content not found');
                    showToast('Error: Achievements tab not found', 'error');
                }
            };
        }
        
        // Setup all tabs
        document.querySelectorAll('.creator-tab').forEach(tab => {
            const tabName = tab.dataset.tab;
            if (!tabName) return;
            
            // Remove old listeners
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            
            newTab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                log(`Creator tab clicked: ${this.dataset.tab}`);
                
                // Update active tab
                document.querySelectorAll('.creator-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Hide all tab contents
                document.querySelectorAll('.creator-tab-content').forEach(c => {
                    c.classList.remove('active');
                    c.style.display = 'none';
                });
                
                // Show selected tab content
                const content = document.getElementById(`tab-${this.dataset.tab}`);
                if (content) {
                    content.classList.add('active');
                    content.style.display = 'flex';
                    
                    // Update content when switching tabs
                    if (this.dataset.tab === 'statistics') {
                        updateCreatorStatistics();
                    } else if (this.dataset.tab === 'leaderboard') {
                        updateCreatorLeaderboard();
                    } else if (this.dataset.tab === 'achievements') {
                        updateCreatorAchievements();
                    } else if (this.dataset.tab === 'debug') {
                        updateSystemInfo();
                    } else if (this.dataset.tab === 'passcodes') {
                        updateCreatorDashboard();
                    }
                    
                    playSound('select');
                } else {
                    logError(`Tab content not found: tab-${this.dataset.tab}`);
                }
            });
        });
        
        log('Creator Mode tabs re-initialized');
    }, 200);
}

function updateCreatorDashboard() {
    loadPasscodesFromStorage();
    
    const passcodeList = document.getElementById('passcodeList');
    const totalGames = document.getElementById('totalGames');
    const easyCount = document.getElementById('easyCount');
    const mediumCount = document.getElementById('mediumCount');
    const hardCount = document.getElementById('hardCount');
    
    if (!passcodeList) return;
    
    // Count by difficulty
    const easy = allGeneratedPasscodes.filter(p => p.difficulty === 'easy').length;
    const medium = allGeneratedPasscodes.filter(p => p.difficulty === 'medium').length;
    const hard = allGeneratedPasscodes.filter(p => p.difficulty === 'hard').length;
    
    if (totalGames) totalGames.textContent = allGeneratedPasscodes.length;
    if (easyCount) easyCount.textContent = easy;
    if (mediumCount) mediumCount.textContent = medium;
    if (hardCount) hardCount.textContent = hard;
    
    // Display passcodes
    if (allGeneratedPasscodes.length === 0) {
        passcodeList.innerHTML = '<p class="no-passcodes">No passcodes generated yet. Start a game to see them here.</p>';
    } else {
        passcodeList.innerHTML = '';
        
        // Sort by most recent first
        const sorted = [...allGeneratedPasscodes].sort((a, b) => (b.time || b.timestamp || 0) - (a.time || a.timestamp || 0));
        
        sorted.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'passcode-item';
            const date = new Date(entry.timestamp || entry.time || Date.now());
            item.innerHTML = `
                <div class="passcode-header">
                    <span class="passcode-number">#${sorted.length - index}</span>
                    <span class="passcode-difficulty ${entry.difficulty}">${entry.difficulty.toUpperCase()}</span>
                    <span class="passcode-device">${entry.device === 'laptop' ? '💻' : '📱'}</span>
                </div>
                <div class="passcode-value">${entry.password}</div>
                <div class="passcode-time">${date.toLocaleString()}</div>
            `;
            passcodeList.appendChild(item);
        });
    }
    
    // Update other tabs
    updateCreatorStatistics();
    updateCreatorLeaderboard();
    updateCreatorAchievements();
    updateSystemInfo();
}

function updateCreatorStatistics() {
    const display = document.getElementById('creatorStatsDisplay');
    if (!display || !window.statisticsManager) return;
    
    const stats = window.statisticsManager.getStats();
    display.innerHTML = `
        <div class="creator-stats-grid">
            <div class="stat-card">
                <h4>Total Games</h4>
                <p>${stats.totalGames || 0}</p>
            </div>
            <div class="stat-card">
                <h4>Games Won</h4>
                <p>${stats.gamesWon || 0}</p>
            </div>
            <div class="stat-card">
                <h4>Games Lost</h4>
                <p>${stats.gamesLost || 0}</p>
            </div>
            <div class="stat-card">
                <h4>Win Rate</h4>
                <p>${(stats.winRate || 0).toFixed(1)}%</p>
            </div>
            <div class="stat-card">
                <h4>Total Score</h4>
                <p>${stats.totalScore || 0}</p>
            </div>
            <div class="stat-card">
                <h4>Best Score</h4>
                <p>${stats.bestScore || 0}</p>
            </div>
            <div class="stat-card">
                <h4>Average Score</h4>
                <p>${stats.averageScore || 0}</p>
            </div>
            <div class="stat-card">
                <h4>Total Play Time</h4>
                <p>${Math.round((stats.totalTimePlayed || 0) / 60)} minutes</p>
            </div>
        </div>
        <h4 style="margin-top: 2rem;">Difficulty Breakdown</h4>
        <pre style="background: var(--bg-card); padding: 1rem; border-radius: 8px; overflow-x: auto; color: var(--text-primary);">${JSON.stringify(stats.difficultyStats, null, 2)}</pre>
        <h4 style="margin-top: 1rem;">Device Breakdown</h4>
        <pre style="background: var(--bg-card); padding: 1rem; border-radius: 8px; overflow-x: auto; color: var(--text-primary);">${JSON.stringify(stats.deviceStats, null, 2)}</pre>
    `;
}

function updateCreatorLeaderboard() {
    const display = document.getElementById('creatorLeaderboardDisplay');
    if (!display || !window.leaderboardAPI) return;
    
    const scores = window.leaderboardAPI.scores || [];
    if (scores.length === 0) {
        display.innerHTML = '<p class="no-passcodes">No scores yet.</p>';
        return;
    }
    
    display.innerHTML = `
        <div class="leaderboard-table">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 0.5rem; text-align: left;">Rank</th>
                        <th style="padding: 0.5rem; text-align: left;">Name</th>
                        <th style="padding: 0.5rem; text-align: right;">Score</th>
                        <th style="padding: 0.5rem; text-align: center;">Difficulty</th>
                        <th style="padding: 0.5rem; text-align: center;">Device</th>
                        <th style="padding: 0.5rem; text-align: center;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${scores.slice(0, 50).map((score, index) => `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 0.5rem;">#${index + 1}</td>
                            <td style="padding: 0.5rem;">${score.name || 'Anonymous'}</td>
                            <td style="padding: 0.5rem; text-align: right;">${score.score}</td>
                            <td style="padding: 0.5rem; text-align: center;">${score.difficulty || 'N/A'}</td>
                            <td style="padding: 0.5rem; text-align: center;">${score.device || 'N/A'}</td>
                            <td style="padding: 0.5rem; text-align: center; font-size: 0.9rem;">${new Date(score.date || score.timestamp).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <p style="margin-top: 1rem; color: var(--text-secondary);">Showing top ${Math.min(scores.length, 50)} of ${scores.length} scores</p>
    `;
}

function updateCreatorAchievements() {
    const display = document.getElementById('creatorAchievementsDisplay');
    if (!display || !window.achievementManager) return;
    
    const definitions = window.achievementManager.definitions;
    const achievements = window.achievementManager.achievements;
    
    display.innerHTML = `
        <div class="achievements-grid">
            ${definitions.map(def => {
                const unlocked = achievements.find(a => a.id === def.id);
                return `
                    <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}" style="padding: 1rem; background: var(--bg-card); border-radius: 8px; margin: 0.5rem;">
                        <div style="font-size: 2rem;">${def.icon}</div>
                        <h4>${def.name}</h4>
                        <p>${def.description}</p>
                        <p style="color: ${unlocked ? 'var(--primary-color)' : 'var(--text-secondary)'};">
                            ${unlocked ? '✅ Unlocked' : '🔒 Locked'}
                        </p>
                        ${unlocked ? `<p style="font-size: 0.8rem; color: var(--text-secondary);">Unlocked: ${new Date(unlocked.unlockedAt).toLocaleString()}</p>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
        <p style="margin-top: 1rem; color: var(--text-secondary);">
            Unlocked: ${achievements.length} / ${definitions.length}
        </p>
    `;
}

function updateSystemInfo() {
    const systemInfo = document.getElementById('systemInfo');
    const storageInfo = document.getElementById('storageInfo');
    const debugStatus = document.getElementById('debugStatus');
    
    if (systemInfo) {
        systemInfo.innerHTML = `
            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
                <p><strong>Browser:</strong> ${navigator.userAgent.split(' ')[0]}</p>
                <p><strong>Platform:</strong> ${navigator.platform}</p>
                <p><strong>Language:</strong> ${navigator.language}</p>
                <p><strong>Game Version:</strong> ${GAME_VERSION}</p>
                <p><strong>Build Date:</strong> ${BUILD_DATE}</p>
                <p><strong>Debug Mode:</strong> ${DEBUG ? 'ON' : 'OFF'}</p>
                <p><strong>Screen:</strong> ${window.innerWidth}x${window.innerHeight}</p>
            </div>
        `;
    }
    
    if (storageInfo) {
        let totalSize = 0;
        const storageDetails = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const size = new Blob([value]).size;
            totalSize += size;
            storageDetails.push({ key, size });
        }
        
        storageInfo.innerHTML = `
            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
                <p><strong>Total Storage Used:</strong> ${(totalSize / 1024).toFixed(2)} KB</p>
                <p><strong>Items Stored:</strong> ${localStorage.length}</p>
                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; color: var(--primary-color);">View Details</summary>
                    <pre style="margin-top: 0.5rem; max-height: 200px; overflow-y: auto; color: var(--text-primary);">${JSON.stringify(storageDetails, null, 2)}</pre>
                </details>
            </div>
        `;
    }
    
    if (debugStatus) {
        debugStatus.textContent = DEBUG ? 'ON' : 'OFF';
    }
}

function updateHint() {
    const hintElement = document.getElementById('passwordHint');
    if (hintElement) {
        if (gameState.hintLevel === 0) {
            hintElement.textContent = gameState.passwordHint;
            hintElement.classList.remove('hint-revealed');
        } else {
            // Hint will be updated by requestHint function
        }
    }
}

// Hint System Functions
function checkPlayerStruggling() {
    // Show hint notification if player is struggling
    if (gameState.currentScreen !== 'bruteForceGame') return;
    if (gameState.hintLevel >= 5) return; // Don't show if all hints used
    
    const attemptsRatio = gameState.attempts / gameState.maxAttempts;
    const maxTime = gameState.selectedDifficulty === 'easy' ? 60 : gameState.selectedDifficulty === 'medium' ? 45 : 30;
    const timeRatio = gameState.timeRemaining / maxTime;
    
    // Show hint if: used 40%+ attempts OR less than 40% time remaining OR 2+ failed attempts
    // Also show again if player continues struggling after dismissing
    if ((attemptsRatio >= 0.4 || timeRatio <= 0.4 || gameState.attempts >= 2) && !gameState.hintNotificationShown) {
        showHintNotification();
    }
}

function showHintNotification() {
    const notification = document.getElementById('hintNotification');
    if (notification && gameState.currentScreen === 'bruteForceGame' && !gameState.hintNotificationShown) {
        notification.classList.add('show');
        gameState.hintNotificationShown = true;
        playSound('select');
    }
}

function hideHintNotification() {
    const notification = document.getElementById('hintNotification');
    if (notification) {
        notification.classList.remove('show');
    }
    // Allow notification to show again after a delay if player continues struggling
    setTimeout(() => {
        if (gameState.currentScreen === 'bruteForceGame' && gameState.hintLevel < 5) {
            gameState.hintNotificationShown = false;
            // Check again if player is still struggling
            setTimeout(() => {
                checkPlayerStruggling();
            }, 2000);
        }
    }, 5000); // 5 seconds before allowing notification again
}

function requestHint() {
    gameState.hintLevel++;
    hideHintNotification();
    
    const hintElement = document.getElementById('passwordHint');
    if (!hintElement) return;
    
    let hintText = '';
    let hintTitle = '';
    
    if (gameState.hintLevel === 1) {
        // Level 1: Show first character
        hintTitle = '💡 Hint 1: First Character';
        hintText = `The password starts with: <strong style="color: var(--primary-color); font-size: 1.3em;">${gameState.password[0]}</strong>`;
    } else if (gameState.hintLevel === 2) {
        // Level 2: Show first two characters
        hintTitle = '💡 Hint 2: First Two Characters';
        hintText = `The password starts with: <strong style="color: var(--primary-color); font-size: 1.3em;">${gameState.password[0]}${gameState.password[1]}</strong>`;
    } else if (gameState.hintLevel === 3) {
        // Level 3: Show first half of password
        const halfLength = Math.ceil(gameState.passwordLength / 2);
        const firstHalf = gameState.password.substring(0, halfLength);
        const remaining = gameState.passwordLength - halfLength;
        hintTitle = '💡 Hint 3: First Half';
        hintText = `First ${halfLength} characters: <strong style="color: var(--primary-color); font-size: 1.3em;">${firstHalf}</strong> (${remaining} more to find)`;
    } else if (gameState.hintLevel === 4) {
        // Level 4: Show grid positions
        hintTitle = '💡 Hint 4: Character Positions';
        const positions = gameState.passwordPositions.map((pos, idx) => 
            `${gameState.password[idx]} at Row ${pos.row + 1}, Col ${pos.col + 1}`
        ).join(' | ');
        hintText = `Password positions: ${positions}`;
        highlightPasswordCharacters();
    } else if (gameState.hintLevel >= 5) {
        // Level 5: Show full password with positions
        hintTitle = '💡 Hint 5: Complete Guide';
        const fullGuide = gameState.password.split('').map((char, idx) => {
            const pos = gameState.passwordPositions[idx];
            return `${char} (Row ${pos.row + 1}, Col ${pos.col + 1})`;
        }).join(' → ');
        hintText = `Full password sequence: <strong style="color: var(--primary-color);">${fullGuide}</strong>`;
        highlightPasswordCharacters();
    }
    
    // Update hint display
    hintElement.innerHTML = `<div class="hint-title">${hintTitle}</div><div class="hint-text">${hintText}</div>`;
    hintElement.classList.add('hint-revealed');
    
    // Show notification again if more hints available (after delay)
    if (gameState.hintLevel < 5) {
        setTimeout(() => {
            if (gameState.currentScreen === 'bruteForceGame' && gameState.attempts < gameState.maxAttempts) {
                gameState.hintNotificationShown = false; // Allow showing again
            }
        }, 3000); // Wait 3 seconds before allowing next hint
    }
    
    playSound('success');
}

function highlightPasswordCharacters() {
    // Add special highlighting to password characters
    gameState.passwordPositions.forEach((pos, idx) => {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (row === pos.row && col === pos.col) {
                cell.classList.add('hint-highlighted');
                // Add number indicator
                if (!cell.querySelector('.hint-number')) {
                    const number = document.createElement('span');
                    number.className = 'hint-number';
                    number.textContent = idx + 1;
                    cell.appendChild(number);
                }
            }
        });
    });
}

function updateAttemptsDisplay() {
    const attemptsElement = document.getElementById('attempts');
    const maxAttemptsElement = document.getElementById('maxAttempts');
    if (attemptsElement) {
        attemptsElement.textContent = gameState.attempts;
    }
    if (maxAttemptsElement) {
        maxAttemptsElement.textContent = gameState.maxAttempts;
    }
}

function updateDeviceDisplay() {
    const deviceNames = {
        laptop: '💻 LAPTOP',
        mobile: '📱 MOBILE'
    };
    const deviceEl = document.getElementById('currentDevice');
    const difficultyEl = document.getElementById('currentDifficulty');
    if (deviceEl) deviceEl.textContent = deviceNames[gameState.selectedDevice] || '💻 LAPTOP';
    if (difficultyEl && gameState.selectedDifficulty) difficultyEl.textContent = gameState.selectedDifficulty.toUpperCase();
}

function updatePasswordSlots() {
    const slotsContainer = document.getElementById('passwordSlots');
    if (!slotsContainer) return; // Safety check
    
    slotsContainer.innerHTML = '';
    
    for (let i = 0; i < gameState.passwordLength; i++) {
        const slot = document.createElement('div');
        slot.className = 'password-slot';
        slot.textContent = gameState.currentPassword[i] || '';
        if (gameState.currentPassword[i]) {
            slot.classList.add('filled');
        }
        slotsContainer.appendChild(slot);
    }
}

function createCrosswordGrid() {
    const gridContainer = document.getElementById('crosswordGrid');
    if (!gridContainer) return; // Safety check
    
    gridContainer.innerHTML = '';
    
    // Adjust grid size based on difficulty - smaller for easy to make it easier
    if (gameState.selectedDifficulty === 'easy') {
        gameState.gridSize = 5; // Smaller grid for easy level
    } else if (gameState.selectedDifficulty === 'medium') {
        gameState.gridSize = 7;
    } else {
        gameState.gridSize = 8; // Hard level
    }
    
    // Set grid size attribute for CSS
    gridContainer.setAttribute('data-size', gameState.gridSize);
    
    // Create grid with random characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    gameState.grid = [];
    
    // Place password characters in grid - make them easier to find for easy level
    const passwordPositions = [];
    for (let i = 0; i < gameState.passwordLength; i++) {
        let row, col;
        let attempts = 0;
        do {
            row = Math.floor(Math.random() * gameState.gridSize);
            col = Math.floor(Math.random() * gameState.gridSize);
            attempts++;
        } while (passwordPositions.some(p => p.row === row && p.col === col) && attempts < 50);
        passwordPositions.push({ row, col, char: gameState.password[i], index: i });
    }
    
    // Store password positions for highlighting
    gameState.passwordPositions = passwordPositions;
    
    // Fill grid
    for (let row = 0; row < gameState.gridSize; row++) {
        gameState.grid[row] = [];
        for (let col = 0; col < gameState.gridSize; col++) {
            const pos = passwordPositions.find(p => p.row === row && p.col === col);
            const char = pos ? pos.char : chars[Math.floor(Math.random() * chars.length)];
            gameState.grid[row][col] = char;
            
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = char;
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Highlight password characters with subtle glow
            if (pos) {
                cell.classList.add('password-char');
                cell.dataset.passwordIndex = pos.index;
            }
            
            if (row === gameState.selectedCell.row && col === gameState.selectedCell.col) {
                cell.classList.add('selected');
            }
            
            // Add touch support for mobile - simplified and more reliable
            let cellTouchStartTime = 0;
            let cellTouchMoved = false;
            let lastTouchEnd = 0;
            
            // Touch start
            cell.addEventListener('touchstart', (e) => {
                e.stopPropagation(); // Prevent grid swipe handler
                cellTouchStartTime = Date.now();
                cellTouchMoved = false;
                cell.classList.add('touch-active');
            }, { passive: true });
            
            // Touch move - detect if user is swiping
            cell.addEventListener('touchmove', (e) => {
                cellTouchMoved = true;
            }, { passive: true });
            
            // Touch end - handle tap
            cell.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                cell.classList.remove('touch-active');
                lastTouchEnd = Date.now();
                
                const deltaTime = Date.now() - cellTouchStartTime;
                
                // If it's a quick tap (not a swipe), select the cell
                if (!cellTouchMoved && deltaTime < 300) {
                    // Select this cell
                    gameState.selectedCell.row = row;
                    gameState.selectedCell.col = col;
                    updateSelectedCell();
                    // Select the character immediately
                    handleSelection();
                }
            }, { passive: false });
            
            // Also support click for desktop (but not from touch)
            cell.addEventListener('click', (e) => {
                // Ignore click if it came from a touch event (within 300ms)
                if (Date.now() - lastTouchEnd < 300) {
                    return;
                }
                
                gameState.selectedCell.row = row;
                gameState.selectedCell.col = col;
                updateSelectedCell();
                handleSelection();
            });
            
            gridContainer.appendChild(cell);
        }
    }
    
    updateSelectedCell();
    
    // Setup swipe handlers after grid is created
    setTimeout(() => {
        setupSwipeHandlers();
    }, 100);
}

function updateSelectedCell() {
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('selected');
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (row === gameState.selectedCell.row && col === gameState.selectedCell.col) {
            cell.classList.add('selected');
        }
    });
}

// Movement Controls
// Initialize keys object on window for gamepad access
if (typeof window.keys === 'undefined') {
    window.keys = {};
}
const keys = window.keys;
let gamepadConnected = false;

// Smooth arrow key movement
let arrowKeyRepeatInterval = null;
let currentArrowKey = null;

// Menu Navigation
let currentMenuIndex = 0;
let menuButtons = [];

function updateMenuSelection() {
    const buttons = document.querySelectorAll('#mainMenu .menu-buttons .btn');
    if (buttons.length === 0) return;
    
    menuButtons = Array.from(buttons);
    menuButtons.forEach((btn, index) => {
        btn.classList.remove('selected');
        if (index === currentMenuIndex) {
            btn.classList.add('selected');
        }
    });
}

function selectMenuButton() {
    if (menuButtons.length > 0 && menuButtons[currentMenuIndex]) {
        menuButtons[currentMenuIndex].click();
    }
}

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // Handle Enter key on welcome screen
    if (gameState.currentScreen === 'welcomeScreen' && e.key === 'Enter') {
        e.preventDefault();
        showScreen('mainMenu');
        playSound('select');
        return;
    }
    
    // Handle menu navigation
    if (gameState.currentScreen === 'mainMenu') {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentMenuIndex = (currentMenuIndex - 1 + menuButtons.length) % menuButtons.length;
            updateMenuSelection();
            playSound('select');
            return;
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentMenuIndex = (currentMenuIndex + 1) % menuButtons.length;
            updateMenuSelection();
            playSound('select');
            return;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            selectMenuButton();
            return;
        }
    }
    
    // Pause/Resume handlers
    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && gameState.currentScreen === 'bruteForceGame' && !isPaused) {
        e.preventDefault();
        togglePause();
        return;
    }
    
    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && gameState.currentScreen === 'pauseMenu') {
        e.preventDefault();
        resumeGame();
        return;
    }
    
    // Back button handler (ESC during game)
    if (e.key === 'Escape' && gameState.currentScreen === 'bruteForceGame' && !isPaused) {
        e.preventDefault();
        showCustomConfirm(
            'RETURN TO MENU',
            'Return to menu? Progress will be saved.',
            () => {
                gameState.saveGameState();
                if (gameState.isCampaignMode) {
                    gameState.isCampaignMode = false;
                    gameState.currentCampaignLevel = null;
                    updateCampaignDisplay();
                    showScreen('campaignScreen');
                } else {
                    showScreen('mainMenu');
                }
                playSound('select');
            },
            () => {
                // Cancel - do nothing
            }
        );
        return;
    }
    
    // Only handle arrow keys and Enter for brute force game
    if (gameState.currentScreen === 'bruteForceGame' && !isPaused) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            
            // If this is a new key, start movement
            if (currentArrowKey !== e.key) {
                currentArrowKey = e.key;
                keys[key] = true;
                handleMovement(); // Immediate first move
                
                // Start repeating after initial delay
                clearInterval(arrowKeyRepeatInterval);
                arrowKeyRepeatInterval = setInterval(() => {
                    if (keys[key]) {
                        handleMovement();
                    }
                }, 150); // Smooth repeat rate
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSelection();
        }
    } else if (gameState.currentScreen === 'fileRetrieval') {
        // Arrow keys and WASD for sensor movement
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            keys['arrowup'] = true;
            handleSensorMovement();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            keys['arrowdown'] = true;
            handleSensorMovement();
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            keys['arrowleft'] = true;
            handleSensorMovement();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            keys['arrowright'] = true;
            handleSensorMovement();
        } else if (e.key === ' ') {
            keys[' '] = true;
        }
    } else if (gameState.currentScreen === 'decryptionScreen') {
        // Enter key handled in decryption input listener
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = false;
    
    // Stop repeating when key is released
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (currentArrowKey === e.key) {
            currentArrowKey = null;
            clearInterval(arrowKeyRepeatInterval);
            arrowKeyRepeatInterval = null;
        }
    }
    
    // Handle WASD keyup for file retrieval
    if (gameState.currentScreen === 'fileRetrieval') {
        if (e.key === 'w' || e.key === 'W') {
            keys['arrowup'] = false;
        } else if (e.key === 's' || e.key === 'S') {
            keys['arrowdown'] = false;
        } else if (e.key === 'a' || e.key === 'A') {
            keys['arrowleft'] = false;
        } else if (e.key === 'd' || e.key === 'D') {
            keys['arrowright'] = false;
        }
    }
});

function handleMovement() {
    if (gameState.currentScreen === 'bruteForceGame') {
        let moved = false;
        
        // Check arrow keys - process in priority order
        if (keys['arrowup'] && gameState.selectedCell.row > 0) {
            gameState.selectedCell.row--;
            moved = true;
        } else if (keys['arrowdown'] && gameState.selectedCell.row < gameState.gridSize - 1) {
            gameState.selectedCell.row++;
            moved = true;
        } else if (keys['arrowleft'] && gameState.selectedCell.col > 0) {
            gameState.selectedCell.col--;
            moved = true;
        } else if (keys['arrowright'] && gameState.selectedCell.col < gameState.gridSize - 1) {
            gameState.selectedCell.col++;
            moved = true;
        }
        
        if (moved) {
            updateSelectedCell();
            playSound('select');
        }
    } else if (gameState.currentScreen === 'fileRetrieval') {
        handleSensorMovement();
    }
}

function handleSelection() {
    if (gameState.currentScreen === 'bruteForceGame') {
        // Check if attempts exceeded
        if (gameState.attempts >= gameState.maxAttempts) {
            showAlternativeBreach();
            return;
        }
        
        const selectedChar = gameState.grid[gameState.selectedCell.row][gameState.selectedCell.col];
        
        if (gameState.currentPassword.length < gameState.passwordLength) {
            gameState.currentPassword.push(selectedChar);
            updatePasswordSlots();
            playSound('typing');
            
            // Check if password is complete - wait a moment to show the character
            if (gameState.currentPassword.length === gameState.passwordLength) {
                setTimeout(() => {
                    checkPassword();
                }, 100); // Small delay to show the last character
            }
        }
    } else if (gameState.currentScreen === 'fileRetrieval') {
        handleSensorRetrieval();
    }
}

function handleSensorRetrieval() {
    // Space key is handled in checkSensorAlignment
    // This function exists for compatibility
}

function checkPassword() {
    gameState.attempts++;
    updateAttemptsDisplay();
    
    const userPassword = gameState.currentPassword.join('');
    
    if (userPassword === gameState.password) {
        // Correct password
        playSound('success');
        gameState.score += (gameState.timeRemaining * 10);
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = gameState.score;
        
        // Mark correct cells
        document.querySelectorAll('.grid-cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (row === gameState.selectedCell.row && col === gameState.selectedCell.col) {
                cell.classList.add('correct');
            }
        });
        
        setTimeout(() => {
            stopTimer();
            showScreen('fileRetrieval');
            initializeFileRetrieval();
        }, 1000);
    } else {
        // Incorrect password
        playSound('error');
        
        // Add screen shake on error
        if (typeof screenShake === 'function') {
            screenShake(3, 200);
        }
        
        // Check if player is struggling and show hint notification
        checkPlayerStruggling();
        
        // Check if attempts exceeded
        if (gameState.attempts >= gameState.maxAttempts) {
            setTimeout(() => {
                showAlternativeBreach();
            }, 500);
            return;
        }
        
        gameState.currentPassword = [];
        updatePasswordSlots();
        
        // Mark incorrect cells
        document.querySelectorAll('.grid-cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (row === gameState.selectedCell.row && col === gameState.selectedCell.col) {
                cell.classList.add('incorrect');
                setTimeout(() => {
                    cell.classList.remove('incorrect');
                }, 500);
            }
        });
    }
}

// Timer
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = gameState.timeRemaining;
            
            if (gameState.timeRemaining <= 10) {
                if (timerElement.parentElement) {
                    timerElement.parentElement.classList.add('warning');
                }
            } else {
                if (timerElement.parentElement) {
                    timerElement.parentElement.classList.remove('warning');
                }
            }
        }
        
        // Check if player is struggling due to time
        if (gameState.timeRemaining > 0 && gameState.currentScreen === 'bruteForceGame') {
            checkPlayerStruggling();
        }
        
        if (gameState.timeRemaining <= 0) {
            stopTimer();
            gameOver();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function gameOver() {
    playSound('error');
    // Add screen shake on game over
    if (typeof screenShake === 'function') {
        screenShake(5, 400);
    }
    stopTimer();
    const timeUpAttempts = document.getElementById('timeUpAttempts');
    const timeUpScore = document.getElementById('timeUpScore');
    if (timeUpAttempts) timeUpAttempts.textContent = gameState.attempts;
    if (timeUpScore) timeUpScore.textContent = gameState.score;
    
    // Track statistics for lost game
    if (window.statisticsManager) {
        const gameData = {
            won: false,
            score: gameState.score,
            difficulty: gameState.selectedDifficulty,
            device: gameState.selectedDevice,
            timeRemaining: gameState.timeRemaining,
            timeLimit: 60, // Approximate
            attempts: gameState.attempts,
            hintsUsed: gameState.hintLevel
        };
        window.statisticsManager.recordGame(gameData);
        
        // Check daily challenges (games played)
        if (window.dailyChallengesManager) {
            window.dailyChallengesManager.checkChallengeProgress(gameData);
        }
    }
    
    // Clear save state on game over
    gameState.clearSaveState();
    
    showScreen('timeUpScreen');
    gameState.gameStarted = false;
}

// Alternative Breach Method
function showAlternativeBreach() {
    stopTimer();
    playSound('error');
    showScreen('alternativeBreachScreen');
    initializeAlternativeBreach();
    gameState.gameStarted = false;
}

function initializeAlternativeBreach() {
    // This is a different hacking method - bypassing password lock
    // User needs to complete a sequence or pattern
    const breachContainer = document.getElementById('breachSequence');
    if (breachContainer) {
        breachContainer.innerHTML = '';
        
        // Create a sequence pattern game
        const sequence = [];
        const colors = ['red', 'blue', 'green', 'yellow'];
        for (let i = 0; i < 6; i++) {
            sequence.push(colors[Math.floor(Math.random() * colors.length)]);
        }
        
        gameState.breachSequence = sequence;
        gameState.breachInput = [];
        
        sequence.forEach((color, index) => {
            const btn = document.createElement('button');
            btn.className = `breach-btn ${color}`;
            btn.dataset.color = color;
            btn.dataset.index = index;
            btn.style.display = 'none'; // Hide initially, show in sequence
            breachContainer.appendChild(btn);
        });
        
        // Show sequence with delay
        showBreachSequence(0);
    }
}

function showBreachSequence(index) {
    const buttons = document.querySelectorAll('.breach-btn');
    if (index < buttons.length) {
        buttons[index].style.display = 'block';
        buttons[index].classList.add('flash');
        setTimeout(() => {
            buttons[index].classList.remove('flash');
            showBreachSequence(index + 1);
        }, 500);
    } else {
        // All shown, now enable input
        setTimeout(() => {
            buttons.forEach(btn => {
                btn.style.display = 'block';
                btn.style.opacity = '0.5';
                btn.addEventListener('click', handleBreachInput);
            });
            const instructionsEl = document.getElementById('breachInstructions');
            if (instructionsEl) instructionsEl.textContent = 'Click the buttons in the same sequence!';
        }, 1000);
    }
}

function handleBreachInput(e) {
    const color = e.target.dataset.color;
    gameState.breachInput.push(color);
    
    // Visual feedback
    e.target.style.opacity = '1';
    e.target.classList.add('pressed');
    setTimeout(() => {
        e.target.style.opacity = '0.5';
        e.target.classList.remove('pressed');
    }, 200);
    
    // Check if sequence matches
    if (gameState.breachInput.length === gameState.breachSequence.length) {
        const correct = gameState.breachSequence.every((c, i) => c === gameState.breachInput[i]);
        if (correct) {
            playSound('success');
            gameState.score += 300; // Bonus for alternative breach
            setTimeout(() => {
                showScreen('fileRetrieval');
                initializeFileRetrieval();
            }, 1000);
        } else {
            playSound('error');
            // Add screen shake on error
            if (typeof screenShake === 'function') {
                screenShake(5, 300);
            }
            gameState.breachInput = [];
            document.querySelectorAll('.breach-btn').forEach(btn => {
                btn.style.opacity = '0.5';
            });
            const instructionsEl = document.getElementById('breachInstructions');
            if (instructionsEl) instructionsEl.textContent = 'Wrong sequence! Try again.';
        }
    }
}

// File Retrieval
let sensorPosition = { x: 50, y: 50 };
let targetPosition = { x: 50, y: 50 };
let sensorProgress = 0;
let sensorInterval = null;

function initializeFileRetrieval() {
    sensorPosition = { x: 50, y: 50 };
    targetPosition = {
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 40
    };
    sensorProgress = 0;
    
    // Reset progress display
    const progressEl = document.getElementById('sensorProgress');
    const progressFill = document.getElementById('progressFill');
    if (progressEl) progressEl.textContent = '0';
    if (progressFill) progressFill.style.width = '0%';
    
    updateSensorDisplay();
}

function updateSensorDisplay() {
    const pointer = document.getElementById('sensorPointer');
    const target = document.getElementById('targetZone');
    const distanceText = document.getElementById('distanceText');
    const progressFill = document.getElementById('progressFill');
    const sensorStatus = document.getElementById('sensorStatus');
    const statusText = sensorStatus ? sensorStatus.querySelector('.status-text') : null;
    
    if (pointer && target) {
        pointer.style.left = sensorPosition.x + '%';
        pointer.style.top = sensorPosition.y + '%';
        target.style.left = targetPosition.x + '%';
        target.style.top = targetPosition.y + '%';
        
        // Calculate and display distance
        const distance = Math.sqrt(
            Math.pow(sensorPosition.x - targetPosition.x, 2) + 
            Math.pow(sensorPosition.y - targetPosition.y, 2)
        );
        
        if (distanceText) {
            distanceText.textContent = `Distance: ${Math.round(distance)}%`;
        }
        
        // Update progress bar
        if (progressFill) {
            progressFill.style.width = sensorProgress + '%';
        }
        
        // Update status
        if (statusText) {
            if (distance < 10) {
                if (keys[' ']) {
                    statusText.textContent = 'Retrieving files...';
                    sensorStatus.className = 'sensor-status retrieving';
                } else {
                    statusText.textContent = 'Hold SPACE to retrieve';
                    sensorStatus.className = 'sensor-status aligned';
                }
            } else if (distance < 20) {
                statusText.textContent = 'Getting closer...';
                sensorStatus.className = 'sensor-status close';
            } else {
                statusText.textContent = 'Move sensor to target zone';
                sensorStatus.className = 'sensor-status';
            }
        }
    }
}

function handleSensorMovement() {
    let moved = false;
    const speed = 2;
    
    // Use arrow keys for sensor movement
    if (keys['arrowup'] && gameState.currentScreen === 'fileRetrieval') {
        sensorPosition.y = Math.max(5, sensorPosition.y - speed);
        moved = true;
    }
    if (keys['arrowdown'] && gameState.currentScreen === 'fileRetrieval') {
        sensorPosition.y = Math.min(95, sensorPosition.y + speed);
        moved = true;
    }
    if (keys['arrowleft'] && gameState.currentScreen === 'fileRetrieval') {
        sensorPosition.x = Math.max(5, sensorPosition.x - speed);
        moved = true;
    }
    if (keys['arrowright'] && gameState.currentScreen === 'fileRetrieval') {
        sensorPosition.x = Math.min(95, sensorPosition.x + speed);
        moved = true;
    }
    
    if (moved) {
        updateSensorDisplay();
        checkSensorAlignment();
    }
}

function checkSensorAlignment() {
    const distance = Math.sqrt(
        Math.pow(sensorPosition.x - targetPosition.x, 2) + 
        Math.pow(sensorPosition.y - targetPosition.y, 2)
    );
    
    // Update display with distance
    updateSensorDisplay();
    
    if (distance < 10) {
        if (keys[' ']) {
            if (!sensorInterval) {
                sensorInterval = setInterval(() => {
                    sensorProgress += 2;
                    const progressEl = document.getElementById('sensorProgress');
                    const progressFill = document.getElementById('progressFill');
                    if (progressEl) progressEl.textContent = sensorProgress;
                    if (progressFill) progressFill.style.width = sensorProgress + '%';
                    
                    if (sensorProgress >= 100) {
                        clearInterval(sensorInterval);
                        sensorInterval = null;
                        completeFileRetrieval();
                    }
                }, 100);
            }
        } else {
            if (sensorInterval) {
                clearInterval(sensorInterval);
                sensorInterval = null;
            }
        }
    } else {
        if (sensorInterval) {
            clearInterval(sensorInterval);
            sensorInterval = null;
        }
        if (sensorProgress > 0) {
            sensorProgress = Math.max(0, sensorProgress - 1);
            const progressEl = document.getElementById('sensorProgress');
            const progressFill = document.getElementById('progressFill');
            if (progressEl) progressEl.textContent = sensorProgress;
            if (progressFill) progressFill.style.width = sensorProgress + '%';
        }
    }
}

function completeFileRetrieval() {
    playSound('success');
    // Add particles on file retrieval success
    if (typeof createParticles === 'function') {
        const sensorDisplay = document.getElementById('sensorDisplay');
        if (sensorDisplay) {
            const rect = sensorDisplay.getBoundingClientRect();
            createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '#00ff41', 15);
        }
    }
    gameState.filesRetrieved = true;
    gameState.score += 500;
    
    // Generate encrypted files if needed
    if (gameState.selectedDifficulty === 'medium' || gameState.selectedDifficulty === 'hard') {
        generateEncryptedFiles();
        setTimeout(() => {
            showScreen('decryptionScreen');
            initializeDecryption();
        }, 1000);
    } else {
        setTimeout(() => {
            // Add confetti on campaign completion
            if (typeof createConfetti === 'function') {
                createConfetti();
            }
            showSuccessScreen();
        }, 1000);
    }
}

// Decryption
function generateEncryptedFiles() {
    const fileNames = ['confidential.txt', 'passwords.db', 'financial.xlsx', 'contacts.vcf', 'notes.md'];
    gameState.encryptedFiles = [];
    
    for (let i = 0; i < 3; i++) {
        const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
        const encrypted = btoa(fileName + ':' + Math.random().toString(36));
        gameState.encryptedFiles.push({
            name: fileName,
            encrypted: encrypted,
            decrypted: false
        });
    }
    
    // Generate decryption key (simple pattern)
    const patterns = ['ABCD1234', '1234ABCD', 'A1B2C3D4', '1A2B3C4D'];
    gameState.decryptionKey = patterns[Math.floor(Math.random() * patterns.length)];
}

function initializeDecryption() {
    const filesContainer = document.getElementById('encryptedFiles');
    filesContainer.innerHTML = '';
    
    gameState.encryptedFiles.forEach((file, index) => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        fileDiv.id = `file-${index}`;
        fileDiv.textContent = `🔒 ${file.encrypted}`;
        filesContainer.appendChild(fileDiv);
    });
    
    // Show pattern hint
    const patternElement = document.getElementById('keyPattern');
    if (patternElement) {
        const hint = gameState.decryptionKey.split('').map((char, i) => {
            if (i % 2 === 0) return char;
            return '?';
        }).join('');
        if (patternElement) patternElement.textContent = `Pattern: ${hint}`;
    }
    
    const decryptionKeyInput = document.getElementById('decryptionKey');
    if (decryptionKeyInput) decryptionKeyInput.value = '';
}

function attemptDecryption() {
    const inputEl = document.getElementById('decryptionKey');
    if (!inputEl) return;
    
    // Validate and sanitize input
    const rawKey = inputEl.value;
    const sanitized = sanitizeInput(rawKey, 16);
    if (!validateInput(sanitized, 'decryption')) {
        inputEl.classList.add('error-shake');
        inputEl.placeholder = 'Invalid key (alphanumeric only, 1-16 chars)';
        setTimeout(() => {
            inputEl.classList.remove('error-shake');
            inputEl.placeholder = 'Enter decryption key';
        }, 2000);
        return;
    }
    
    const input = sanitized.trim().toUpperCase();
    
    if (input === gameState.decryptionKey) {
        playSound('success');
        gameState.filesDecrypted = true;
        gameState.score += 1000;
        
        // Decrypt files
        gameState.encryptedFiles.forEach((file, index) => {
            const fileDiv = document.getElementById(`file-${index}`);
            if (fileDiv) {
                fileDiv.classList.add('decrypted');
                fileDiv.textContent = `✅ ${file.name}`;
            }
        });
        
        setTimeout(() => {
            showSuccessScreen();
        }, 2000);
    } else {
        playSound('error');
        
        // Show in-game error message instead of alert
        const input = document.getElementById('decryptionKey');
        if (input) {
            input.value = '';
            input.classList.add('error-shake');
            input.placeholder = 'Incorrect key! Try again...';
            setTimeout(() => {
                input.classList.remove('error-shake');
                input.placeholder = 'Enter decryption key';
            }, 2000);
        }
        
        // Show error message above input
        showDecryptionError('Incorrect decryption key! Analyze the pattern and try again.');
    }
}

// Add event listeners for decryption
document.addEventListener('DOMContentLoaded', () => {
    const decryptBtn = document.getElementById('decryptBtn');
    const decryptionKeyInput = document.getElementById('decryptionKey');
    
    if (decryptBtn) {
        decryptBtn.addEventListener('click', attemptDecryption);
    }
    
    if (decryptionKeyInput) {
        decryptionKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                attemptDecryption();
            }
        });
    }
});

// Success Screen
function showSuccessScreen() {
    stopTimer();
    
    // Add confetti celebration
    if (typeof createConfetti === 'function') {
        createConfetti();
    }
    
    // Add particles at center
    if (typeof createParticles === 'function') {
        setTimeout(() => {
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#00ff41', 30);
        }, 300);
    }
    
    const finalScoreEl = document.getElementById('finalScore');
    const timeRemainingEl = document.getElementById('timeRemaining');
    const filesRetrievedEl = document.getElementById('filesRetrieved');
    
    if (finalScoreEl) finalScoreEl.textContent = gameState.score;
    if (timeRemainingEl) timeRemainingEl.textContent = gameState.timeRemaining;
    if (filesRetrievedEl) filesRetrievedEl.textContent = gameState.encryptedFiles.length || 3;
    
    // Track statistics and achievements
    if (window.statisticsManager) {
        const gameData = {
            won: true,
            score: gameState.score,
            difficulty: gameState.selectedDifficulty,
            device: gameState.selectedDevice,
            timeRemaining: gameState.timeRemaining,
            timeLimit: gameState.timeRemaining + (60 - gameState.timeRemaining), // Approximate
            attempts: gameState.attempts,
            hintsUsed: gameState.hintLevel
        };
        window.statisticsManager.recordGame(gameData);
        
        // Check achievements
        if (window.achievementManager) {
            const newAchievements = window.achievementManager.checkAchievements(gameData);
            if (newAchievements.length > 0) {
                showAchievementNotification(newAchievements);
            }
        }
        
        // Check daily challenges
        if (window.dailyChallengesManager) {
            const rewards = window.dailyChallengesManager.checkChallengeProgress(gameData);
            if (rewards > 0) {
                showChallengeReward(rewards);
            }
        }
    }
    
    // Handle campaign mode progression
    if (gameState.isCampaignMode && gameState.currentCampaignLevel && window.campaignManager) {
        const allCompleted = window.campaignManager.completeLevel(gameState.currentCampaignLevel);
        
        if (allCompleted) {
            // All campaign levels completed - show celebration
            setTimeout(() => {
                showCampaignCompleteScreen();
            }, 2000);
            return;
        } else {
            // Level completed, show next level prompt
            setTimeout(() => {
                showCampaignLevelComplete();
            }, 2000);
            return;
        }
    }
    
    // Clear save state on successful completion
    gameState.clearSaveState();
    
    // Show success screen with celebration
    showScreen('successScreen');
    
    // Play celebration sound
    playSound('success');
    
    // Add celebration animation
    setTimeout(() => {
        const celebration = document.querySelector('.success-celebration');
        if (celebration) {
            celebration.classList.add('animate');
        }
    }, 100);
}

// Custom Confirmation Modal
let modalConfirmCallback = null;
let modalCancelCallback = null;

function showCustomConfirm(title, message, onConfirm, onCancel) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const messageEl = document.getElementById('confirmModalMessage');
    const okBtn = document.getElementById('confirmModalOk');
    const cancelBtn = document.getElementById('confirmModalCancel');
    
    if (!modal) return false;
    
    titleEl.textContent = title || 'CONFIRMATION';
    messageEl.textContent = message || 'Are you sure?';
    
    // Store callbacks
    modalConfirmCallback = onConfirm;
    modalCancelCallback = onCancel;
    
    modal.style.display = 'flex';
    
    return true;
}

// Campaign Level Complete
function showCampaignLevelComplete() {
    const progress = window.campaignManager ? window.campaignManager.getProgress() : null;
    let nextLevel = null;
    
    if (gameState.currentCampaignLevel === 'level1') {
        nextLevel = 'Mission 2: Corporate Espionage';
    } else if (gameState.currentCampaignLevel === 'level2') {
        nextLevel = 'Mission 3: Government Files';
    }
    
    if (nextLevel) {
        showCustomConfirm(
            'MISSION COMPLETE',
            `Mission completed! Next mission "${nextLevel}" is now unlocked. Continue to next mission?`,
            () => {
                // Continue to next level
                gameState.isCampaignMode = true;
                if (gameState.currentCampaignLevel === 'level1') {
                    gameState.currentCampaignLevel = 'level2';
                    gameState.selectedDifficulty = 'medium';
                    gameState.passwordLength = 6;
                    gameState.timeRemaining = 45;
                    gameState.maxAttempts = 5;
                } else if (gameState.currentCampaignLevel === 'level2') {
                    gameState.currentCampaignLevel = 'level3';
                    gameState.selectedDifficulty = 'hard';
                    gameState.passwordLength = 8;
                    gameState.timeRemaining = 30;
                    gameState.maxAttempts = 3;
                }
                gameState.reset();
                initializeGame();
                showScreen('bruteForceGame');
                playSound('select');
            },
            () => {
                // Return to campaign screen
                gameState.isCampaignMode = false;
                gameState.currentCampaignLevel = null;
                updateCampaignDisplay();
                showScreen('campaignScreen');
                playSound('select');
            }
        );
    } else {
        // Should not happen, but fallback
        gameState.isCampaignMode = false;
        gameState.currentCampaignLevel = null;
        updateCampaignDisplay();
        showScreen('campaignScreen');
    }
}

// Campaign Complete Celebration
function showCampaignCompleteScreen() {
    // Create celebration screen
    const celebration = document.createElement('div');
    celebration.className = 'screen campaign-complete';
    celebration.innerHTML = `
        <div class="container">
            <div class="campaign-complete-content">
                <div class="celebration-icon">🎉</div>
                <h2>CAMPAIGN COMPLETE!</h2>
                <p class="celebration-message">Congratulations! You've completed all missions!</p>
                <p class="celebration-submessage">You are now a master hacker!</p>
                <div class="celebration-stats">
                    <p>All 3 missions completed successfully!</p>
                </div>
                <button class="btn btn-primary" id="campaignCompleteBtn">RETURN TO MENU</button>
            </div>
        </div>
    `;
    document.body.appendChild(celebration);
    
    // Play celebration sound multiple times
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            playSound('success');
        }, i * 500);
    }
    
    showScreen('campaignComplete');
    
    // Add event listener
    setTimeout(() => {
        const btn = document.getElementById('campaignCompleteBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                gameState.isCampaignMode = false;
                gameState.currentCampaignLevel = null;
                celebration.remove();
                updateCampaignDisplay();
                showScreen('mainMenu');
                playSound('select');
            });
        }
    }, 100);
}

// Helper Functions for New Features

// Enhanced Statistics Display with Charts, Timeline, and Streaks
function updateStatisticsDisplay() {
    if (!window.statisticsManager) return;
    const stats = window.statisticsManager.getStats();
    
    // Calculate win rate
    const winRate = stats.totalGames > 0 ? ((stats.gamesWon / stats.totalGames) * 100).toFixed(1) : 0;
    
    // Calculate current streak
    const currentStreak = calculateCurrentStreak(stats.playHistory || []);
    const bestStreak = calculateBestStreak(stats.playHistory || []);
    
    // Update basic stats
    const totalGamesEl = document.getElementById('totalGamesPlayed');
    const gamesWonEl = document.getElementById('gamesWon');
    const winRateEl = document.getElementById('winRate');
    const totalScoreEl = document.getElementById('totalScore');
    const bestScoreEl = document.getElementById('bestScore');
    const bestTimeEl = document.getElementById('bestTime');
    const averageScoreEl = document.getElementById('averageScore');
    const totalPlayTimeEl = document.getElementById('totalPlayTime');
    
    if (totalGamesEl) totalGamesEl.textContent = stats.totalGames || 0;
    if (gamesWonEl) gamesWonEl.textContent = stats.gamesWon || 0;
    if (winRateEl) winRateEl.textContent = winRate + '%';
    if (totalScoreEl) totalScoreEl.textContent = (stats.totalScore || 0).toLocaleString();
    if (bestScoreEl) bestScoreEl.textContent = (stats.bestScore || 0).toLocaleString();
    if (bestTimeEl) bestTimeEl.textContent = stats.bestTime ? stats.bestTime + 's' : '--';
    if (averageScoreEl) averageScoreEl.textContent = (stats.averageScore || 0).toLocaleString();
    if (totalPlayTimeEl) totalPlayTimeEl.textContent = Math.round((stats.totalTimePlayed || 0) / 60) + 'm';
    
    // Add streak display
    const statsDashboard = document.querySelector('.stats-dashboard');
    if (statsDashboard && !document.getElementById('currentStreak')) {
        const streakCard = document.createElement('div');
        streakCard.className = 'stat-card';
        streakCard.id = 'streakCard';
        streakCard.innerHTML = `
            <h3>Current Streak</h3>
            <p id="currentStreak" class="stat-value">0</p>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">Best: <span id="bestStreak">0</span></p>
        `;
        statsDashboard.appendChild(streakCard);
    }
    if (document.getElementById('currentStreak')) {
        document.getElementById('currentStreak').textContent = currentStreak;
        document.getElementById('bestStreak').textContent = bestStreak;
    }
    
    // Enhanced Difficulty stats with visual bars
    const diffStatsEl = document.getElementById('difficultyStats');
    if (diffStatsEl) {
        diffStatsEl.innerHTML = '';
        ['easy', 'medium', 'hard'].forEach(diff => {
            const stat = stats.difficultyStats[diff];
            const winRate = stat.played > 0 ? ((stat.won / stat.played) * 100).toFixed(1) : 0;
            const div = document.createElement('div');
            div.className = 'difficulty-stat-item';
            div.style.cssText = 'margin-bottom: 1rem; padding: 1rem; background: var(--bg-card); border-radius: 8px;';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong style="color: var(--primary-color);">${diff.toUpperCase()}</strong>
                    <span>Win Rate: ${winRate}%</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <div>Played: <strong>${stat.played}</strong></div>
                    <div>Won: <strong>${stat.won}</strong></div>
                    <div>Best: <strong>${stat.bestScore}</strong></div>
                </div>
                <div style="background: var(--bg-dark); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: var(--primary-color); height: 100%; width: ${winRate}%; transition: width 0.5s ease;"></div>
                </div>
            `;
            diffStatsEl.appendChild(div);
        });
    }
    
    // Enhanced Device stats with visual bars
    const deviceStatsEl = document.getElementById('deviceStats');
    if (deviceStatsEl) {
        deviceStatsEl.innerHTML = '';
        ['laptop', 'mobile'].forEach(device => {
            const stat = stats.deviceStats[device];
            const winRate = stat.played > 0 ? ((stat.won / stat.played) * 100).toFixed(1) : 0;
            const div = document.createElement('div');
            div.className = 'device-stat-item';
            div.style.cssText = 'margin-bottom: 1rem; padding: 1rem; background: var(--bg-card); border-radius: 8px;';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong style="color: var(--primary-color);">${device.toUpperCase()}</strong>
                    <span>Win Rate: ${winRate}%</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <div>Played: <strong>${stat.played}</strong></div>
                    <div>Won: <strong>${stat.won}</strong></div>
                </div>
                <div style="background: var(--bg-dark); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: var(--primary-color); height: 100%; width: ${winRate}%; transition: width 0.5s ease;"></div>
                </div>
            `;
            deviceStatsEl.appendChild(div);
        });
    }
    
    // Add play history timeline
    addPlayHistoryTimeline(stats.playHistory || []);
}

// Calculate current win streak
function calculateCurrentStreak(playHistory) {
    if (!playHistory || playHistory.length === 0) return 0;
    let streak = 0;
    for (let i = 0; i < playHistory.length; i++) {
        if (playHistory[i].won) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

// Calculate best win streak
function calculateBestStreak(playHistory) {
    if (!playHistory || playHistory.length === 0) return 0;
    let bestStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < playHistory.length; i++) {
        if (playHistory[i].won) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }
    return bestStreak;
}

// Add play history timeline
function addPlayHistoryTimeline(playHistory) {
    const statsDetails = document.querySelector('.stats-details');
    if (!statsDetails) return;
    
    // Remove existing timeline if present
    const existingTimeline = document.getElementById('playHistoryTimeline');
    if (existingTimeline) existingTimeline.remove();
    
    if (playHistory.length === 0) return;
    
    const timelineDiv = document.createElement('div');
    timelineDiv.id = 'playHistoryTimeline';
    timelineDiv.style.cssText = 'margin-top: 2rem;';
    
    timelineDiv.innerHTML = `
        <h3 style="margin-bottom: 1rem;">Recent Play History</h3>
        <div style="max-height: 300px; overflow-y: auto; padding-right: 0.5rem;">
            ${playHistory.slice(0, 20).map((game, index) => {
                const date = new Date(game.date);
                return `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--bg-card); border-radius: 8px; margin-bottom: 0.5rem; border-left: 4px solid ${game.won ? 'var(--primary-color)' : 'var(--danger-color)'};">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: ${game.won ? 'var(--primary-color)' : 'var(--text-secondary)'};">
                                ${game.won ? '✅ Won' : '❌ Lost'} - ${game.difficulty.toUpperCase()}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                Score: ${game.score.toLocaleString()} | Time: ${game.timeRemaining}s | ${date.toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    statsDetails.appendChild(timelineDiv);
}

// Settings Display and Controls
function loadSettingsDisplay() {
    if (!window.settingsManager) return;
    const settings = window.settingsManager.settings;
    
    const soundEnabled = document.getElementById('soundEnabled');
    const soundVolume = document.getElementById('soundVolume');
    const soundVolumeValue = document.getElementById('soundVolumeValue');
    const musicEnabled = document.getElementById('musicEnabled');
    const musicVolume = document.getElementById('musicVolume');
    const musicVolumeValue = document.getElementById('musicVolumeValue');
    const defaultDifficulty = document.getElementById('defaultDifficulty');
    const autoSave = document.getElementById('autoSave');
    const showHints = document.getElementById('showHints');
    const theme = document.getElementById('theme');
    const animationsEnabled = document.getElementById('animationsEnabled');
    const highContrast = document.getElementById('highContrast');
    const fontSize = document.getElementById('fontSize');
    const screenReader = document.getElementById('screenReader');
    const colorblindMode = document.getElementById('colorblindMode');
    
    if (soundEnabled) soundEnabled.checked = settings.soundEnabled !== false;
    if (soundVolume) {
        soundVolume.value = settings.soundVolume || 100;
        if (soundVolumeValue) soundVolumeValue.textContent = settings.soundVolume || 100;
    }
    if (musicEnabled) musicEnabled.checked = settings.musicEnabled !== false;
    if (musicVolume) {
        musicVolume.value = settings.musicVolume || 50;
        if (musicVolumeValue) musicVolumeValue.textContent = settings.musicVolume || 50;
    }
    if (defaultDifficulty) defaultDifficulty.value = settings.defaultDifficulty || 'easy';
    if (autoSave) autoSave.checked = settings.autoSave !== false;
    if (showHints) showHints.checked = settings.showHints !== false;
    if (theme) theme.value = settings.theme || 'cyberpunk';
    if (animationsEnabled) animationsEnabled.checked = settings.animationsEnabled !== false;
    if (highContrast) highContrast.checked = settings.highContrast || false;
    if (fontSize) fontSize.value = settings.fontSize || 'medium';
    if (screenReader) screenReader.checked = settings.screenReader || false;
    if (colorblindMode) colorblindMode.checked = settings.colorblindMode || false;
    
    // UI Scale
    const uiScale = document.getElementById('uiScale');
    const uiScaleValue = document.getElementById('uiScaleValue');
    if (uiScale && uiScaleValue) {
        const scale = settings.uiScale || 100;
        uiScale.value = scale;
        uiScaleValue.textContent = scale + '%';
        document.documentElement.style.fontSize = scale + '%';
    }
}

// Keyboard Shortcuts Modal
function showKeyboardShortcutsModal() {
    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(5px);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="custom-modal" style="max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div class="custom-modal-header">
                <h2>⌨️ Keyboard Shortcuts</h2>
            </div>
            <div class="custom-modal-body" style="padding: 2rem;">
                <div style="display: grid; gap: 1.5rem;">
                    <div>
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">Navigation</h4>
                        <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Arrow Keys / WASD</span>
                                <span style="color: var(--text-secondary);">Move / Navigate menus</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Enter / Space</span>
                                <span style="color: var(--text-secondary);">Select / Confirm</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>ESC / Backspace</span>
                                <span style="color: var(--text-secondary);">Go back / Cancel</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">Gameplay</h4>
                        <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Arrow Keys</span>
                                <span style="color: var(--text-secondary);">Move in grid / Sensor</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Enter</span>
                                <span style="color: var(--text-secondary);">Select cell / Check password</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Space</span>
                                <span style="color: var(--text-secondary);">Retrieve files (sensor)</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>P / Pause</span>
                                <span style="color: var(--text-secondary);">Pause game</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">Gamepad</h4>
                        <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>D-Pad / Left Stick</span>
                                <span style="color: var(--text-secondary);">Navigate</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Button A</span>
                                <span style="color: var(--text-secondary);">Select / Confirm</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Button B</span>
                                <span style="color: var(--text-secondary);">Go back</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="custom-modal-buttons">
                <button class="btn btn-primary" id="closeShortcutsModal">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = document.getElementById('closeShortcutsModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
    });
}

function setupSettingsControls() {
    if (!window.settingsManager) return;
    
    // Sound volume
    const soundVolume = document.getElementById('soundVolume');
    const soundVolumeValue = document.getElementById('soundVolumeValue');
    if (soundVolume && soundVolumeValue) {
        soundVolume.addEventListener('input', (e) => {
            const value = e.target.value;
            soundVolumeValue.textContent = value;
            window.settingsManager.updateSetting('soundVolume', parseInt(value));
        });
    }
    
    // Music volume
    const musicVolume = document.getElementById('musicVolume');
    const musicVolumeValue = document.getElementById('musicVolumeValue');
    if (musicVolume && musicVolumeValue) {
        musicVolume.addEventListener('input', (e) => {
            const value = e.target.value;
            musicVolumeValue.textContent = value;
            window.settingsManager.updateSetting('musicVolume', parseInt(value));
        });
    }
    
    // All checkboxes - ensure proper boolean handling
    ['soundEnabled', 'musicEnabled', 'autoSave', 'showHints', 'animationsEnabled', 'screenReader', 'colorblindMode'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                window.settingsManager.updateSetting(id, e.target.checked);
            });
        }
    });
    
    // High contrast - special handling to ensure toggle works
    const highContrastEl = document.getElementById('highContrast');
    if (highContrastEl) {
        highContrastEl.addEventListener('change', (e) => {
            window.settingsManager.updateSetting('highContrast', e.target.checked);
            // Force reapply to ensure theme is restored when high contrast is off
            if (!e.target.checked) {
                window.settingsManager.applySettings();
            }
        });
    }
    
    // Selects
    ['defaultDifficulty', 'fontSize'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                window.settingsManager.updateSetting(id, e.target.value);
            });
        }
    });
    
    // Theme select - special handling
    const themeEl = document.getElementById('theme');
    if (themeEl) {
        themeEl.addEventListener('change', (e) => {
            window.settingsManager.updateSetting('theme', e.target.value);
            // Force theme application
            window.settingsManager.applySettings();
        });
    }
}

// Achievements Display
// Enhanced Achievements Display with Progress Bars, Categories, and Tiers
function updateAchievementsDisplay() {
    if (!window.achievementManager) return;
    const achievements = window.achievementManager.getAchievements();
    const definitions = window.achievementManager.definitions;
    const unlocked = window.achievementManager.getUnlockedCount();
    const points = window.achievementManager.getTotalPoints();
    const stats = window.statisticsManager ? window.statisticsManager.getStats() : null;
    
    document.getElementById('achievementsUnlocked').textContent = unlocked;
    document.getElementById('achievementsTotal').textContent = definitions.length;
    document.getElementById('achievementsPoints').textContent = points;
    
    // Add category filter if not exists
    const achievementsScreen = document.getElementById('achievementsScreen');
    if (achievementsScreen && !document.getElementById('achievementCategoryFilter')) {
        const filterDiv = document.createElement('div');
        filterDiv.id = 'achievementCategoryFilter';
        filterDiv.style.cssText = 'margin-bottom: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;';
        filterDiv.innerHTML = `
            <button class="filter-btn active" data-category="all">ALL</button>
            <button class="filter-btn" data-category="beginner">BEGINNER</button>
            <button class="filter-btn" data-category="speed">SPEED</button>
            <button class="filter-btn" data-category="skill">SKILL</button>
            <button class="filter-btn" data-category="mastery">MASTERY</button>
        `;
        const container = achievementsScreen.querySelector('.container');
        const scrollableContent = achievementsScreen.querySelector('.screen-scrollable-content');
        if (container && scrollableContent) {
            // Insert the filter before the scrollable content
            container.insertBefore(filterDiv, scrollableContent);
        } else {
            // Fallback: try to find grid and insert before its parent
            const grid = document.getElementById('achievementsGrid');
            if (container && grid && grid.parentElement) {
                grid.parentElement.insertBefore(filterDiv, grid);
            }
        }
    }
    
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Tier colors
    const tierColors = {
        'common': '#00ff41',
        'rare': '#00d4ff',
        'epic': '#aa00ff',
        'legendary': '#ffaa00'
    };
    
    definitions.forEach(def => {
        const achievement = achievements.find(a => a.id === def.id);
        const tier = def.tier || 'common';
        const category = def.category || 'other';
        
        // Calculate progress for locked achievements
        let progress = 0;
        let progressText = '';
        if (!achievement && stats) {
            progress = calculateAchievementProgress(def, stats);
            progressText = getProgressText(def, stats, progress);
        }
        
        const div = document.createElement('div');
        div.className = `achievement-item ${achievement ? 'unlocked' : 'locked'}`;
        div.dataset.category = category;
        div.style.cssText = `
            border: 2px solid ${achievement ? tierColors[tier] : 'var(--border-color)'};
            background: ${achievement ? 'rgba(0, 255, 65, 0.1)' : 'var(--bg-card)'};
            opacity: ${achievement ? '1' : '0.7'};
        `;
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem;">
                <div class="achievement-icon" style="font-size: 3rem; filter: ${achievement ? 'none' : 'grayscale(100%)'};">
                    ${def.icon}
                </div>
                <div class="achievement-info" style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                        <h4 style="margin: 0; color: ${achievement ? tierColors[tier] : 'var(--text-secondary)'};">
                            ${def.name}
                        </h4>
                        <span style="padding: 0.25rem 0.5rem; background: ${tierColors[tier]}; color: var(--bg-dark); border-radius: 4px; font-size: 0.7rem; font-weight: bold;">
                            ${tier.toUpperCase()}
                        </span>
                    </div>
                    <p style="margin: 0.5rem 0; color: var(--text-primary);">${def.description}</p>
                    ${!achievement && progressText ? `
                        <div style="margin-top: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                                <span style="color: var(--text-secondary);">${progressText}</span>
                                <span style="color: var(--text-secondary);">${progress}%</span>
                            </div>
                            <div style="background: var(--bg-dark); height: 6px; border-radius: 3px; overflow: hidden;">
                                <div style="background: ${tierColors[tier]}; height: 100%; width: ${progress}%; transition: width 0.5s ease;"></div>
                            </div>
                        </div>
                    ` : ''}
                    <p class="achievement-points" style="margin-top: 0.5rem; color: ${tierColors[tier]}; font-weight: bold;">
                        ${def.points} points
                    </p>
                    ${achievement ? `<p class="achievement-date" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">Unlocked: ${new Date(achievement.unlockedAt).toLocaleDateString()}</p>` : ''}
                </div>
                <div class="achievement-status">
                    ${achievement ? `
                        <span class="unlocked-badge" style="background: ${tierColors[tier]}; color: var(--bg-dark); padding: 0.5rem 1rem; border-radius: 8px; font-weight: bold;">
                            ✓ Unlocked
                        </span>
                    ` : '<span class="locked-badge" style="padding: 0.5rem 1rem; border-radius: 8px; font-weight: bold;">🔒 Locked</span>'}
                </div>
            </div>
        `;
        grid.appendChild(div);
    });
    
    // Add category filter handlers
    if (document.getElementById('achievementCategoryFilter')) {
        document.querySelectorAll('#achievementCategoryFilter .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#achievementCategoryFilter .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.category;
                document.querySelectorAll('.achievement-item').forEach(item => {
                    item.style.display = (category === 'all' || item.dataset.category === category) ? 'block' : 'none';
                });
            });
        });
    }
}

// Calculate achievement progress
function calculateAchievementProgress(def, stats) {
    switch (def.id) {
        case 'hard_mode_warrior':
            return Math.min(100, (stats.difficultyStats.hard.won / 10) * 100);
        case 'century_club':
            return Math.min(100, (stats.totalGames / 100) * 100);
        case 'device_master':
            const devicesWon = (stats.deviceStats.laptop.won > 0 ? 1 : 0) + (stats.deviceStats.mobile.won > 0 ? 1 : 0);
            return (devicesWon / 2) * 100;
        default:
            return 0;
    }
}

// Get progress text
function getProgressText(def, stats, progress) {
    switch (def.id) {
        case 'hard_mode_warrior':
            return `${stats.difficultyStats.hard.won} / 10 hard wins`;
        case 'century_club':
            return `${stats.totalGames} / 100 games played`;
        case 'device_master':
            const devicesWon = (stats.deviceStats.laptop.won > 0 ? 1 : 0) + (stats.deviceStats.mobile.won > 0 ? 1 : 0);
            return `${devicesWon} / 2 device types`;
        default:
            return '';
    }
}

function showAchievementNotification(achievements) {
    achievements.forEach(achievement => {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <span class="achievement-icon-large">${achievement.icon}</span>
                <div>
                    <h3>Achievement Unlocked!</h3>
                    <p>${achievement.name}</p>
                    <p class="achievement-points">+${achievement.points} points</p>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    });
}

// Enhanced Daily Challenges Display with Indicators, Animations, and Streaks
function updateDailyChallengesDisplay() {
    if (!window.dailyChallengesManager) return;
    const challenges = window.dailyChallengesManager.getChallenges();
    const timeRemaining = window.dailyChallengesManager.getTimeRemaining();
    
    document.getElementById('challengeTimeRemaining').textContent = timeRemaining;
    
    // Calculate challenge streak
    const challengeStreak = calculateChallengeStreak();
    
    const list = document.getElementById('challengesList');
    if (list) {
        list.innerHTML = '';
        
        // Add streak indicator
        if (challengeStreak > 0) {
            const streakDiv = document.createElement('div');
            streakDiv.style.cssText = 'background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 2px solid var(--primary-color); text-align: center;';
            streakDiv.innerHTML = `
                <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">🔥 Challenge Streak</h3>
                <p style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${challengeStreak} days</p>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Keep completing challenges to maintain your streak!</p>
            `;
            list.appendChild(streakDiv);
        }
        
        challenges.forEach((challenge, index) => {
            const div = document.createElement('div');
            div.className = `challenge-item ${challenge.completed ? 'completed' : ''}`;
            const progress = Math.min((challenge.progress / challenge.target) * 100, 100);
            
            // Difficulty indicator
            const difficulty = challenge.target > 10 ? 'hard' : challenge.target > 5 ? 'medium' : 'easy';
            const difficultyColors = {
                easy: '#00ff41',
                medium: '#00d4ff',
                hard: '#ff0040'
            };
            
            div.style.cssText = `
                background: var(--bg-card);
                border: 2px solid ${challenge.completed ? 'var(--primary-color)' : 'var(--border-color)'};
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                transition: all 0.3s ease;
                ${challenge.completed ? 'box-shadow: 0 0 20px var(--glow-color);' : ''}
            `;
            
            div.innerHTML = `
                <div class="challenge-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <h4 style="margin: 0; color: ${challenge.completed ? 'var(--primary-color)' : 'var(--text-primary)'};">
                            ${challenge.name}
                        </h4>
                        <span style="padding: 0.25rem 0.5rem; background: ${difficultyColors[difficulty]}; color: var(--bg-dark); border-radius: 4px; font-size: 0.7rem; font-weight: bold;">
                            ${difficulty.toUpperCase()}
                        </span>
                    </div>
                    <span class="challenge-reward" style="background: var(--primary-color); color: var(--bg-dark); padding: 0.5rem 1rem; border-radius: 8px; font-weight: bold;">
                        +${challenge.reward} pts
                    </span>
                </div>
                <p style="margin-bottom: 1rem; color: var(--text-primary);">${challenge.description}</p>
                <div class="challenge-progress" style="margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        <span style="color: var(--text-secondary);">Progress</span>
                        <span style="color: var(--text-secondary); font-weight: bold;">${challenge.progress} / ${challenge.target}</span>
                    </div>
                    <div class="challenge-progress-bar" style="background: var(--bg-dark); height: 12px; border-radius: 6px; overflow: hidden; position: relative;">
                        <div class="challenge-progress-fill" style="background: ${difficultyColors[difficulty]}; height: 100%; width: ${progress}%; transition: width 0.5s ease; box-shadow: 0 0 10px ${difficultyColors[difficulty]};"></div>
                    </div>
                </div>
                ${challenge.completed ? `
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary-color); font-weight: bold; margin-top: 0.5rem;">
                        <span>✅</span>
                        <span>Completed!</span>
                    </div>
                ` : ''}
            `;
            
            // Add completion animation
            if (challenge.completed) {
                setTimeout(() => {
                    if (typeof createParticles === 'function') {
                        const rect = div.getBoundingClientRect();
                        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '#00ff41', 10);
                    }
                }, index * 100);
            }
            
            list.appendChild(div);
        });
    }
}

// Calculate challenge streak
function calculateChallengeStreak() {
    // This would track daily challenge completion streaks
    // For now, return a placeholder
    const streakData = localStorage.getItem('challengeStreak');
    if (streakData) {
        try {
            const data = JSON.parse(streakData);
            const lastDate = new Date(data.lastDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            lastDate.setHours(0, 0, 0, 0);
            
            if (today.getTime() === lastDate.getTime()) {
                return data.streak;
            } else if (today.getTime() - lastDate.getTime() === 86400000) {
                // Consecutive day
                return data.streak + 1;
            }
        } catch (e) {
            return 0;
        }
    }
    return 0;
}

function showChallengeReward(rewards) {
    const notification = document.createElement('div');
    notification.className = 'challenge-reward-notification';
    notification.innerHTML = `
        <div class="challenge-reward-content">
            <h3>Daily Challenge Complete!</h3>
            <p>You earned ${rewards} bonus points!</p>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Tutorial Navigation
let currentTutorialStep = 1;
const totalTutorialSteps = 4;

function navigateTutorial(direction) {
    currentTutorialStep += direction;
    if (currentTutorialStep < 1) currentTutorialStep = 1;
    if (currentTutorialStep > totalTutorialSteps) currentTutorialStep = totalTutorialSteps;
    
    document.querySelectorAll('.tutorial-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentTutorialStep);
    });
    
    document.getElementById('tutorialProgress').textContent = `${currentTutorialStep} / ${totalTutorialSteps}`;
    document.getElementById('tutorialPrev').disabled = currentTutorialStep === 1;
    document.getElementById('tutorialNext').disabled = currentTutorialStep === totalTutorialSteps;
}

// Enhanced Campaign Display with Briefings, Rewards, and Progress
function updateCampaignDisplay() {
    if (!window.campaignManager) return;
    
    const progress = window.campaignManager.getProgress();
    const levels = [
        { 
            id: 1, 
            levelKey: 'level1', 
            name: 'Mission 1: First Breach', 
            difficulty: 'easy', 
            unlocked: progress.level1.unlocked, 
            completed: progress.level1.completed,
            briefing: 'Your first assignment: breach a basic security system. This is a training mission to familiarize you with the tools.',
            reward: '100 bonus points',
            objective: 'Complete the breach in under 60 seconds'
        },
        { 
            id: 2, 
            levelKey: 'level2', 
            name: 'Mission 2: Corporate Espionage', 
            difficulty: 'medium', 
            unlocked: progress.level2.unlocked, 
            completed: progress.level2.completed,
            briefing: 'A corporate target with enhanced security. Decryption will be required to access sensitive files.',
            reward: '250 bonus points + Achievement',
            objective: 'Decrypt all files successfully'
        },
        { 
            id: 3, 
            levelKey: 'level3', 
            name: 'Mission 3: Government Files', 
            difficulty: 'hard', 
            unlocked: progress.level3.unlocked, 
            completed: progress.level3.completed,
            briefing: 'The ultimate challenge: government-level encryption. Only the most skilled hackers can complete this mission.',
            reward: '500 bonus points + Legendary Achievement',
            objective: 'Complete with maximum score'
        }
    ];
    
    // Calculate overall campaign progress
    const completedCount = levels.filter(l => l.completed).length;
    const campaignProgress = (completedCount / levels.length) * 100;
    
    const container = document.getElementById('campaignLevels');
    if (container) {
        // Remove existing progress header if present
        const existingHeader = document.getElementById('campaignProgressHeader');
        if (existingHeader) existingHeader.remove();
        
        // Add campaign progress header
        const progressHeader = document.createElement('div');
        progressHeader.id = 'campaignProgressHeader';
        progressHeader.style.cssText = 'background: var(--bg-card); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 2px solid var(--primary-color);';
        progressHeader.innerHTML = `
            <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Campaign Progress</h3>
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                <div style="flex: 1; background: var(--bg-dark); height: 20px; border-radius: 10px; overflow: hidden;">
                    <div style="background: var(--primary-color); height: 100%; width: ${campaignProgress}%; transition: width 0.5s ease; box-shadow: 0 0 10px var(--glow-color);"></div>
                </div>
                <span style="font-weight: bold; color: var(--primary-color); font-size: 1.2rem;">${campaignProgress.toFixed(0)}%</span>
            </div>
            <p style="color: var(--text-secondary); margin: 0;">${completedCount} of ${levels.length} missions completed</p>
        `;
        container.insertBefore(progressHeader, container.firstChild);
        
        // Clear existing levels
        const existingLevels = container.querySelectorAll('.campaign-level');
        existingLevels.forEach(el => {
            if (el.id !== 'campaignProgressHeader') el.remove();
        });
        
        levels.forEach(level => {
            const div = document.createElement('div');
            div.className = `campaign-level ${level.unlocked ? 'unlocked' : 'locked'} ${level.completed ? 'completed' : ''}`;
            const buttonId = `campaignLevel${level.id}Btn`;
            
            const difficultyColors = {
                easy: '#00ff41',
                medium: '#00d4ff',
                hard: '#ff0040'
            };
            
            div.style.cssText = `
                background: var(--bg-card);
                border: 2px solid ${level.unlocked ? (level.completed ? 'var(--primary-color)' : 'var(--border-color)') : 'var(--border-color)'};
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                ${level.completed ? 'box-shadow: 0 0 20px var(--glow-color);' : ''}
            `;
            
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <h4 style="color: ${level.unlocked ? 'var(--primary-color)' : 'var(--text-secondary)'}; margin-bottom: 0.5rem;">
                            ${level.name}
                        </h4>
                        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                            <span style="padding: 0.25rem 0.5rem; background: ${difficultyColors[level.difficulty]}; color: var(--bg-dark); border-radius: 4px; font-size: 0.75rem; font-weight: bold;">
                                ${level.difficulty.toUpperCase()}
                            </span>
                            ${level.completed ? '<span style="color: var(--primary-color); font-weight: bold;">✓ Completed</span>' : ''}
                        </div>
                    </div>
                </div>
                <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;"><strong>Briefing:</strong></p>
                    <p style="color: var(--text-primary); margin-bottom: 0.5rem;">${level.briefing}</p>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;"><strong>Objective:</strong> ${level.objective}</p>
                    <p style="color: var(--primary-color); font-size: 0.85rem;"><strong>Reward:</strong> ${level.reward}</p>
                </div>
                ${level.unlocked ? `
                    <button class="btn btn-primary" id="${buttonId}" style="width: 100%;">
                        ${level.completed ? '🔄 Replay Mission' : '▶ Start Mission'}
                    </button>
                ` : '<p class="locked-text" style="text-align: center; color: var(--text-secondary); padding: 1rem;">🔒 Locked - Complete previous mission to unlock</p>'}
            `;
            container.appendChild(div);
            
            // Add event listener for start mission button
            if (level.unlocked) {
                setTimeout(() => {
                    const btn = document.getElementById(buttonId);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            // Set campaign mode flag
                            gameState.isCampaignMode = true;
                            gameState.currentCampaignLevel = level.levelKey;
                            gameState.selectedDifficulty = level.difficulty;
                            switch(level.difficulty) {
                                case 'easy':
                                    gameState.passwordLength = 4;
                                    gameState.timeRemaining = 60;
                                    gameState.maxAttempts = 10;
                                    break;
                                case 'medium':
                                    gameState.passwordLength = 6;
                                    gameState.timeRemaining = 45;
                                    gameState.maxAttempts = 5;
                                    break;
                                case 'hard':
                                    gameState.passwordLength = 8;
                                    gameState.timeRemaining = 30;
                                    gameState.maxAttempts = 3;
                                    break;
                            }
                            initializeGame();
                            showScreen('bruteForceGame');
                            playSound('select');
                        });
                    }
                }, 100);
            }
        });
    }
}

// Pause Menu Functions
let isPaused = false;
let pauseTimeRemaining = 0;

function togglePause() {
    if (!gameState.gameStarted || gameState.currentScreen !== 'bruteForceGame') return;
    
    isPaused = !isPaused;
    if (isPaused) {
        pauseTimeRemaining = gameState.timeRemaining;
        stopTimer();
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.style.display = 'flex';
            pauseMenu.classList.add('active');
        }
        playSound('select');
    } else {
        gameState.timeRemaining = pauseTimeRemaining;
        startTimer();
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.style.display = 'none';
            pauseMenu.classList.remove('active');
        }
        showScreen('bruteForceGame');
        playSound('select');
    }
}

function resumeGame() {
    if (isPaused) {
        isPaused = false;
        gameState.timeRemaining = pauseTimeRemaining;
        startTimer();
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.style.display = 'none';
            pauseMenu.classList.remove('active');
        }
        showScreen('bruteForceGame');
        playSound('select');
    }
}

function restartGame() {
    showCustomConfirm(
        'RESTART GAME',
        'Are you sure you want to restart? Progress will be lost.',
        () => {
            isPaused = false;
            gameState.reset();
            gameState.clearSaveState();
            if (gameState.isCampaignMode) {
                // Restart current campaign level
                const level = gameState.currentCampaignLevel;
                if (level === 'level1') {
                    gameState.selectedDifficulty = 'easy';
                    gameState.passwordLength = 4;
                    gameState.timeRemaining = 60;
                    gameState.maxAttempts = 10;
                } else if (level === 'level2') {
                    gameState.selectedDifficulty = 'medium';
                    gameState.passwordLength = 6;
                    gameState.timeRemaining = 45;
                    gameState.maxAttempts = 5;
                } else if (level === 'level3') {
                    gameState.selectedDifficulty = 'hard';
                    gameState.passwordLength = 8;
                    gameState.timeRemaining = 30;
                    gameState.maxAttempts = 3;
                }
                initializeGame();
                showScreen('bruteForceGame');
            } else {
                showScreen('deviceSelection');
            }
            playSound('select');
        },
        () => {
            // Cancel - do nothing
        }
    );
}

function quitToMenu() {
    showCustomConfirm(
        'QUIT TO MENU',
        'Are you sure you want to quit? Progress will be lost.',
        () => {
            isPaused = false;
            gameState.gameStarted = false;
            gameState.reset();
            gameState.isCampaignMode = false;
            gameState.currentCampaignLevel = null;
            gameState.clearSaveState();
            stopTimer();
            if (window.bgMusicNode) {
                try {
                    window.bgMusicNode.oscillator.stop();
                    window.bgMusicNode.lfo.stop();
                } catch(e) {}
                window.bgMusicNode = null;
            }
            // Note: isCampaignMode was already reset above
            showScreen('mainMenu');
            playSound('select');
        },
        () => {
            // Cancel - do nothing
        }
    );
}

// Community Functions
function updateCommunityDisplay() {
    // Placeholder for community stats
    document.getElementById('communityTotalPlayers').textContent = '1,234';
    document.getElementById('communityGamesToday').textContent = '567';
}

function shareScore() {
    const stats = window.statisticsManager ? window.statisticsManager.getStats() : null;
    const difficulty = gameState.selectedDifficulty ? gameState.selectedDifficulty.toUpperCase() : 'N/A';
    const timeRemaining = gameState.timeRemaining || 0;
    
    const text = `🎮 Ethical Hacker - Cybersecurity Training Game\n\n` +
                 `🏆 Score: ${gameState.score} points\n` +
                 `📊 Difficulty: ${difficulty}\n` +
                 `⏱️ Time Remaining: ${timeRemaining}s\n` +
                 `🔒 Can you beat my score?\n\n` +
                 `Play now: ${window.location.href}`;
    
    // Enhanced sharing with multiple options
    if (navigator.share) {
        navigator.share({
            title: 'Ethical Hacker - My Score',
            text: text,
            url: window.location.href
        }).then(() => {
                showToast('✅ Score shared!', 'success');
            })
            .catch(() => {
                // User cancelled or error
            });
    } else {
        // Create share menu
        showShareMenu(text);
    }
}

function showShareMenu(text) {
    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu-overlay';
    shareMenu.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(5px);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    shareMenu.innerHTML = `
        <div class="share-menu" style="background: var(--bg-card); border: 3px solid var(--primary-color); border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
            <h3 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">Share Your Score</h3>
            <div class="share-buttons" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                <button class="btn btn-primary" id="shareTwitter" style="background: #1DA1F2; border-color: #1DA1F2;">
                    🐦 Twitter
                </button>
                <button class="btn btn-primary" id="shareFacebook" style="background: #1877F2; border-color: #1877F2;">
                    📘 Facebook
                </button>
                <button class="btn btn-primary" id="shareWhatsApp" style="background: #25D366; border-color: #25D366;">
                    💬 WhatsApp
                </button>
                <button class="btn btn-primary" id="shareCopy" style="background: var(--primary-color);">
                    📋 Copy Link
                </button>
            </div>
            <button class="btn btn-secondary" id="closeShareMenu" style="width: 100%;">Close</button>
        </div>
    `;
    
    document.body.appendChild(shareMenu);
    
    // Share handlers
    const shareTwitter = document.getElementById('shareTwitter');
    const shareFacebook = document.getElementById('shareFacebook');
    const shareWhatsApp = document.getElementById('shareWhatsApp');
    const shareCopy = document.getElementById('shareCopy');
    const closeShareMenu = document.getElementById('closeShareMenu');
    
    const closeMenu = () => {
        shareMenu.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => shareMenu.remove(), 300);
    };
    
    if (shareTwitter) {
        shareTwitter.addEventListener('click', () => {
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
            closeMenu();
            showToast('Opening Twitter...', 'info');
        });
    }
    
    if (shareFacebook) {
        shareFacebook.addEventListener('click', () => {
            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
            closeMenu();
            showToast('Opening Facebook...', 'info');
        });
    }
    
    if (shareWhatsApp) {
        shareWhatsApp.addEventListener('click', () => {
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
            closeMenu();
            showToast('Opening WhatsApp...', 'info');
        });
    }
    
    if (shareCopy) {
        shareCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                showToast('✅ Score copied to clipboard!', 'success');
                closeMenu();
            }).catch(() => {
                showToast('❌ Failed to copy', 'error');
            });
        });
    }
    
    if (closeShareMenu) {
        closeShareMenu.addEventListener('click', closeMenu);
    }
    
    // Close on overlay click
    shareMenu.addEventListener('click', (e) => {
        if (e.target === shareMenu) closeMenu();
    });
}

// Auto-save game state periodically
setInterval(() => {
    if (gameState.gameStarted && window.settingsManager && window.settingsManager.getSetting('autoSave')) {
        gameState.saveGameState();
    }
}, 30000); // Save every 30 seconds

// Name Input Modal
function showNameInputModal() {
    const modal = document.getElementById('nameInputModal');
    const input = document.getElementById('playerNameInput');
    if (modal && input) {
        modal.classList.add('active');
        input.value = '';
        setTimeout(() => input.focus(), 100);
    }
}

function hideNameInputModal() {
    const modal = document.getElementById('nameInputModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function savePlayerScore() {
    const input = document.getElementById('playerNameInput');
    if (!input) return;
    
    // Validate and sanitize input
    const rawName = input.value;
    const sanitized = sanitizeInput(rawName, 20);
    if (!validateInput(sanitized, 'name')) {
        input.classList.add('error-shake');
        input.placeholder = 'Invalid name (alphanumeric only, 1-20 chars)';
        setTimeout(() => {
            input.classList.remove('error-shake');
            input.placeholder = 'Your Name';
        }, 2000);
        return;
    }
    
    const playerName = sanitized || 'Anonymous';
    
    if (window.leaderboardAPI) {
        window.leaderboardAPI.saveScore(
            playerName,
            gameState.score,
            gameState.selectedDifficulty,
            gameState.selectedDevice,
            gameState.timeRemaining
        ).then(() => {
            hideNameInputModal();
            if (typeof loadLeaderboard === 'function') {
                loadLeaderboard();
            }
            showScreen('leaderboardScreen');
            playSound('success');
        }).catch(error => {
            logError('Failed to save score:', error);
            hideNameInputModal();
            showScreen('leaderboardScreen');
            playSound('success');
        });
    } else {
        hideNameInputModal();
        showScreen('leaderboardScreen');
    }
}

// Sound System
let soundEnabled = true;

function playSound(soundName) {
    if (!soundEnabled) return;
    
    // Use sound generator if available
    if (window.soundGenerator) {
        switch(soundName) {
            case 'select':
                window.soundGenerator.select();
                break;
            case 'success':
                window.soundGenerator.success();
                break;
            case 'error':
                window.soundGenerator.error();
                break;
            case 'typing':
                window.soundGenerator.typing();
                break;
        }
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundIcon = document.getElementById('soundIcon');
    if (soundIcon) {
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    }
    
    // Save preference
    localStorage.setItem('soundEnabled', soundEnabled);
    
    // Stop background music if muting
    if (!soundEnabled && window.bgMusicNode) {
        try {
            window.bgMusicNode.oscillator.stop();
            window.bgMusicNode.lfo.stop();
        } catch(e) {}
        window.bgMusicNode = null;
    } else if (soundEnabled && gameState.gameStarted && !window.bgMusicNode) {
        // Restart music if enabling
        if (window.soundGenerator) {
            window.bgMusicNode = window.soundGenerator.startBackgroundMusic();
        }
    }
}

// Load sound preference
function loadSoundPreference() {
    const saved = localStorage.getItem('soundEnabled');
    if (saved !== null) {
        soundEnabled = saved === 'true';
        const soundIcon = document.getElementById('soundIcon');
        if (soundIcon) {
            soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        }
    }
}

// Decryption error message
function showDecryptionError(message) {
    const errorDiv = document.getElementById('decryptionError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 3000);
    }
}

// Mobile touch support - swipe gestures
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchStartElement = null;
let isSwipe = false;

function handleSwipe() {
    // Only handle swipe if it started on the grid area (not on a cell)
    if (touchStartElement && touchStartElement.classList.contains('grid-cell')) {
        return; // Let cell touch handler deal with it
    }
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50; // Minimum distance for swipe
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            isSwipe = true;
            if (deltaX > 0) {
                // Swipe right
                if (gameState.currentScreen === 'bruteForceGame' && gameState.selectedCell.col < gameState.gridSize - 1) {
                    gameState.selectedCell.col++;
                    updateSelectedCell();
                    playSound('select');
                }
            } else {
                // Swipe left
                if (gameState.currentScreen === 'bruteForceGame' && gameState.selectedCell.col > 0) {
                    gameState.selectedCell.col--;
                    updateSelectedCell();
                    playSound('select');
                }
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            isSwipe = true;
            if (deltaY > 0) {
                // Swipe down
                if (gameState.currentScreen === 'bruteForceGame' && gameState.selectedCell.row < gameState.gridSize - 1) {
                    gameState.selectedCell.row++;
                    updateSelectedCell();
                    playSound('select');
                }
            } else {
                // Swipe up
                if (gameState.currentScreen === 'bruteForceGame' && gameState.selectedCell.row > 0) {
                    gameState.selectedCell.row--;
                    updateSelectedCell();
                    playSound('select');
                }
            }
        }
    }
}

// Setup swipe handlers after grid is created
let swipeHandlersSetup = false;
function setupSwipeHandlers() {
    const gridContainer = document.getElementById('crosswordGrid');
    if (gridContainer && gameState.currentScreen === 'bruteForceGame' && !swipeHandlersSetup) {
        swipeHandlersSetup = true;
        
        gridContainer.addEventListener('touchstart', (e) => {
            // Only track if not on a cell
            if (!e.target.classList.contains('grid-cell')) {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                touchStartElement = e.target;
                isSwipe = false;
            }
        }, { passive: true });

        gridContainer.addEventListener('touchend', (e) => {
            // Only handle swipe if it didn't start on a cell
            if (touchStartElement && !touchStartElement.classList.contains('grid-cell')) {
                const touch = e.changedTouches[0];
                touchEndX = touch.clientX;
                touchEndY = touch.clientY;
                handleSwipe();
            }
        }, { passive: true });
    }
}

// Loading screen function
function showLoadingScreen() {
    log('showLoadingScreen called');
    
    // Ensure ALL screens are hidden first
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    // Show loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        log('Loading screen found, showing it');
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.add('active');
        gameState.currentScreen = 'loadingScreen';
        
        // After delay, hide loading and show welcome screen
        setTimeout(() => {
            log('Loading screen timeout fired, transitioning...');
            if (loadingScreen) {
                loadingScreen.classList.remove('active');
                loadingScreen.style.display = 'none';
            }
            // Show welcome screen
            const welcomeScreen = document.getElementById('welcomeScreen');
            if (welcomeScreen) {
                log('Welcome screen found, showing it');
                welcomeScreen.style.display = 'flex';
                welcomeScreen.classList.add('active');
                gameState.currentScreen = 'welcomeScreen';
            } else {
                log('Welcome screen not found, going to main menu');
                // Fallback to main menu if welcome screen doesn't exist
                showScreen('mainMenu');
            }
        }, 1000); // Reduced to 1 second for faster transition
    } else {
        log('Loading screen not found, going to welcome/main menu');
        // If loading screen doesn't exist, go straight to welcome or main menu
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            showScreen('welcomeScreen');
        } else {
            showScreen('mainMenu');
        }
    }
}

// Menu Navigation - wrapped in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    log('DOMContentLoaded fired');
    
    // Setup custom confirmation modal
    const modal = document.getElementById('confirmModal');
    const okBtn = document.getElementById('confirmModalOk');
    const cancelBtn = document.getElementById('confirmModalCancel');
    
    if (okBtn) {
        okBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
            if (modalConfirmCallback) {
                modalConfirmCallback();
                modalConfirmCallback = null;
            }
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
            if (modalCancelCallback) {
                modalCancelCallback();
                modalCancelCallback = null;
            }
        });
    }
    
    // Close on overlay click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                if (modalCancelCallback) {
                    modalCancelCallback();
                    modalCancelCallback = null;
                }
            }
        });
    }
    
    // Load passcodes from storage
    loadPasscodesFromStorage();
    
    // Device Selection - Auto-select based on device
    document.querySelectorAll('.device-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.device-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            gameState.selectedDevice = card.dataset.device;
            playSound('select');
            setTimeout(() => {
                showScreen('difficultySelection');
            }, 300);
        });
    });
    
    // Auto-select device on page load
    const detectedDevice = detectDeviceType();
    gameState.selectedDevice = detectedDevice;
    
    // Highlight the detected device card
    const deviceCard = document.querySelector(`[data-device="${detectedDevice}"]`);
    if (deviceCard) {
        deviceCard.classList.add('selected');
    }
    
    // Difficulty Selection
    document.querySelectorAll('.difficulty-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            gameState.selectedDifficulty = card.dataset.difficulty;
            playSound('select');
            
            // Ensure campaign mode is off for regular difficulty selection
            gameState.isCampaignMode = false;
            gameState.currentCampaignLevel = null;
            
            // Set difficulty parameters
            switch(gameState.selectedDifficulty) {
                case 'easy':
                    gameState.passwordLength = 4;
                    gameState.timeRemaining = 60;
                    gameState.maxAttempts = 10;
                    break;
                case 'medium':
                    gameState.passwordLength = 6;
                    gameState.timeRemaining = 45;
                    gameState.maxAttempts = 5;
                    break;
                case 'hard':
                    gameState.passwordLength = 8;
                    gameState.timeRemaining = 30;
                    gameState.maxAttempts = 3;
                    break;
            }
            
            setTimeout(() => {
                initializeGame();
                showScreen('bruteForceGame');
            }, 300);
        });
    });
    
    // Show loading screen first
    showLoadingScreen();
    
    // Load sound preference
    loadSoundPreference();
    
    // Welcome screen continue button
    const welcomeContinueBtn = document.getElementById('welcomeContinueBtn');
    if (welcomeContinueBtn) {
        welcomeContinueBtn.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    // Initialize menu navigation
    const mainMenuButtons = document.querySelectorAll('#mainMenu .menu-buttons .btn');
    if (mainMenuButtons.length > 0) {
        menuButtons = Array.from(mainMenuButtons);
        currentMenuIndex = 0;
        updateMenuSelection();
        
        // Update menu selection when mouse hovers over buttons
        menuButtons.forEach((btn, index) => {
            btn.addEventListener('mouseenter', () => {
                currentMenuIndex = index;
                updateMenuSelection();
            });
        });
    }
    
    const startBtn = document.getElementById('startBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const tutorialBtn = document.getElementById('tutorialBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const backToMenu = document.getElementById('backToMenu');
    const backToDevice = document.getElementById('backToDevice');
    const backFromLeaderboard = document.getElementById('backFromLeaderboard');
    const backFromTutorial = document.getElementById('backFromTutorial');
    const backFromAbout = document.getElementById('backFromAbout');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const mainMenuBtn = document.getElementById('mainMenuBtn');
    const saveScoreBtn = document.getElementById('saveScoreBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Ensure campaign mode is off for regular start game
            gameState.isCampaignMode = false;
            gameState.currentCampaignLevel = null;
            showScreen('deviceSelection');
            playSound('select');
        });
    }
    
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            if (typeof loadLeaderboard === 'function') {
                loadLeaderboard();
            }
            showScreen('leaderboardScreen');
            playSound('select');
        });
    }
    
    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', () => {
            setupTutorialTabs();
            showScreen('tutorialScreen');
            playSound('select');
        });
    }
    
    // Tutorial tab switching
    function setupTutorialTabs() {
        document.querySelectorAll('[data-tutorial]').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tutorial;
                document.querySelectorAll('[data-tutorial]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('.tutorial-tab-content').forEach(c => c.classList.remove('active'));
                const content = document.getElementById(`tutorial-${tabName}`);
                if (content) content.classList.add('active');
                playSound('select');
            });
        });
    }
    
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            showScreen('aboutScreen');
            playSound('select');
        });
    }
    
    // Creator mode button
    const creatorModeBtn = document.getElementById('creatorModeBtn');
    if (creatorModeBtn) {
        creatorModeBtn.addEventListener('click', () => {
            showScreen('creatorAccess');
            playSound('select');
            setTimeout(() => {
                const pinInput = document.getElementById('creatorPin');
                if (pinInput) pinInput.focus();
            }, 100);
        });
    }
    
    // Creator access handlers
    const submitCreatorPin = document.getElementById('submitCreatorPin');
    const cancelCreatorAccess = document.getElementById('cancelCreatorAccess');
    const creatorPinInput = document.getElementById('creatorPin');
    const exitCreatorMode = document.getElementById('exitCreatorMode');
    
    if (submitCreatorPin) {
        submitCreatorPin.addEventListener('click', () => {
            const pin = creatorPinInput ? creatorPinInput.value : '';
            if (pin === '200518') {
                showCreatorMode();
                playSound('success');
                if (creatorPinInput) creatorPinInput.value = '';
            } else {
                playSound('error');
                if (creatorPinInput) {
                    creatorPinInput.value = '';
                    creatorPinInput.placeholder = 'Incorrect PIN! Try again...';
                    setTimeout(() => {
                        if (creatorPinInput) creatorPinInput.placeholder = 'Enter PIN';
                    }, 2000);
                }
            }
        });
    }
    
    if (cancelCreatorAccess) {
        cancelCreatorAccess.addEventListener('click', () => {
            showScreen('mainMenu');
            if (creatorPinInput) creatorPinInput.value = '';
            playSound('select');
        });
    }
    
    if (creatorPinInput) {
        creatorPinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitCreatorPin.click();
            }
        });
        
        // Only allow numbers and update pin dots
        creatorPinInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            updatePinDots(e.target.value.length);
        });
        
        // Update dots on focus
        creatorPinInput.addEventListener('focus', () => {
            updatePinDots(creatorPinInput.value.length);
        });
    }
    
    // Function to update PIN dots
    function updatePinDots(length) {
        const pinDots = document.querySelectorAll('.pin-dot');
        pinDots.forEach((dot, index) => {
            if (index < length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }
    
    if (exitCreatorMode) {
        exitCreatorMode.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    // Creator Mode Tab Switching - Enhanced with proper display handling
    function setupCreatorTabs() {
        const tabs = document.querySelectorAll('.creator-tab');
        if (tabs.length === 0) {
            log('No creator tabs found, will retry...');
            setTimeout(setupCreatorTabs, 100);
            return;
        }
        
        tabs.forEach(tab => {
            // Remove any existing listeners by cloning
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            
            newTab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const tabName = newTab.dataset.tab;
                log(`Creator tab clicked: ${tabName}`);
                
                // Update active tab
                document.querySelectorAll('.creator-tab').forEach(t => t.classList.remove('active'));
                newTab.classList.add('active');
                
                // Hide all tab contents
                document.querySelectorAll('.creator-tab-content').forEach(c => {
                    c.classList.remove('active');
                    c.style.display = 'none';
                });
                
                // Show selected tab content
                const content = document.getElementById(`tab-${tabName}`);
                if (content) {
                    content.classList.add('active');
                    content.style.display = 'flex';
                    
                    // Update content when switching tabs
                    if (tabName === 'statistics') {
                        updateCreatorStatistics();
                    } else if (tabName === 'leaderboard') {
                        updateCreatorLeaderboard();
                    } else if (tabName === 'achievements') {
                        updateCreatorAchievements();
                    } else if (tabName === 'debug') {
                        updateSystemInfo();
                    } else if (tabName === 'passcodes') {
                        updateCreatorDashboard();
                    }
                    
                    playSound('select');
                } else {
                    logError(`Tab content not found: tab-${tabName}`);
                    showToast(`Tab content not found: ${tabName}`, 'error');
                }
            });
            
            // Also add mousedown for better responsiveness
            newTab.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
        });
        
        log(`Creator tabs setup complete. Found ${tabs.length} tabs.`);
    }
    
    // Setup creator tabs
    setupCreatorTabs();
    
    // Also setup when creator mode is shown
    const originalShowCreatorMode = window.showCreatorMode;
    if (typeof originalShowCreatorMode === 'function') {
        window.showCreatorMode = function() {
            originalShowCreatorMode();
            setTimeout(setupCreatorTabs, 50);
        };
    }
    
    // Data Management Buttons
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            const success = exportGameData();
            if (success) {
                showToast('✅ Data exported successfully!', 'success');
                playSound('success');
            } else {
                showToast('❌ Failed to export data', 'error');
                playSound('error');
            }
        });
    }
    
    const importDataBtn = document.getElementById('importDataBtn');
    const importDataInput = document.getElementById('importDataInput');
    if (importDataBtn && importDataInput) {
        importDataBtn.addEventListener('click', () => {
            importDataInput.click();
        });
        
        importDataInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                showCustomConfirm(
                    'IMPORT DATA',
                    'This will overwrite your current game data. Continue?',
                    () => {
                        importGameData(file).then(() => {
                            showToast('✅ Data imported successfully! Page will reload.', 'success');
                            setTimeout(() => window.location.reload(), 1500);
                        }).catch(error => {
                            showToast('❌ Failed to import data: ' + error.message, 'error');
                            playSound('error');
                        });
                    },
                    () => {}
                );
            }
        });
    }
    
    // Selective Reset Buttons
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', () => {
            showCustomConfirm('Reset Statistics', 'Reset all statistics?', () => {
                resetStatistics();
                updateCreatorStatistics();
                showToast('Statistics reset!', 'success');
                playSound('success');
            }, () => {});
        });
    }
    
    const resetAchievementsBtn = document.getElementById('resetAchievementsBtn');
    if (resetAchievementsBtn) {
        resetAchievementsBtn.addEventListener('click', () => {
            showCustomConfirm('Reset Achievements', 'Reset all achievements?', () => {
                resetAchievements();
                updateCreatorAchievements();
                showToast('Achievements reset!', 'success');
                playSound('success');
            }, () => {});
        });
    }
    
    const resetCampaignBtn = document.getElementById('resetCampaignBtn');
    if (resetCampaignBtn) {
        resetCampaignBtn.addEventListener('click', () => {
            showCustomConfirm('Reset Campaign', 'Reset campaign progress?', () => {
                resetCampaign();
                showToast('Campaign reset!', 'success');
                playSound('success');
            }, () => {});
        });
    }
    
    const resetLeaderboardBtn = document.getElementById('resetLeaderboardBtn');
    if (resetLeaderboardBtn) {
        resetLeaderboardBtn.addEventListener('click', () => {
            showCustomConfirm('Reset Leaderboard', 'Reset all leaderboard scores?', () => {
                resetLeaderboard();
                updateCreatorLeaderboard();
                showToast('Leaderboard reset!', 'success');
                playSound('success');
            }, () => {});
        });
    }
    
    const resetChallengesBtn = document.getElementById('resetChallengesBtn');
    if (resetChallengesBtn) {
        resetChallengesBtn.addEventListener('click', () => {
            showCustomConfirm('Reset Challenges', 'Reset daily challenges?', () => {
                resetChallenges();
                showToast('Challenges reset!', 'success');
                playSound('success');
            }, () => {});
        });
    }
    
    // Wipe All Data Button
    const wipeAllDataBtn = document.getElementById('wipeAllDataBtn');
    if (wipeAllDataBtn) {
        wipeAllDataBtn.addEventListener('click', () => {
            showCustomConfirm(
                '⚠️ WIPE ALL GAME DATA',
                'Are you absolutely sure you want to DELETE ALL game data?\n\nThis will permanently remove:\n\n• All statistics and play history\n• All unlocked achievements\n• Campaign progress (all missions reset)\n• Daily challenges progress\n• Leaderboard scores\n• Game settings (reset to defaults)\n• Saved game states\n• Creator mode passcodes\n\n⚠️ THIS ACTION CANNOT BE UNDONE! ⚠️',
                () => {
                    const success = resetAllGameData();
                    if (success) {
                        updateCreatorDashboard();
                        showToast('✅ All game data has been wiped! Page will reload.', 'success');
                        setTimeout(() => window.location.reload(), 2000);
                        playSound('success');
                    } else {
                        showToast('❌ Failed to reset some data', 'error');
                        playSound('error');
                    }
                },
                () => {
                    playSound('select');
                }
            );
        });
    }
    
    // Test Mode Buttons
    const testEasyBtn = document.getElementById('testEasyBtn');
    const testMediumBtn = document.getElementById('testMediumBtn');
    const testHardBtn = document.getElementById('testHardBtn');
    
    [testEasyBtn, testMediumBtn, testHardBtn].forEach((btn, index) => {
        if (btn) {
            const difficulties = ['easy', 'medium', 'hard'];
            btn.addEventListener('click', () => {
                gameState.selectedDifficulty = difficulties[index];
                gameState.selectedDevice = 'laptop';
                gameState.isCampaignMode = false;
                gameState.currentCampaignLevel = null;
                
                switch(difficulties[index]) {
                    case 'easy':
                        gameState.passwordLength = 4;
                        gameState.timeRemaining = 60;
                        gameState.maxAttempts = 10;
                        break;
                    case 'medium':
                        gameState.passwordLength = 6;
                        gameState.timeRemaining = 45;
                        gameState.maxAttempts = 5;
                        break;
                    case 'hard':
                        gameState.passwordLength = 8;
                        gameState.timeRemaining = 30;
                        gameState.maxAttempts = 3;
                        break;
                }
                
                initializeGame();
                showScreen('bruteForceGame');
                playSound('select');
            });
        }
    });
    
    // Toggle Debug Mode
    const toggleDebugBtn = document.getElementById('toggleDebugBtn');
    if (toggleDebugBtn) {
        toggleDebugBtn.addEventListener('click', () => {
            showToast('Debug mode toggle requires code change. Set DEBUG = true in game.js for debug mode.', 'info');
        });
    }
    
    if (backToMenu) {
        backToMenu.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    if (backToDevice) {
        backToDevice.addEventListener('click', () => {
            showScreen('deviceSelection');
            playSound('select');
        });
    }
    
    if (backFromLeaderboard) {
        backFromLeaderboard.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    if (backFromTutorial) {
        backFromTutorial.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    if (backFromAbout) {
        backFromAbout.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            showScreen('deviceSelection');
            playSound('select');
        });
    }
    
    if (mainMenuBtn) {
        mainMenuBtn.addEventListener('click', () => {
            gameState.gameStarted = false;
            if (window.bgMusicNode) {
                try {
                    window.bgMusicNode.oscillator.stop();
                    window.bgMusicNode.lfo.stop();
                } catch(e) {}
                window.bgMusicNode = null;
            }
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    if (saveScoreBtn) {
        saveScoreBtn.addEventListener('click', () => {
            showNameInputModal();
            playSound('select');
        });
    }
    
    // Name input modal handlers
    const saveNameBtn = document.getElementById('saveNameBtn');
    const cancelNameBtn = document.getElementById('cancelNameBtn');
    const playerNameInput = document.getElementById('playerNameInput');
    
    if (saveNameBtn) {
        saveNameBtn.addEventListener('click', () => {
            savePlayerScore();
        });
    }
    
    if (cancelNameBtn) {
        cancelNameBtn.addEventListener('click', () => {
            hideNameInputModal();
            playSound('select');
        });
    }
    
    if (playerNameInput) {
        // Add input validation on input
        playerNameInput.addEventListener('input', (e) => {
            e.target.value = sanitizeInput(e.target.value, 20);
        });
        
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                savePlayerScore();
            } else if (e.key === 'Escape') {
                hideNameInputModal();
            }
        });
    }
    
    // Add input validation for decryption key
    const decryptionKeyInput = document.getElementById('decryptionKey');
    if (decryptionKeyInput) {
        decryptionKeyInput.addEventListener('input', (e) => {
            e.target.value = sanitizeInput(e.target.value, 16);
        });
    }
    
    // Hint notification buttons
    const requestHintBtn = document.getElementById('requestHintBtn');
    const dismissHintBtn = document.getElementById('dismissHintBtn');
    
    if (requestHintBtn) {
        requestHintBtn.addEventListener('click', () => {
            requestHint();
        });
    }
    
    if (dismissHintBtn) {
        dismissHintBtn.addEventListener('click', () => {
            hideHintNotification();
            playSound('select');
        });
    }
    
    // Sound toggle button
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            toggleSound();
            playSound('select');
        });
    }
    
    // Time-up screen buttons
    const retryAfterTimeUp = document.getElementById('retryAfterTimeUp');
    const mainMenuFromTimeUp = document.getElementById('mainMenuFromTimeUp');
    
    if (retryAfterTimeUp) {
        retryAfterTimeUp.addEventListener('click', () => {
            showScreen('deviceSelection');
            playSound('select');
        });
    }
    
    if (mainMenuFromTimeUp) {
        mainMenuFromTimeUp.addEventListener('click', () => {
            gameState.gameStarted = false;
            if (window.bgMusicNode) {
                try {
                    window.bgMusicNode.oscillator.stop();
                    window.bgMusicNode.lfo.stop();
                } catch(e) {}
                window.bgMusicNode = null;
            }
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    // New feature event handlers
    // Statistics Screen
    const statisticsBtn = document.getElementById('statisticsBtn');
    const backFromStats = document.getElementById('backFromStats');
    if (statisticsBtn) {
        statisticsBtn.addEventListener('click', () => {
            updateStatisticsDisplay();
            showScreen('statisticsScreen');
            playSound('select');
        });
    }
    if (backFromStats) {
        backFromStats.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    // Settings Screen
    const settingsBtn = document.getElementById('settingsBtn');
    const backFromSettings = document.getElementById('backFromSettings');
    const resetSettingsBtn = document.getElementById('resetSettings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            loadSettingsDisplay();
            showScreen('settingsScreen');
            playSound('select');
        });
    }
    if (backFromSettings) {
        backFromSettings.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            showCustomConfirm(
                'RESET SETTINGS',
                'Reset all settings to defaults?',
                () => {
                    if (window.settingsManager) {
                        window.settingsManager.resetSettings();
                        loadSettingsDisplay();
                        playSound('select');
                    }
                },
                () => {
                    // Cancel - do nothing
                }
            );
        });
    }
    
    // Settings controls
    setupSettingsControls();
    
    // Achievements Screen
    const achievementsBtn = document.getElementById('achievementsBtn');
    const backFromAchievements = document.getElementById('backFromAchievements');
    if (achievementsBtn) {
        // Add multiple event listeners to ensure button works
        achievementsBtn.onclick = () => {
            updateAchievementsDisplay();
            showScreen('achievementsScreen');
            playSound('select');
        };
        achievementsBtn.addEventListener('click', () => {
            updateAchievementsDisplay();
            showScreen('achievementsScreen');
            playSound('select');
        });
        achievementsBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            updateAchievementsDisplay();
            showScreen('achievementsScreen');
            playSound('select');
        });
        log('Achievements button listeners attached');
    } else {
        logWarn('Achievements button not found');
    }
    if (backFromAchievements) {
        backFromAchievements.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    // Daily Challenges Screen
    const dailyChallengesBtn = document.getElementById('dailyChallengesBtn');
    const backFromChallenges = document.getElementById('backFromChallenges');
    if (dailyChallengesBtn) {
        dailyChallengesBtn.addEventListener('click', () => {
            updateDailyChallengesDisplay();
            showScreen('dailyChallengesScreen');
            playSound('select');
        });
    }
    if (backFromChallenges) {
        backFromChallenges.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    // Tutorial Screen (Interactive)
    const tutorialPrevBtn = document.getElementById('tutorialPrev');
    const tutorialNextBtn = document.getElementById('tutorialNext');
    if (tutorialPrevBtn) {
        tutorialPrevBtn.addEventListener('click', () => {
            navigateTutorial(-1);
            playSound('select');
        });
    }
    if (tutorialNextBtn) {
        tutorialNextBtn.addEventListener('click', () => {
            navigateTutorial(1);
            playSound('select');
        });
    }
    
    // Campaign Screen
    const campaignBtn = document.getElementById('campaignBtn');
    const backFromCampaign = document.getElementById('backFromCampaign');
    if (campaignBtn) {
        campaignBtn.addEventListener('click', () => {
            updateCampaignDisplay();
            showScreen('campaignScreen');
            playSound('select');
        });
    }
    if (backFromCampaign) {
        backFromCampaign.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    // Multiplayer Screen
    const multiplayerBtn = document.getElementById('multiplayerBtn');
    const backFromMultiplayer = document.getElementById('backFromMultiplayer');
    if (multiplayerBtn) {
        multiplayerBtn.addEventListener('click', () => {
            showScreen('multiplayerScreen');
            playSound('select');
        });
    }
    if (backFromMultiplayer) {
        backFromMultiplayer.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    // Tournament Screen (accessed via community or direct URL)
    const backFromTournament = document.getElementById('backFromTournament');
    if (backFromTournament) {
        backFromTournament.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    
    // Community Screen
    const communityBtn = document.getElementById('communityBtn');
    const backFromCommunity = document.getElementById('backFromCommunity');
    const shareScoreBtn = document.getElementById('shareScoreBtn');
    if (communityBtn) {
        communityBtn.addEventListener('click', () => {
            updateCommunityDisplay();
            showScreen('communityScreen');
            playSound('select');
        });
    }
    if (backFromCommunity) {
        backFromCommunity.addEventListener('click', () => {
            showScreen('mainMenu');
            playSound('select');
        });
    }
    if (shareScoreBtn) {
        shareScoreBtn.addEventListener('click', () => {
            shareScore();
            playSound('select');
        });
    }
    
    // Check for saved game state on load
    if (window.settingsManager && window.settingsManager.getSetting('autoSave')) {
        const hasSave = gameState.loadGameState();
        if (hasSave) {
            showCustomConfirm(
                'CONTINUE GAME',
                'Continue saved game?',
                () => {
                    // Restore game state
                    showScreen(gameState.currentScreen);
                },
                () => {
                    // Clear save and start fresh
                    gameState.clearSaveState();
                }
            );
        }
    }
    
    // Pause menu buttons
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const restartBtn = document.getElementById('restartBtn');
    const quitToMenuBtn = document.getElementById('quitToMenuBtn');
    const backFromGame = document.getElementById('backFromGame');
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            togglePause();
        });
    }
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            resumeGame();
        });
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            restartGame();
        });
    }
    
    if (quitToMenuBtn) {
        quitToMenuBtn.addEventListener('click', () => {
            quitToMenu();
        });
    }
    
    if (backFromGame) {
        backFromGame.addEventListener('click', () => {
            showCustomConfirm(
                'RETURN TO MENU',
                'Return to menu? Progress will be saved.',
                () => {
                    gameState.saveGameState();
                    if (gameState.isCampaignMode) {
                        gameState.isCampaignMode = false;
                        gameState.currentCampaignLevel = null;
                        updateCampaignDisplay();
                        showScreen('campaignScreen');
                    } else {
                        showScreen('mainMenu');
                    }
                    playSound('select');
                },
                () => {
                    // Cancel - do nothing
                }
            );
        });
    }
    
    // Multiplayer handlers removed - using new "coming soon" message instead
});

