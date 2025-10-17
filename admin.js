// Admin Panel JavaScript
// Game Master Control Panel

// Storage Keys
const ADMIN_AUTH_KEY = 'pirateHuntAdminAuth';
const QUESTS_KEY = 'pirateHuntQuests';
const ADMIN_PASSWORD = 'captain'; // Change this to your desired password

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', () => {
    // Check if on admin page
    if (!document.querySelector('.admin-container')) return;

    // Check authentication
    if (!isAuthenticated()) {
        showLoginPrompt();
    } else {
        initializeAdminPanel();
    }
});

// ===== AUTHENTICATION =====

function isAuthenticated() {
    const auth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    return auth === 'true';
}

function showLoginPrompt() {
    const overlay = document.getElementById('admin-login-overlay');
    const passwordInput = document.getElementById('admin-password-input');
    const loginBtn = document.getElementById('admin-login-btn');
    const errorDiv = document.getElementById('admin-login-error');

    overlay.classList.remove('hidden');

    const handleLogin = () => {
        const password = passwordInput.value.trim();
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
            overlay.classList.add('hidden');
            initializeAdminPanel();
        } else {
            errorDiv.textContent = 'Incorrect password, ye scallywag!';
            errorDiv.classList.remove('hidden');
            passwordInput.value = '';
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 3000);
        }
    };

    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    passwordInput.focus();
}

function logout() {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    window.location.reload();
}

// ===== INITIALIZATION =====

function initializeAdminPanel() {
    setupTabNavigation();
    setupHeaderActions();
    setupQuestForm();
    setupDoubloonForm();
    refreshDashboard();
}

function setupHeaderActions() {
    const refreshBtn = document.getElementById('refresh-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

function setupTabNavigation() {
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');

            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            // Refresh content for the selected tab
            refreshTab(tabName);
        });
    });
}

function refreshTab(tabName) {
    switch (tabName) {
        case 'dashboard':
            refreshDashboard();
            break;
        case 'quests':
            refreshQuests();
            break;
        case 'doubloons':
            refreshDoubloons();
            break;
        case 'players':
            refreshPlayers();
            break;
    }
}

function refreshDashboard() {
    updateStats();
    updateMainQuestProgress();
    updateRecentActivity();
    refreshQuests();
    refreshDoubloons();
    refreshPlayers();
}

// ===== DASHBOARD =====

async function updateStats() {
    const activePlayers = await getActivePlayers();
    const completedLeaderboard = await getLeaderboard();
    const allPlayers = await getAllPlayers();
    const activeQuests = (await getQuests()).filter(q => q.active);

    document.getElementById('total-players').textContent = allPlayers.length;
    document.getElementById('active-hunters').textContent = activePlayers.length;
    document.getElementById('completed-hunters').textContent = completedLeaderboard.length;
    document.getElementById('active-quests').textContent = activeQuests.length;
}

async function getAllPlayersAsync() {
    const players = await getAllPlayers();
    return players || [];
}

async function updateMainQuestProgress() {
    const container = document.getElementById('main-quest-progress');
    if (!container) return;

    const activePlayers = await getActivePlayers();

    if (activePlayers.length === 0) {
        container.innerHTML = '<p class="empty-message">No active players</p>';
        return;
    }

    container.innerHTML = '';

    activePlayers.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';

        const percentage = (player.cluesFound / config.totalClues) * 100;

        card.innerHTML = `
            <div class="player-header">
                <div class="player-name">${escapeHtml(player.name)}</div>
                <div>${player.cluesFound}/${config.totalClues} clues</div>
            </div>
            <div style="width: 100%; height: 20px; background: rgba(0,0,0,0.3); border-radius: 10px; overflow: hidden;">
                <div style="width: ${percentage}%; height: 100%; background: var(--admin-gold); transition: width 0.5s ease;"></div>
            </div>
        `;

        container.appendChild(card);
    });
}

function updateRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    // For now, show placeholder
    // In a real implementation, you'd track activities
    container.innerHTML = '<p class="empty-message">Activity tracking coming soon</p>';
}

// ===== QUEST MANAGEMENT =====

function setupQuestForm() {
    const createBtn = document.getElementById('create-quest-btn');
    if (!createBtn) return;

    createBtn.addEventListener('click', handleCreateQuest);
}

async function handleCreateQuest() {
    const title = document.getElementById('quest-title').value.trim();
    const description = document.getElementById('quest-description').value.trim();
    const reward = parseInt(document.getElementById('quest-reward').value) || 10;
    const code = document.getElementById('quest-code').value.trim();

    if (!title || !description) {
        alert('Please fill in title and description!');
        return;
    }

    const result = await createQuest({ title, description, reward, code });

    if (result.success) {
        // Clear form
        document.getElementById('quest-title').value = '';
        document.getElementById('quest-description').value = '';
        document.getElementById('quest-reward').value = '10';
        document.getElementById('quest-code').value = '';

        refreshQuests();
        alert('Quest created successfully!');
    } else {
        alert('Error creating quest');
    }
}

