// Gamepad API Integration
class GamepadManager {
    constructor() {
        this.gamepads = [];
        this.connected = false;
        this.lastButtons = [];
        this.lastAxes = [0, 0]; // Store actual axis values, not booleans
        this.lastMoveTime = 0;
        this.pollInterval = null;
        this.axisStates = [false, false]; // Track current axis direction
        this.init();
    }

    init() {
        window.addEventListener('gamepadconnected', (e) => {
            this.handleConnect(e.gamepad);
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            this.handleDisconnect(e.gamepad);
        });

        // Check for already connected gamepads
        this.checkGamepads();
    }

    checkGamepads() {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.handleConnect(gamepads[i]);
            }
        }
    }

    handleConnect(gamepad) {
        console.log('Gamepad connected:', gamepad.id);
        this.gamepads.push(gamepad);
        this.connected = true;
        this.updateIndicator(true);
        this.startPolling();
    }

    handleDisconnect(gamepad) {
        console.log('Gamepad disconnected:', gamepad.id);
        this.gamepads = this.gamepads.filter(gp => gp.index !== gamepad.index);
        if (this.gamepads.length === 0) {
            this.connected = false;
            this.updateIndicator(false);
            this.stopPolling();
        }
    }

    updateIndicator(connected) {
        const indicator = document.getElementById('gamepadIndicator');
        if (indicator) {
            if (connected) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }
    }

    startPolling() {
        if (this.pollInterval) return;
        
        this.pollInterval = setInterval(() => {
            this.poll();
        }, 16); // ~60fps
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    poll() {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad && this.gamepads.find(gp => gp.index === gamepad.index)) {
                this.handleInput(gamepad);
            }
        }
    }

    handleInput(gamepad) {
        // Handle D-Pad and buttons
        const buttons = gamepad.buttons;
        const axes = gamepad.axes;

        // D-Pad (buttons 12-15 or axes 0-1)
        // Axes: [0] = left/right, [1] = up/down
        const deadZone = 0.3; // Reduced deadzone for better sensitivity
        const now = Date.now();
        
        let moved = false;
        
        // Get current screen state (check if gameState exists)
        const currentScreen = (typeof gameState !== 'undefined' && gameState.currentScreen) ? gameState.currentScreen : '';
        const isInGame = currentScreen === 'bruteForceGame' || currentScreen === 'fileRetrieval';
        
        // Check Left Stick (axes) - only for in-game movement
        if (isInGame) {
            const currAxis0 = axes[0] || 0;
            const currAxis1 = axes[1] || 0;
            
            // Horizontal movement (left/right) - Left Stick
            if (Math.abs(currAxis0) > deadZone) {
                // Check cooldown only for axis movement
                if (!this.lastMoveTime || (now - this.lastMoveTime >= 100)) { // 100ms cooldown for axes
                    if (currAxis0 < -deadZone) {
                        // Moving left
                        if (!this.axisStates[0] || this.axisStates[0] !== 'left') {
                            this.axisStates[0] = 'left';
                            this.triggerKey('ArrowLeft');
                            moved = true;
                        }
                    } else if (currAxis0 > deadZone) {
                        // Moving right
                        if (!this.axisStates[0] || this.axisStates[0] !== 'right') {
                            this.axisStates[0] = 'right';
                            this.triggerKey('ArrowRight');
                            moved = true;
                        }
                    }
                }
            } else {
                // In deadzone - reset state
                this.axisStates[0] = false;
            }
            
            // Vertical movement (up/down) - Left Stick
            if (Math.abs(currAxis1) > deadZone) {
                // Check cooldown only for axis movement
                if (!this.lastMoveTime || (now - this.lastMoveTime >= 100)) { // 100ms cooldown for axes
                    if (currAxis1 < -deadZone) {
                        // Moving up
                        if (!this.axisStates[1] || this.axisStates[1] !== 'up') {
                            this.axisStates[1] = 'up';
                            this.triggerKey('ArrowUp');
                            moved = true;
                        }
                    } else if (currAxis1 > deadZone) {
                        // Moving down
                        if (!this.axisStates[1] || this.axisStates[1] !== 'down') {
                            this.axisStates[1] = 'down';
                            this.triggerKey('ArrowDown');
                            moved = true;
                        }
                    }
                }
            } else {
                // In deadzone - reset state
                this.axisStates[1] = false;
            }
            
            // Update stored axis values
            this.lastAxes = [currAxis0, currAxis1];
        } else {
            // For menus, use D-pad and left stick for navigation
            const currAxis0 = axes[0] || 0;
            const currAxis1 = axes[1] || 0;
            
            // Menu navigation with left stick (vertical only for menus)
            if (Math.abs(currAxis1) > deadZone) {
                if (!this.lastMoveTime || (now - this.lastMoveTime >= 200)) { // Slower for menu navigation
                    if (currAxis1 < -deadZone) {
                        // Moving up in menu
                        if (!this.axisStates[1] || this.axisStates[1] !== 'up') {
                            this.axisStates[1] = 'up';
                            this.triggerKey('ArrowUp');
                            moved = true;
                        }
                    } else if (currAxis1 > deadZone) {
                        // Moving down in menu
                        if (!this.axisStates[1] || this.axisStates[1] !== 'down') {
                            this.axisStates[1] = 'down';
                            this.triggerKey('ArrowDown');
                            moved = true;
                        }
                    }
                }
            } else {
                this.axisStates[1] = false;
            }
            
            // Horizontal for device/difficulty selection
            if (currentScreen === 'deviceSelection' || currentScreen === 'difficultySelection') {
                if (Math.abs(currAxis0) > deadZone) {
                    if (!this.lastMoveTime || (now - this.lastMoveTime >= 200)) {
                        if (currAxis0 < -deadZone) {
                            if (!this.axisStates[0] || this.axisStates[0] !== 'left') {
                                this.axisStates[0] = 'left';
                                this.triggerKey('ArrowLeft');
                                moved = true;
                            }
                        } else if (currAxis0 > deadZone) {
                            if (!this.axisStates[0] || this.axisStates[0] !== 'right') {
                                this.axisStates[0] = 'right';
                                this.triggerKey('ArrowRight');
                                moved = true;
                            }
                        }
                    }
                } else {
                    this.axisStates[0] = false;
                }
            }
        }

        // D-Pad buttons - check multiple possible indices
        // Standard: buttons 12-15, but some controllers use different mappings
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i] && buttons[i].pressed && !this.lastButtons[i]) {
                // D-pad buttons (12-15)
                if (i >= 12 && i <= 15) {
                    // Check cooldown for D-pad
                    if (!this.lastMoveTime || (now - this.lastMoveTime >= 150)) {
                        if (i === 12) {
                            this.triggerKey('ArrowUp');
                            moved = true;
                        } else if (i === 13) {
                            this.triggerKey('ArrowDown');
                            moved = true;
                        } else if (i === 14) {
                            this.triggerKey('ArrowLeft');
                            moved = true;
                        } else if (i === 15) {
                            this.triggerKey('ArrowRight');
                            moved = true;
                        }
                        this.lastButtons[i] = true;
                    }
                }
            } else if (!buttons[i] || !buttons[i].pressed) {
                this.lastButtons[i] = false;
            }
        }

        // Action buttons (A/X button - usually button 0) - Enter key
        if (buttons[0] && buttons[0].pressed && !this.lastButtons[0]) {
            // Check if we're on welcome screen and handle directly
            const welcomeScreen = document.getElementById('welcomeScreen');
            const isWelcomeActive = welcomeScreen && welcomeScreen.classList.contains('active') && 
                                    window.getComputedStyle(welcomeScreen).display !== 'none';
            
            // Check if we're on main menu and handle directly
            const mainMenuEl = document.getElementById('mainMenu');
            const isMainMenuActive = mainMenuEl && mainMenuEl.classList.contains('active') && 
                                    window.getComputedStyle(mainMenuEl).display !== 'none';
            
            if (isWelcomeActive) {
                console.log('🎮 Gamepad A button pressed on welcome screen!');
                const welcomeBtn = document.getElementById('welcomeContinueBtn');
                if (welcomeBtn) {
                    welcomeBtn.click();
                }
            } else if (isMainMenuActive) {
                console.log('🎮 Gamepad A button pressed on main menu!');
                // Trigger Enter key which will call selectMenuButton
                this.triggerKey('Enter');
            } else {
                this.triggerKey('Enter');
            }
            this.lastButtons[0] = true;
        } else if (!buttons[0] || !buttons[0].pressed) {
            this.lastButtons[0] = false;
        }
        
        // B button (usually button 1) - Escape/Back
        if (buttons[1] && buttons[1].pressed && !this.lastButtons[1]) {
            this.triggerKey('Escape');
            this.lastButtons[1] = true;
        } else if (!buttons[1] || !buttons[1].pressed) {
            this.lastButtons[1] = false;
        }
        
        if (moved) {
            this.lastMoveTime = now;
        }
    }

    triggerKey(key) {
        // Normalize key name
        const keyName = key.startsWith('Arrow') ? key : (key === 'arrowup' ? 'ArrowUp' : 
                                                          key === 'arrowdown' ? 'ArrowDown' :
                                                          key === 'arrowleft' ? 'ArrowLeft' :
                                                          key === 'arrowright' ? 'ArrowRight' : key);
        
        // Update the keys object directly
        if (typeof window.keys !== 'undefined') {
            const keyLower = keyName.toLowerCase();
            window.keys[keyLower] = true;
        }
        
        // Create keyboard event for compatibility
        const keyEvent = new KeyboardEvent('keydown', {
            key: keyName,
            code: this.getKeyCode(keyName),
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(keyEvent);
        
        // Auto-release after short delay to prevent key sticking
        setTimeout(() => {
            if (window.keys) {
                const keyLower = keyName.toLowerCase();
                window.keys[keyLower] = false;
                // Also trigger keyup
                const keyUpEvent = new KeyboardEvent('keyup', {
                    key: keyName,
                    code: this.getKeyCode(keyName),
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(keyUpEvent);
            }
        }, 100);
    }

    getKeyCode(key) {
        const keyMap = {
            'arrowup': 'ArrowUp',
            'ArrowUp': 'ArrowUp',
            'arrowdown': 'ArrowDown',
            'ArrowDown': 'ArrowDown',
            'arrowleft': 'ArrowLeft',
            'ArrowLeft': 'ArrowLeft',
            'arrowright': 'ArrowRight',
            'ArrowRight': 'ArrowRight',
            'Enter': 'Enter',
            'Escape': 'Escape'
        };
        return keyMap[key] || key;
    }

    isConnected() {
        return this.connected && this.gamepads.length > 0;
    }
}

// Initialize gamepad manager
const gamepadManager = new GamepadManager();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.gamepadManager = gamepadManager;
}

