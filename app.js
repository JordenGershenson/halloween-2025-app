// Pirate Scavenger Hunt App
// Main application logic

// Configuration will be loaded from config.json
let config = null;
const STORAGE_KEY = 'pirateHuntProgress';

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initializePage();
});

// Load configuration from server
async function loadConfig() {
    try {
        config = await fetchConfig();
        if (config) {
            console.log('Config loaded from server:', config);
            return;
        }
    } catch (error) {
        console.error('Error loading config from server:', error);
    }

    // Fallback config for testing
    config = {
        title: "Pirate's Treasure Hunt Test",
        totalClues: 5,
        hintUnlockTimes: [0, 120, 300],
        clues: {
                "1234": {
                    title: "The Captain's Quarters",
                    story: "Ye've found the first clue in the Captain's private chambers! The old sea dog left a message...",
                    hint: "Seek where the cold treasures be kept, where rum and grub stay fresh..."
                },
                "5678": {
                    title: "The Galley",
                    story: "Brilliant! Ye've discovered the secret of the ship's galley. The cook knew more than how to make hardtack...",
                    hint: "Look where the crew rests their weary heads after a long day at sea..."
                },
                "9012": {
                    title: "The Crew's Quarters",
                    story: "Aye! The crew's bunks hold secrets too. One of them scrawled a message on the wall...",
                    hint: "Navigate to where we watch for storms and spot distant lands..."
                },
                "3456": {
                    title: "The Crow's Nest",
                    story: "Shiver me timbers! From up high, ye can see everything. But did ye notice what's carved into the wood?",
                    hint: "Descend to where our precious cargo be stored in the belly of the ship..."
                },
                "7890": {
                    title: "The Cargo Hold",
                    story: "Congratulations! Ye've found the final clue hidden among the barrels and crates!",
                    hint: "Ye've found all the clues! Return to the start to claim yer treasure!"
                }
            },
            errorMessages: [
                "Arrr! That code be wrong, matey!",
                "Shiver me timbers! Try again, ye scallywag!",
                "Yo ho ho! That ain't the right code!",
                "Blimey! That code won't open any treasure!",
                "Walk the plank! That's not it, buccaneer!"
            ]
        };
    }

// Initialize the appropriate page
function initializePage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    if (page === 'clue.html' || page === 'clue') {
        initializeCluePage();
    } else if (page === 'complete.html' || page === 'complete') {
        initializeCompletionPage();
    } else if (page === 'leaderboard.html' || page === 'leaderboard') {
        initializeLeaderboardPage();
    } else {
        initializeHomePage();
    }

    updateProgress();
}

// Home Page (index.html) Logic
function initializeHomePage() {
    const codeInput = document.getElementById('code-input');
    const submitBtn = document.getElementById('submit-btn');
    const errorMessage = document.getElementById('error-message');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');

    if (!codeInput || !submitBtn) return;

    // Check if player has provided their name
    const progress = getProgress();
    if (!progress.playerName) {
        showPlayerNamePrompt();
    } else {
        showPlayerGreeting(progress.playerName);
    }

    // Handle code submission
    submitBtn.addEventListener('click', () => handleCodeSubmit(codeInput, errorMessage));

    // Allow Enter key to submit
    codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCodeSubmit(codeInput, errorMessage);
        }
    });

    // Allow letters and numbers only
    codeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    });

    // View quests button - commented out but backend functionality preserved
    // const viewQuestsBtn = document.getElementById('view-quests-btn');
    // if (viewQuestsBtn) {
    //     viewQuestsBtn.addEventListener('click', () => {
    //         window.location.href = 'quests.html';
    //     });
    // }

    // View rules button
    const viewRulesBtn = document.getElementById('view-rules-btn');
    if (viewRulesBtn) {
        viewRulesBtn.addEventListener('click', () => {
            showGameRules();
        });
    }

    // View quest rules button
    const viewQuestRulesBtn = document.getElementById('view-quest-rules-btn');
    if (viewQuestRulesBtn) {
        viewQuestRulesBtn.addEventListener('click', () => {
            showQuestRules();
        });
    }

    // View leaderboard button
    if (viewLeaderboardBtn) {
        viewLeaderboardBtn.addEventListener('click', () => {
            window.location.href = 'leaderboard.html';
        });
    }

    // Render unlocked clues
    renderUnlockedClues();

    // Auto-focus on input (only if name already provided)
    if (progress.playerName) {
        codeInput.focus();
    }
}

