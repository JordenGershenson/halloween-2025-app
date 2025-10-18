const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Data file path
const DATA_FILE = path.join(__dirname, 'game-data.json');

// In-memory game state
let gameState = {
    players: [],
    activePlayers: [],
    quests: [],
    doubloons: {},
    leaderboard: [],
    config: null
};

// Load data from file on startup
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            gameState = JSON.parse(data);
            console.log('Game data loaded from file');
        }
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

// Save data to file
function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(gameState, null, 2));
    } catch (error) {
        console.error('Error saving game data:', error);
    }
}

// Load config.json
function loadConfig() {
    try {
        const configData = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
        gameState.config = JSON.parse(configData);
        console.log('Config loaded');
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Initialize
loadData();
loadConfig();

// ===== API ENDPOINTS =====

// Get game config
app.get('/api/config', (req, res) => {
    res.json(gameState.config);
});

// Get all players
app.get('/api/players', (req, res) => {
    res.json(gameState.players);
});

// Get active players
app.get('/api/players/active', (req, res) => {
    res.json(gameState.activePlayers);
});

// Register or update player
app.post('/api/players', (req, res) => {
    const { name, foundCodes, completedCodes, startTime, completionTime, completed } = req.body;

    let player = gameState.players.find(p => p.name === name);

    if (player) {
        // Update existing player
        player.foundCodes = foundCodes || player.foundCodes;
        player.completedCodes = completedCodes || player.completedCodes || [];
        player.startTime = startTime || player.startTime;
        player.completionTime = completionTime || player.completionTime;
        player.completed = completed !== undefined ? completed : player.completed;
        player.lastUpdated = new Date().toISOString();
    } else {
        // Create new player
        player = {
            name,
            foundCodes: foundCodes || [],
            completedCodes: completedCodes || [],
            startTime: startTime || new Date().toISOString(),
            completionTime: completionTime || null,
            completed: completed || false,
            lastUpdated: new Date().toISOString()
        };
        gameState.players.push(player);
    }

    // Update active players list
    if (!completed && foundCodes && foundCodes.length > 0) {
        let activePlayer = gameState.activePlayers.find(p => p.name === name);
        if (activePlayer) {
            activePlayer.cluesFound = foundCodes.length;
            activePlayer.lastUpdated = new Date().toISOString();
        } else {
            gameState.activePlayers.push({
                name,
                cluesFound: foundCodes.length,
                startTime: startTime || new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        }
    }

    // Remove from active if completed
    if (completed) {
        gameState.activePlayers = gameState.activePlayers.filter(p => p.name !== name);
    }

    saveData();
    res.json({ success: true, player });
});

// Get player by name
app.get('/api/players/:name', (req, res) => {
    const player = gameState.players.find(p => p.name === req.params.name);
    if (player) {
        res.json(player);
    } else {
        res.status(404).json({ error: 'Player not found' });
    }
});

// ===== LEADERBOARD =====

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    res.json(gameState.leaderboard);
});

// Submit to leaderboard
app.post('/api/leaderboard', (req, res) => {
    const { name, duration, cluesFound } = req.body;

    const entry = {
        name,
        duration,
        cluesFound,
        date: new Date().toISOString()
    };

    gameState.leaderboard.push(entry);
    gameState.leaderboard.sort((a, b) => a.duration - b.duration);
    gameState.leaderboard = gameState.leaderboard.slice(0, 50); // Keep top 50

    saveData();
    res.json({ success: true, entry });
});

// ===== QUESTS =====

// Get all quests
app.get('/api/quests', (req, res) => {
    res.json(gameState.quests);
});

// Create quest
app.post('/api/quests', (req, res) => {
    const { title, description, reward, code, questType, requiresApproval } = req.body;

    const quest = {
        id: Date.now().toString(),
        title,
        description,
        reward: reward || 0,
        code: code || null,
        questType: questType || 'side', // 'main' or 'side'
        requiresApproval: requiresApproval || false,
        active: true,
        createdAt: new Date().toISOString(),
        discoveredBy: [],
        completedBy: []
    };

    gameState.quests.push(quest);
    saveData();
    res.json({ success: true, quest });
});

// Update quest (discover, approve, deactivate)
app.put('/api/quests/:id', (req, res) => {
    const { action, playerName } = req.body;
    const quest = gameState.quests.find(q => q.id === req.params.id);

    if (!quest) {
        return res.status(404).json({ error: 'Quest not found' });
    }

    if (action === 'discover' && playerName) {
        // Add to discovered list
        if (!quest.discoveredBy.includes(playerName)) {
            quest.discoveredBy.push(playerName);
        }

        // Auto-complete if no approval required
        if (!quest.requiresApproval && !quest.completedBy.includes(playerName)) {
            quest.completedBy.push(playerName);

            // Auto-award doubloons
            if (quest.reward > 0) {
                if (!gameState.doubloons[playerName]) {
                    gameState.doubloons[playerName] = { total: 0, transactions: [] };
                }
                gameState.doubloons[playerName].total += quest.reward;
                gameState.doubloons[playerName].transactions.push({
                    amount: quest.reward,
                    reason: `Completed: ${quest.title}`,
                    timestamp: new Date().toISOString()
                });
            }
        }
    } else if (action === 'approve' && playerName) {
        // Admin approves a discovered quest
        if (quest.discoveredBy.includes(playerName) && !quest.completedBy.includes(playerName)) {
            quest.completedBy.push(playerName);

            // Award doubloons on approval
            if (quest.reward > 0) {
                if (!gameState.doubloons[playerName]) {
                    gameState.doubloons[playerName] = { total: 0, transactions: [] };
                }
                gameState.doubloons[playerName].total += quest.reward;
                gameState.doubloons[playerName].transactions.push({
                    amount: quest.reward,
                    reason: `Completed: ${quest.title}`,
                    timestamp: new Date().toISOString()
                });
            }
        }
    } else if (action === 'deactivate') {
        quest.active = false;
    }

    saveData();
    res.json({ success: true, quest });
});

// ===== DOUBLOONS =====

// Get all doubloons
app.get('/api/doubloons', (req, res) => {
    res.json(gameState.doubloons);
});

// Get doubloons for specific player
app.get('/api/doubloons/:name', (req, res) => {
    const playerDoubloons = gameState.doubloons[req.params.name] || { total: 0, transactions: [] };
    res.json(playerDoubloons);
});

// Award doubloons
app.post('/api/doubloons', (req, res) => {
    const { playerName, amount, reason } = req.body;

    if (!gameState.doubloons[playerName]) {
        gameState.doubloons[playerName] = { total: 0, transactions: [] };
    }

    gameState.doubloons[playerName].total += amount;
    gameState.doubloons[playerName].transactions.push({
        amount,
        reason: reason || 'Award',
        timestamp: new Date().toISOString()
    });

    saveData();
    res.json({ success: true, doubloons: gameState.doubloons[playerName] });
});

// ===== ADMIN =====

// Approve main quest completion
app.post('/api/admin/approve-main-quest', (req, res) => {
    const { playerName, clueCode, reward, title } = req.body;

    if (!playerName || !clueCode) {
        return res.status(400).json({ error: 'Missing playerName or clueCode' });
    }

    // Award doubloons
    if (reward > 0) {
        if (!gameState.doubloons[playerName]) {
            gameState.doubloons[playerName] = { total: 0, transactions: [] };
        }
        gameState.doubloons[playerName].total += reward;
        gameState.doubloons[playerName].transactions.push({
            amount: reward,
            reason: `Main quest approved: ${title || clueCode}`,
            timestamp: new Date().toISOString()
        });
    }

    saveData();
    res.json({ success: true, message: 'Main quest completion approved' });
});

// Clear all data (admin only)
app.post('/api/admin/reset', (req, res) => {
    gameState = {
        players: [],
        activePlayers: [],
        quests: [],
        doubloons: {},
        leaderboard: [],
        config: gameState.config // Keep config
    };
    saveData();
    res.json({ success: true, message: 'All data cleared' });
});

// Clear leaderboard only
app.post('/api/admin/clear-leaderboard', (req, res) => {
    gameState.leaderboard = [];
    gameState.activePlayers = [];
    saveData();
    res.json({ success: true, message: 'Leaderboard cleared' });
});

// ===== START SERVER =====

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║     🏴‍☠️  Pirate's Treasure Hunt Server  🏴‍☠️            ║
╚═══════════════════════════════════════════════════════════╝

Server running on http://localhost:${PORT}

📱 Share with guests: http://YOUR-LOCAL-IP:${PORT}
🎮 Admin panel: http://localhost:${PORT}/admin.html
🗺️  Side quests: http://localhost:${PORT}/quests.html

Press Ctrl+C to stop the server
    `);
});
