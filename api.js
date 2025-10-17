// API Helper Functions
// Handles all communication with the server

const API_BASE = window.location.origin;

// ===== CONFIG =====

async function fetchConfig() {
    try {
        const response = await fetch(`${API_BASE}/api/config`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching config:', error);
        return null;
    }
}

// ===== PLAYERS =====

async function registerOrUpdatePlayer(playerData) {
    try {
        const response = await fetch(`${API_BASE}/api/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating player:', error);
        return { success: false };
    }
}

async function getPlayer(name) {
    try {
        const response = await fetch(`${API_BASE}/api/players/${encodeURIComponent(name)}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching player:', error);
        return null;
    }
}

async function getAllPlayers() {
    try {
        const response = await fetch(`${API_BASE}/api/players`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching players:', error);
        return [];
    }
}

async function getActivePlayers() {
    try {
        const response = await fetch(`${API_BASE}/api/players/active`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching active players:', error);
        return [];
    }
}

// ===== LEADERBOARD =====

async function getLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/api/leaderboard`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

async function submitToLeaderboard(name, duration, cluesFound) {
    try {
        const response = await fetch(`${API_BASE}/api/leaderboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, duration, cluesFound })
        });
        return await response.json();
    } catch (error) {
        console.error('Error submitting to leaderboard:', error);
        return { success: false };
    }
}

// ===== QUESTS =====

async function getQuests() {
    try {
        const response = await fetch(`${API_BASE}/api/quests`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching quests:', error);
        return [];
    }
}

async function createQuest(questData) {
    try {
        const response = await fetch(`${API_BASE}/api/quests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating quest:', error);
        return { success: false };
    }
}

async function updateQuest(questId, action, playerName = null) {
    try {
        const response = await fetch(`${API_BASE}/api/quests/${questId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, playerName })
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating quest:', error);
        return { success: false };
    }
}

// ===== DOUBLOONS =====

async function getAllDoubloons() {
    try {
        const response = await fetch(`${API_BASE}/api/doubloons`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching doubloons:', error);
        return {};
    }
}

async function getPlayerDoubloons(playerName) {
    try {
        const response = await fetch(`${API_BASE}/api/doubloons/${encodeURIComponent(playerName)}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching player doubloons:', error);
        return { total: 0, transactions: [] };
    }
}

async function awardDoubloons(playerName, amount, reason) {
    try {
        const response = await fetch(`${API_BASE}/api/doubloons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName, amount, reason })
        });
        return await response.json();
    } catch (error) {
        console.error('Error awarding doubloons:', error);
        return { success: false };
    }
}

// ===== ADMIN =====

async function resetAllData() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/reset`, {
            method: 'POST'
        });
        return await response.json();
    } catch (error) {
        console.error('Error resetting data:', error);
        return { success: false };
    }
}

async function clearLeaderboardData() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/clear-leaderboard`, {
            method: 'POST'
        });
        return await response.json();
    } catch (error) {
        console.error('Error clearing leaderboard:', error);
        return { success: false };
    }
}