// Show player name prompt
function showPlayerNamePrompt() {
    const overlay = document.getElementById('player-name-overlay');
    const playerNameInput = document.getElementById('player-name-input');
    const startHuntBtn = document.getElementById('start-hunt-btn');

    if (!overlay || !playerNameInput || !startHuntBtn) return;

    overlay.classList.remove('hidden');

    // Handle name submission
    const submitName = () => {
        const name = playerNameInput.value.trim();
        if (name.length > 0) {
            savePlayerName(name);
            overlay.classList.add('hidden');
            showPlayerGreeting(name);

            // Focus on code input
            const codeInput = document.getElementById('code-input');
            if (codeInput) codeInput.focus();
        } else {
            playerNameInput.style.borderColor = 'red';
            setTimeout(() => {
                playerNameInput.style.borderColor = '';
            }, 1000);
        }
    };

    startHuntBtn.addEventListener('click', submitName);

    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitName();
        }
    });

    // Focus on name input
    setTimeout(() => playerNameInput.focus(), 300);
}

// Save player name to progress
function savePlayerName(name) {
    const progress = getProgress();
    progress.playerName = name;
    progress.nameEnteredTime = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Show player greeting
function showPlayerGreeting(name) {
    const greetingDiv = document.getElementById('player-greeting');
    const nameDisplay = document.getElementById('player-name-display');

    if (greetingDiv && nameDisplay) {
        nameDisplay.textContent = name;
        greetingDiv.classList.remove('hidden');
    }
}

// Show game rules modal
async function showGameRules() {
    const overlay = document.getElementById('game-rules-overlay');
    const contentDiv = document.getElementById('game-rules-content');
    const closeBtn = document.getElementById('close-rules-btn');

    if (!overlay || !contentDiv) return;

    // Load rules from markdown file
    try {
        const response = await fetch('game-rules.md');
        if (response.ok) {
            const markdown = await response.text();
            contentDiv.innerHTML = parseMarkdown(markdown);
        } else {
            contentDiv.innerHTML = '<p>Rules file not found. Please contact the game master.</p>';
        }
    } catch (error) {
        console.error('Error loading game rules:', error);
        contentDiv.innerHTML = '<p>Error loading rules. Please contact the game master.</p>';
    }

    overlay.classList.remove('hidden');

    if (closeBtn) {
        closeBtn.onclick = () => {
            overlay.classList.add('hidden');
        };
    }
}

// Show quest rules modal
async function showQuestRules() {
    const overlay = document.getElementById('quest-rules-overlay');
    const contentDiv = document.getElementById('quest-rules-content');
    const closeBtn = document.getElementById('close-quest-rules-btn');

    if (!overlay || !contentDiv) return;

    // Load rules from markdown file
    try {
        const response = await fetch('quest-rules.md');
        if (response.ok) {
            const markdown = await response.text();
            contentDiv.innerHTML = parseMarkdown(markdown);
        } else {
            contentDiv.innerHTML = '<p>Quest rules file not found. Please contact the game master.</p>';
        }
    } catch (error) {
        console.error('Error loading quest rules:', error);
        contentDiv.innerHTML = '<p>Error loading quest rules. Please contact the game master.</p>';
    }

    overlay.classList.remove('hidden');

    if (closeBtn) {
        closeBtn.onclick = () => {
            overlay.classList.add('hidden');
        };
    }
}

// Improved markdown parser with nested list support
function parseMarkdown(markdown) {
    const lines = markdown.split('\n');
    let html = '';
    let inList = false;
    let listStack = []; // Track nesting levels
    let inParagraph = false;
    let inCodeBlock = false;
    let codeBlockContent = '';

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Code blocks
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                // End code block
                html += '<pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; overflow-x: auto; margin: 10px 0;"><code>' + codeBlockContent + '</code></pre>';
                codeBlockContent = '';
                inCodeBlock = false;
            } else {
                // Start code block
                if (inParagraph) {
                    html += '</p>';
                    inParagraph = false;
                }
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent += line + '\n';
            continue;
        }

        // Headers
        if (line.startsWith('### ')) {
            if (inParagraph) { html += '</p>'; inParagraph = false; }
            closeAllLists();
            html += '<h3 style="color: var(--pirate-gold); margin-top: 20px; margin-bottom: 10px;">' + processInline(line.substring(4)) + '</h3>';
            continue;
        }
        if (line.startsWith('## ')) {
            if (inParagraph) { html += '</p>'; inParagraph = false; }
            closeAllLists();
            html += '<h2 style="color: var(--pirate-gold); margin-top: 20px; margin-bottom: 10px;">' + processInline(line.substring(3)) + '</h2>';
            continue;
        }
        if (line.startsWith('# ')) {
            if (inParagraph) { html += '</p>'; inParagraph = false; }
            closeAllLists();
            html += '<h1 style="color: var(--pirate-gold); margin-top: 20px; margin-bottom: 10px;">' + processInline(line.substring(2)) + '</h1>';
            continue;
        }

        // List items (with indentation support)
        const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
        if (listMatch) {
            if (inParagraph) { html += '</p>'; inParagraph = false; }

            const indent = listMatch[1].length;
            const content = listMatch[3];

            // Determine nesting level (every 2 spaces = 1 level)
            const level = Math.floor(indent / 2);

            // Adjust list stack to match current level
            while (listStack.length > level + 1) {
                html += '</ul>';
                listStack.pop();
            }

            if (listStack.length === level) {
                html += '<ul style="margin-left: 20px; margin-top: 5px; margin-bottom: 5px;">';
                listStack.push(level);
            }

            html += '<li style="margin: 3px 0;">' + processInline(content) + '</li>';
            inList = true;
            continue;
        }

        // Close lists if we're no longer in one
        if (inList && line.trim() !== '') {
            closeAllLists();
        }

        // Empty lines
        if (line.trim() === '') {
            if (inParagraph) {
                html += '</p>';
                inParagraph = false;
            }
            closeAllLists();
            continue;
        }

        // Regular paragraphs
        if (!inParagraph && line.trim() !== '') {
            html += '<p style="margin: 10px 0; line-height: 1.6;">';
            inParagraph = true;
        }

        html += processInline(line) + ' ';
    }

    // Close any open tags
    if (inParagraph) html += '</p>';
    closeAllLists();

    return html;

    function closeAllLists() {
        while (listStack.length > 0) {
            html += '</ul>';
            listStack.pop();
        }
        inList = false;
    }

    function processInline(text) {
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic (but not if surrounded by bold markers)
        text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
        text = text.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: var(--pirate-gold);">$1</a>');

        // Inline code
        text = text.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.3); padding: 2px 5px; border-radius: 3px;">$1</code>');

        return text;
    }
}