async function refreshQuests() {
    const container = document.getElementById('active-quests-list');
    if (!container) return;

    const quests = (await getQuests()).filter(q => q.active);

    if (quests.length === 0) {
        container.innerHTML = '<p class="empty-message">No active quests</p>';
        return;
    }

    container.innerHTML = '';

    quests.forEach(quest => {
        const card = document.createElement('div');
        card.className = 'quest-card';

        card.innerHTML = `
            <div class="quest-header">
                <div class="quest-title">${escapeHtml(quest.title)}</div>
                <div class="quest-reward">💰 ${quest.reward}</div>
            </div>
            <div class="quest-description">${escapeHtml(quest.description)}</div>
            ${quest.code ? `<div class="quest-code">Code: ${quest.code}</div>` : ''}
            <div class="quest-stats">
                <span>📝 Claimed: ${quest.claimedBy.length}</span>
                <span>✅ Completed: ${quest.completedBy.length}</span>
            </div>
            <div class="quest-actions">
                <button class="admin-btn danger" onclick="deactivateQuest('${quest.id}')">Deactivate</button>
            </div>
        `;

        container.appendChild(card);
    });
}

async function deactivateQuest(questId) {
    if (!confirm('Deactivate this quest?')) return;

    const result = await updateQuest(questId, 'deactivate');
    if (result.success) {
        refreshQuests();
    }
}

// ===== DOUBLOON MANAGEMENT =====

function setupDoubloonForm() {
    const awardBtn = document.getElementById('award-doubloons-btn');
    if (!awardBtn) return;

    // Populate player select
    refreshPlayerSelect();

    awardBtn.addEventListener('click', handleAwardDoubloons);
}

async function refreshPlayerSelect() {
    const select = document.getElementById('player-select');
    if (!select) return;

    const players = await getAllPlayers();

    select.innerHTML = '<option value="">Select Player...</option>';

    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.name;
        option.textContent = player.name;
        select.appendChild(option);
    });
}

async function handleAwardDoubloons() {
    const playerName = document.getElementById('player-select').value;
    const amount = parseInt(document.getElementById('doubloon-amount').value) || 0;
    const reason = document.getElementById('doubloon-reason').value.trim();

    if (!playerName) {
        alert('Please select a player!');
        return;
    }

    if (amount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }

    const result = await awardDoubloons(playerName, amount, reason || 'Manual award');

    if (result.success) {
        // Reset form
        document.getElementById('player-select').value = '';
        document.getElementById('doubloon-amount').value = '10';
        document.getElementById('doubloon-reason').value = '';

        refreshDoubloons();
        alert(`Awarded ${amount} doubloons to ${playerName}!`);
    } else {
        alert('Error awarding doubloons');
    }
}

async function refreshDoubloons() {
    const container = document.getElementById('doubloon-leaderboard');
    if (!container) return;

    const doubloons = await getAllDoubloons();
    const entries = Object.entries(doubloons)
        .map(([name, data]) => ({ name, total: data.total }))
        .sort((a, b) => b.total - a.total);

    if (entries.length === 0) {
        container.innerHTML = '<p class="empty-message">No doubloons awarded yet</p>';
        return;
    }

    container.innerHTML = '';

    entries.forEach((entry, index) => {
        const rank = index + 1;
        const isTop = rank <= 3;

        const card = document.createElement('div');
        card.className = 'doubloon-entry';

        card.innerHTML = `
            <div class="doubloon-rank ${isTop ? 'top' : ''}">${rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}</div>
            <div class="doubloon-player">${escapeHtml(entry.name)}</div>
            <div class="doubloon-amount">💰 ${entry.total}</div>
        `;

        container.appendChild(card);
    });

    // Also refresh player select
    refreshPlayerSelect();
}

// ===== PLAYER MANAGEMENT =====

async function refreshPlayers() {
    const container = document.getElementById('players-list');
    if (!container) return;

    const players = await getAllPlayers();
    const doubloons = await getAllDoubloons();
    const quests = await getQuests();

    if (players.length === 0) {
        container.innerHTML = '<p class="empty-message">No players yet</p>';
        return;
    }

    container.innerHTML = '';

    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';

        const playerDoubloons = doubloons[player.name]?.total || 0;
        const playerQuests = quests.filter(q => q.completedBy.includes(player.name)).length;
        const mainProgress = player.cluesFound || 0;

        card.innerHTML = `
            <div class="player-header">
                <div class="player-name">${escapeHtml(player.name)}</div>
                <div class="player-doubloons">💰 ${playerDoubloons}</div>
            </div>
            <div class="player-stats">
                <div class="player-stat">
                    <div class="player-stat-label">Main Quest</div>
                    <div class="player-stat-value">${mainProgress}/${config.totalClues}</div>
                </div>
                <div class="player-stat">
                    <div class="player-stat-label">Side Quests</div>
                    <div class="player-stat-value">${playerQuests}</div>
                </div>
                <div class="player-stat">
                    <div class="player-stat-label">Doubloons</div>
                    <div class="player-stat-value">💰 ${playerDoubloons}</div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Make functions global for onclick handlers
window.deactivateQuest = deactivateQuest;