// Render unlocked clues on home page
function renderUnlockedClues() {
    const progress = getProgress();
    const unlockedSection = document.getElementById('unlocked-clues-section');
    const unlockedList = document.getElementById('unlocked-clues-list');

    if (!unlockedSection || !unlockedList) return;

    // Icons for each clue (in order)
    const clueIcons = ['⚓', '🍖', '🛏️', '🔭', '📦'];

    if (progress.foundCodes.length === 0) {
        unlockedSection.classList.add('hidden');
        return;
    }

    unlockedSection.classList.remove('hidden');
    unlockedList.innerHTML = '';

    // Render each unlocked clue
    progress.foundCodes.forEach((code, index) => {
        const clue = config.clues[code];
        if (!clue) return;

        const card = document.createElement('div');
        card.className = 'unlocked-clue-card';

        // Check if this clue has been completed
        const isCompleted = progress.completedCodes && progress.completedCodes.includes(code);

        // Add green border and glow for completed clues
        if (isCompleted) {
            card.style.border = '3px solid #4CAF50';
            card.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.3)';
        }

        // Use icon based on index, or default anchor
        let icon = clueIcons[index] || '🗝️';

        // Show checkmark if completed
        if (isCompleted) {
            icon = '✅';
        }

        // Build completion badge HTML
        const completionBadge = isCompleted ?
            `<div style="background: rgba(76, 175, 80, 0.2); padding: 5px 10px; border-radius: 5px; margin-top: 5px; color: #4CAF50; font-weight: bold; font-size: 0.85em;">
                ✅ Completed
            </div>` : '';

        card.innerHTML = `
            <div class="unlocked-clue-icon">${icon}</div>
            <div class="unlocked-clue-title">${clue.title}</div>
            <div class="unlocked-clue-code">Code: ${code}</div>
            ${completionBadge}
        `;

        // Handle click to navigate to clue
        card.addEventListener('click', () => {
            navigateToClue(code);
        });

        unlockedList.appendChild(card);
    });
}

// Handle code submission
function handleCodeSubmit(input, errorDiv) {
    const code = input.value.trim().toUpperCase();

    if (code.length !== 4) {
        showError(errorDiv, "Enter a 4-character code, ye landlubber!");
        return;
    }

    if (config.clues[code]) {
        // Valid code! Save progress and navigate
        saveClueProgress(code);
        navigateToClue(code);
    } else {
        // Invalid code
        const randomError = config.errorMessages[Math.floor(Math.random() * config.errorMessages.length)];
        showError(errorDiv, randomError);
        input.value = '';
        input.focus();
    }
}

// Show error message
function showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');

    // Hide after 3 seconds
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 3000);
}

// Save clue progress to localStorage and server
async function saveClueProgress(code) {
    const progress = getProgress();

    if (!progress.foundCodes.includes(code)) {
        progress.foundCodes.push(code);
        progress.lastFoundCode = code;
        progress.lastFoundTime = new Date().toISOString();

        // Set start time if this is the first clue
        if (progress.foundCodes.length === 1) {
            progress.startTime = new Date().toISOString();
        }

        // Check if all clues found
        if (progress.foundCodes.length === config.totalClues) {
            progress.completionTime = new Date().toISOString();
            progress.completed = true;
        }

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

        // Sync to server
        if (progress.playerName) {
            await registerOrUpdatePlayer({
                name: progress.playerName,
                foundCodes: progress.foundCodes,
                startTime: progress.startTime,
                completionTime: progress.completionTime,
                completed: progress.completed
            });
        }
    }
}

// Get current progress
function getProgress() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        foundCodes: [],
        completedCodes: [],
        lastFoundCode: null,
        lastFoundTime: null,
        startTime: null,
        completionTime: null,
        completed: false
    };
}

// Reset progress (start new hunt)
function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
    updateProgress();
}

// Update progress display
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (!progressFill || !progressText) return;

    const progress = getProgress();
    const found = progress.foundCodes.length;
    const total = config.totalClues;
    const percentage = (found / total) * 100;

    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${found} of ${total}`;
}

// Navigate to clue page
function navigateToClue(code) {
    // Store the code in sessionStorage so clue.html knows which clue to display
    sessionStorage.setItem('currentClue', code);
    window.location.href = 'clue.html';
}

// Clue Page Logic
let hintUpdateInterval = null;

function initializeCluePage() {
    const currentCode = sessionStorage.getItem('currentClue');

    if (!currentCode || !config.clues[currentCode]) {
        // No valid clue, redirect to home
        window.location.href = 'index.html';
        return;
    }

    const clue = config.clues[currentCode];
    const clueContent = document.getElementById('clue-content');

    // Display clue content
    clueContent.innerHTML = `
        <h2>${clue.title}</h2>
        <p>${clue.story}</p>
    `;

    // Store the timestamp when this clue was viewed
    const clueViewKey = `clueViewed_${currentCode}`;
    if (!sessionStorage.getItem(clueViewKey)) {
        sessionStorage.setItem(clueViewKey, Date.now().toString());
    }

    // Render progressive hints
    renderProgressiveHints(currentCode, clue);

    // Start updating hint timers
    hintUpdateInterval = setInterval(() => updateHintTimers(currentCode, clue), 1000);

    // Show completion button if clue has completion code
    if (clue.completionCode) {
        showMainQuestCompletionButton(currentCode, clue);
    }

    // Setup navigation buttons
    const nextClueBtn = document.getElementById('next-clue-btn');
    const homeBtn = document.getElementById('home-btn');

    // Check if hunt is complete
    const progress = getProgress();
    if (progress.completed) {
        // All clues found! Show completion button
        nextClueBtn.textContent = '🏆 Claim Your Treasure!';
        nextClueBtn.addEventListener('click', () => {
            clearInterval(hintUpdateInterval);
            window.location.href = 'complete.html';
        });
    } else {
        nextClueBtn.addEventListener('click', () => {
            clearInterval(hintUpdateInterval);
            window.location.href = 'index.html';
        });
    }

    homeBtn.addEventListener('click', () => {
        clearInterval(hintUpdateInterval);
        window.location.href = 'index.html';
    });

    // Clear the session storage
    sessionStorage.removeItem('currentClue');
}

// Render progressive hints
function renderProgressiveHints(code, clue) {
    const hintsContainer = document.getElementById('hints-container');
    if (!hintsContainer) return;

    // Support both old format (single hint) and new format (hints array)
    const hints = Array.isArray(clue.hints) ? clue.hints : [clue.hint || "No hint available"];
    const unlockTimes = config.hintUnlockTimes || [0, 120, 300]; // Default: immediate, 2min, 5min

    hintsContainer.innerHTML = '';

    hints.forEach((hint, index) => {
        const unlockTime = unlockTimes[index] || 0;
        const isUnlocked = getHintUnlockStatus(code, unlockTime);

        const hintItem = document.createElement('div');
        hintItem.className = `hint-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        hintItem.id = `hint-${index}`;

        hintItem.innerHTML = `
            <div class="hint-header">
                <span class="hint-number">
                    ${isUnlocked ? '🔓' : '🔒'} Hint ${index + 1}
                </span>
                <span class="hint-timer ${isUnlocked ? 'unlocked-label' : ''}" id="timer-${index}">
                    ${isUnlocked ? 'Unlocked!' : formatTimeRemaining(code, unlockTime)}
                </span>
            </div>
            <div class="hint-text ${isUnlocked ? '' : 'blurred'}">
                ${hint}
            </div>
        `;

        hintsContainer.appendChild(hintItem);
    });
}

// Check if a hint should be unlocked
function getHintUnlockStatus(code, unlockTime) {
    const clueViewKey = `clueViewed_${code}`;
    const viewTime = parseInt(sessionStorage.getItem(clueViewKey) || Date.now());
    const elapsed = (Date.now() - viewTime) / 1000; // seconds
    return elapsed >= unlockTime;
}

// Format time remaining until hint unlocks
function formatTimeRemaining(code, unlockTime) {
    const clueViewKey = `clueViewed_${code}`;
    const viewTime = parseInt(sessionStorage.getItem(clueViewKey) || Date.now());
    const elapsed = (Date.now() - viewTime) / 1000; // seconds
    const remaining = Math.max(0, unlockTime - elapsed);

    if (remaining === 0) return 'Unlocked!';

    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `Unlocks in ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update hint timers
function updateHintTimers(code, clue) {
    const hints = Array.isArray(clue.hints) ? clue.hints : [clue.hint || "No hint available"];
    const unlockTimes = config.hintUnlockTimes || [0, 120, 300];

    hints.forEach((hint, index) => {
        const unlockTime = unlockTimes[index] || 0;
        const isUnlocked = getHintUnlockStatus(code, unlockTime);
        const timerElement = document.getElementById(`timer-${index}`);
        const hintItem = document.getElementById(`hint-${index}`);
        const hintText = hintItem?.querySelector('.hint-text');

        if (timerElement && hintItem) {
            const wasLocked = hintItem.classList.contains('locked');

            if (isUnlocked && wasLocked) {
                // Just unlocked! Update classes and show animation
                hintItem.classList.remove('locked');
                hintItem.classList.add('unlocked');
                if (hintText) hintText.classList.remove('blurred');

                // Update icon and timer
                const hintNumber = hintItem.querySelector('.hint-number');
                if (hintNumber) {
                    hintNumber.innerHTML = `🔓 Hint ${index + 1}`;
                }
            }

            // Update timer text
            if (!isUnlocked) {
                timerElement.textContent = formatTimeRemaining(code, unlockTime);
            } else {
                timerElement.textContent = 'Unlocked!';
                timerElement.classList.add('unlocked-label');
            }
        }
    });
}

// ===== MAIN QUEST COMPLETION =====

function showMainQuestCompletionButton(code, clue) {
    const progress = getProgress();
    const isCompleted = progress.completedCodes && progress.completedCodes.includes(code);

    // Create completion section in the hints container
    const hintsContainer = document.getElementById('hints-container');
    if (!hintsContainer) return;

    const completionSection = document.createElement('div');
    completionSection.style.cssText = 'margin-top: 20px; padding: 15px; background: rgba(139, 69, 19, 0.2); border-radius: 10px; border: 2px solid var(--pirate-gold);';

    if (isCompleted) {
        // Already completed
        completionSection.innerHTML = `
            <div style="text-align: center;">
                <h3 style="color: var(--pirate-gold); margin-bottom: 10px;">✅ Quest Completed!</h3>
                ${clue.requiresApproval ?
                    '<p style="color: var(--pirate-cream);">⏳ Awaiting admin approval!</p>' :
                    '<p style="color: var(--pirate-cream);">✅ Quest completed!</p>'
                }
            </div>
        `;
    } else {
        // Not completed yet
        completionSection.innerHTML = `
            <div style="text-align: center;">
                <h3 style="color: var(--pirate-gold); margin-bottom: 10px;">🏴‍☠️ Complete This Quest 🏴‍☠️</h3>
                <p style="color: var(--pirate-cream); margin-bottom: 15px;">
                    Found the completion code? Enter it to complete this quest!
                </p>
                <button id="complete-main-quest-btn" class="nav-btn primary" style="background: var(--pirate-gold); color: var(--pirate-brown); width: 100%; max-width: 300px;">
                    Complete Quest
                </button>
            </div>
        `;

        // Add click handler
        setTimeout(() => {
            const completeBtn = document.getElementById('complete-main-quest-btn');
            if (completeBtn) {
                completeBtn.addEventListener('click', () => {
                    showMainQuestCompletionModal(code, clue);
                });
            }
        }, 100);
    }

    hintsContainer.appendChild(completionSection);
}

function showMainQuestCompletionModal(code, clue) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('main-quest-completion-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'main-quest-completion-modal';
        modal.className = 'player-name-overlay';
        modal.innerHTML = `
            <div class="player-name-modal">
                <h2 class="modal-title">Complete Quest</h2>
                <p class="modal-description">Enter the completion code ye found:</p>
                <input
                    type="text"
                    id="main-quest-completion-input"
                    class="name-input"
                    placeholder="Enter code..."
                    maxlength="20"
                    autocomplete="off"
                >
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                    <button id="submit-main-quest-completion-btn" class="submit-name-btn">Complete</button>
                    <button id="cancel-main-quest-completion-btn" class="admin-btn secondary" style="background: #8b0000; color: white;">Cancel</button>
                </div>
                <div id="main-quest-completion-error" class="error-message hidden"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const input = document.getElementById('main-quest-completion-input');
    const submitBtn = document.getElementById('submit-main-quest-completion-btn');
    const cancelBtn = document.getElementById('cancel-main-quest-completion-btn');
    const errorDiv = document.getElementById('main-quest-completion-error');

    input.value = '';
    errorDiv.classList.add('hidden');
    modal.classList.remove('hidden');
    input.focus();

    const handleSubmit = async () => {
        const enteredCode = input.value.trim().toUpperCase();
        const correctCode = clue.completionCode.toUpperCase();

        if (enteredCode === correctCode) {
            // Correct code!
            await completeMainQuestClue(code, clue);
            modal.classList.add('hidden');
        } else {
            // Wrong code
            errorDiv.textContent = 'Wrong code, ye scurvy dog!';
            errorDiv.classList.remove('hidden');
            input.value = '';
            setTimeout(() => errorDiv.classList.add('hidden'), 3000);
        }
    };

    submitBtn.onclick = handleSubmit;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };
    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
    };
}

async function completeMainQuestClue(code, clue) {
    const progress = getProgress();

    // Add to completed codes
    if (!progress.completedCodes) {
        progress.completedCodes = [];
    }
    if (!progress.completedCodes.includes(code)) {
        progress.completedCodes.push(code);
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

    // Sync to server if player has name
    if (progress.playerName) {
        await registerOrUpdatePlayer({
            name: progress.playerName,
            foundCodes: progress.foundCodes,
            completedCodes: progress.completedCodes,
            startTime: progress.startTime,
            completionTime: progress.completionTime,
            completed: progress.completed
        });

        // Doubloons now tracked physically
        // Award doubloons if not requiring approval
        // if (!clue.requiresApproval && clue.reward > 0) {
        //     await awardDoubloons(progress.playerName, clue.reward, `Completed main quest: ${clue.title}`);
        // }
    }

    // Show success message
    if (clue.requiresApproval) {
        alert(`Quest completed! Waiting for admin approval.`);
    } else {
        alert(`Quest completed!`);
    }

    // Reload the page to update UI
    window.location.reload();
}

// Completion Page Logic
function initializeCompletionPage() {
    const progress = getProgress();

    if (!progress.completed) {
        // Not completed yet, redirect to home
        window.location.href = 'index.html';
        return;
    }

    // Display player name
    const playerNameDisplay = document.getElementById('completion-player-name');
    if (playerNameDisplay && progress.playerName) {
        playerNameDisplay.textContent = progress.playerName;
    }

    // Calculate completion time
    const startTime = new Date(progress.startTime);
    const endTime = new Date(progress.completionTime);
    const duration = endTime - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    // Update stats
    const timeElement = document.querySelector('#completion-time .stat-value');
    const cluesElement = document.querySelector('#total-clues .stat-value');

    if (timeElement) {
        timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    if (cluesElement) {
        cluesElement.textContent = progress.foundCodes.length;
    }

    // Show name entry or auto-submit to leaderboard
    const nameEntrySection = document.getElementById('name-entry-section');
    const pirateNameInput = document.getElementById('pirate-name-input');
    const submitNameBtn = document.getElementById('submit-name-btn');
    const leaderboardPosition = document.getElementById('leaderboard-position');

    // Use player name from progress if available
    const playerName = progress.playerName || null;

    if (!progress.leaderboardSubmitted && nameEntrySection) {
        if (playerName) {
            // Auto-submit with player name
            submitToLeaderboard(playerName, duration);
            progress.leaderboardSubmitted = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
            showLeaderboardPosition(playerName, duration);
        } else {
            // Show name entry form (fallback if no player name)
            nameEntrySection.classList.remove('hidden');

            // Handle name submission
            submitNameBtn.addEventListener('click', () => {
                const name = pirateNameInput.value.trim();
                if (name.length > 0) {
                    submitToLeaderboard(name, duration);
                    progress.leaderboardSubmitted = true;
                    progress.playerName = name;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

                    nameEntrySection.classList.add('hidden');
                    showLeaderboardPosition(name, duration);
                } else {
                    pirateNameInput.focus();
                    pirateNameInput.style.borderColor = 'red';
                    setTimeout(() => {
                        pirateNameInput.style.borderColor = '';
                    }, 1000);
                }
            });

            // Allow Enter key to submit
            pirateNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitNameBtn.click();
                }
            });

            pirateNameInput.focus();
        }
    } else if (progress.leaderboardSubmitted && leaderboardPosition) {
        showLeaderboardPosition(playerName, duration);
    }

    // Setup navigation buttons
    const homeBtn = document.getElementById('home-btn');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            if (confirm('Start a new treasure hunt? This will reset your progress.')) {
                resetProgress();
                window.location.href = 'index.html';
            }
        });
    }

    if (viewLeaderboardBtn) {
        viewLeaderboardBtn.addEventListener('click', () => {
            window.location.href = 'leaderboard.html';
        });
    }
}

// Show leaderboard position message
function showLeaderboardPosition(name, duration) {
    const leaderboardPosition = document.getElementById('leaderboard-position');
    if (!leaderboardPosition) return;

    const leaderboard = getLeaderboard();
    const rank = leaderboard.findIndex(entry => entry.name === name && entry.duration === duration) + 1;

    if (rank > 0) {
        const positionText = leaderboardPosition.querySelector('p');
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏴‍☠️';
        positionText.textContent = `${medal} Ye rank #${rank} on the leaderboard! ${medal}`;
        leaderboardPosition.classList.remove('hidden');
    }
}

// Utility function to format time
function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ===== LEADERBOARD FUNCTIONS =====

const LEADERBOARD_KEY = 'pirateHuntLeaderboard';
const ACTIVE_PLAYERS_KEY = 'pirateHuntActivePlayers';

// Submit score to leaderboard
function submitToLeaderboard(name, duration) {
    const leaderboard = getLeaderboard();

    const entry = {
        name: name,
        duration: duration,
        date: new Date().toISOString(),
        cluesFound: config.totalClues
    };

    leaderboard.push(entry);

    // Sort by duration (fastest first)
    leaderboard.sort((a, b) => a.duration - b.duration);

    // Keep only top 50
    const trimmedLeaderboard = leaderboard.slice(0, 50);

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmedLeaderboard));
}

// Get leaderboard data
function getLeaderboard() {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
}

// Clear leaderboard
function clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
}

// Initialize leaderboard page
function initializeLeaderboardPage() {
    // Render active players section
    renderActivePlayers();

    // Render completed leaderboard
    const leaderboard = getLeaderboard();
    const container = document.getElementById('leaderboard-container');
    const emptyMessage = document.getElementById('empty-leaderboard');

    if (leaderboard.length === 0) {
        if (emptyMessage) emptyMessage.classList.remove('hidden');
        if (container) container.classList.add('hidden');
    } else {
        if (emptyMessage) emptyMessage.classList.add('hidden');
        if (container) {
            container.classList.remove('hidden');
            renderLeaderboard(leaderboard);
        }
    }

    // Setup buttons
    const homeBtn = document.getElementById('home-btn');
    const clearBtn = document.getElementById('clear-leaderboard-btn');

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are ye sure ye want to clear the entire leaderboard? This cannot be undone!')) {
                clearLeaderboard();
                localStorage.removeItem(ACTIVE_PLAYERS_KEY); // Also clear active players
                window.location.reload();
            }
        });
    }
}

// Render leaderboard entries
function renderLeaderboard(leaderboard) {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    container.innerHTML = '';

    leaderboard.forEach((entry, index) => {
        const rank = index + 1;
        const isTopThree = rank <= 3;

        const entryDiv = document.createElement('div');
        entryDiv.className = `leaderboard-entry ${isTopThree ? 'top-three' : ''}`;

        // Rank styling
        let rankClass = '';
        let rankIcon = rank;
        if (rank === 1) {
            rankClass = 'gold';
            rankIcon = '🥇';
        } else if (rank === 2) {
            rankClass = 'silver';
            rankIcon = '🥈';
        } else if (rank === 3) {
            rankClass = 'bronze';
            rankIcon = '🥉';
        }

        // Format date
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString();

        entryDiv.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${rankIcon}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${escapeHtml(entry.name)}</div>
                <div class="leaderboard-details">
                    ${entry.cluesFound} clues found • ${dateStr}
                </div>
            </div>
            <div class="leaderboard-time">${formatDuration(entry.duration)}</div>
        `;

        container.appendChild(entryDiv);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ACTIVE PLAYERS TRACKING =====

// Update active player progress
function updateActivePlayer(progress) {
    if (!progress.playerName || progress.completed) return;

    const activePlayers = getActivePlayers();

    // Find or create player entry
    let playerEntry = activePlayers.find(p => p.name === progress.playerName);

    if (playerEntry) {
        // Update existing player
        playerEntry.cluesFound = progress.foundCodes.length;
        playerEntry.lastUpdated = new Date().toISOString();
    } else {
        // Add new player
        playerEntry = {
            name: progress.playerName,
            cluesFound: progress.foundCodes.length,
            startTime: progress.startTime,
            lastUpdated: new Date().toISOString()
        };
        activePlayers.push(playerEntry);
    }

    localStorage.setItem(ACTIVE_PLAYERS_KEY, JSON.stringify(activePlayers));
}

// Remove player from active list
function removeActivePlayer(playerName) {
    if (!playerName) return;

    const activePlayers = getActivePlayers();
    const filtered = activePlayers.filter(p => p.name !== playerName);
    localStorage.setItem(ACTIVE_PLAYERS_KEY, JSON.stringify(filtered));
}

// Get active players
function getActivePlayers() {
    const stored = localStorage.getItem(ACTIVE_PLAYERS_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
}

// Render active players on leaderboard
function renderActivePlayers() {
    const activePlayers = getActivePlayers();
    const section = document.getElementById('active-players-section');
    const container = document.getElementById('active-players-list');

    if (!section || !container) return;

    if (activePlayers.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    container.innerHTML = '';

    // Sort by most progress
    activePlayers.sort((a, b) => b.cluesFound - a.cluesFound);

    activePlayers.forEach(player => {
        const card = document.createElement('div');
        card.className = 'active-player-card';

        // Create progress dots
        let progressDots = '<div class="progress-dots">';
        for (let i = 0; i < config.totalClues; i++) {
            const completed = i < player.cluesFound ? 'completed' : '';
            progressDots += `<div class="progress-dot ${completed}"></div>`;
        }
        progressDots += '</div>';

        card.innerHTML = `
            <div class="active-player-info">
                <div class="active-player-name">${escapeHtml(player.name)}</div>
                <div class="active-player-progress">
                    ${player.cluesFound} of ${config.totalClues} clues found
                </div>
                ${progressDots}
            </div>
        `;

        container.appendChild(card);
    });
}
