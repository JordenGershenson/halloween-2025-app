// Player Quest System
// Handles quest viewing, claiming, and completion

const QUESTS_KEY = 'pirateHuntQuests';
const DOUBLOONS_KEY = 'pirateHuntDoubloons';

// Initialize quests page
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('quests.html') && !window.location.pathname.endsWith('quests')) return;

    const progress = getProgress();

    if (!progress.playerName) {
        // Redirect to home if no player name
        alert('Please start the main hunt first!');
        window.location.href = 'index.html';
        return;
    }

    initializeQuestsPage(progress.playerName);
});

function initializeQuestsPage(playerName) {
    // Display player info
    document.getElementById('quests-player-name').textContent = playerName;
    updateDoubloonDisplay(playerName);

    // Load quests
    loadQuests(playerName);

    // Setup buttons
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

async function updateDoubloonDisplay(playerName) {
    const playerData = await getPlayerDoubloons(playerName);
    document.getElementById('player-doubloon-count').textContent = playerData.total;
}

async function loadQuests(playerName) {
    const allQuests = await getQuests();
    const activeQuests = allQuests.filter(q => q.active);

    // Categorize quests
    const available = [];
    const myClaimed = [];
    const myCompleted = [];

    activeQuests.forEach(quest => {
        if (quest.completedBy.includes(playerName)) {
            myCompleted.push(quest);
        } else if (quest.claimedBy.includes(playerName)) {
            myClaimed.push(quest);
        } else {
            available.push(quest);
        }
    });

    // Render each category
    renderAvailableQuests(available, playerName);
    renderMyQuests(myClaimed, playerName);
    renderCompletedQuests(myCompleted);
}

function renderAvailableQuests(quests, playerName) {
    const container = document.getElementById('available-quests-list');
    const section = document.getElementById('available-quests-section');

    if (quests.length === 0) {
        container.innerHTML = '<p class="empty-message">No new quests available. Check back later!</p>';
        return;
    }

    section.classList.remove('hidden');
    container.innerHTML = '';

    quests.forEach(quest => {
        const card = createQuestCard(quest, 'available', playerName);
        container.appendChild(card);
    });
}

function renderMyQuests(quests, playerName) {
    const container = document.getElementById('my-quests-list');
    const section = document.getElementById('my-quests-section');

    if (quests.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    container.innerHTML = '';

    quests.forEach(quest => {
        const card = createQuestCard(quest, 'claimed', playerName);
        container.appendChild(card);
    });
}

function renderCompletedQuests(quests) {
    const container = document.getElementById('completed-quests-list');
    const section = document.getElementById('completed-quests-section');

    if (quests.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    container.innerHTML = '';

    quests.forEach(quest => {
        const card = createQuestCard(quest, 'completed');
        container.appendChild(card);
    });
}

function createQuestCard(quest, status, playerName) {
    const card = document.createElement('div');
    card.className = 'unlocked-clue-card';
    card.style.cursor = status === 'completed' ? 'default' : 'pointer';

    let icon = '📜';
    let buttonHtml = '';

    if (status === 'available') {
        icon = '⚔️';
        buttonHtml = `<button class="nav-btn" style="margin-top: 10px; width: 100%;" onclick="claimQuest('${quest.id}', '${playerName}')">Claim Quest</button>`;
    } else if (status === 'claimed') {
        icon = '🗺️';
        buttonHtml = `<button class="nav-btn primary" style="margin-top: 10px; width: 100%; background: var(--pirate-gold);" onclick="completeQuestPrompt('${quest.id}', '${playerName}')">Complete Quest</button>`;
    } else {
        icon = '✅';
    }

    card.innerHTML = `
        <div class="unlocked-clue-icon">${icon}</div>
        <div class="unlocked-clue-title">${escapeHtml(quest.title)}</div>
        <div style="font-size: 0.9em; color: var(--pirate-brown); margin: 10px 0; line-height: 1.5;">
            ${escapeHtml(quest.description)}
        </div>
        <div class="unlocked-clue-code" style="background: rgba(212, 175, 55, 0.2); padding: 8px; border-radius: 5px; font-weight: bold;">
            Reward: 💰 ${quest.reward} Doubloons
        </div>
        ${buttonHtml}
    `;

    return card;
}

async function claimQuest(questId, playerName) {
    await updateQuest(questId, 'claim', playerName);
    loadQuests(playerName);
}

async function completeQuestPrompt(questId, playerName) {
    const quests = await getQuests();
    const quest = quests.find(q => q.id === questId);

    if (!quest) return;

    // If quest has a code, show modal
    if (quest.code) {
        showCompletionModal(quest, playerName);
    } else {
        // No code required, complete immediately
        if (confirm(`Complete "${quest.title}" and earn ${quest.reward} doubloons?`)) {
            completeQuest(quest, playerName);
        }
    }
}

function showCompletionModal(quest, playerName) {
    const modal = document.getElementById('quest-completion-modal');
    const titleEl = document.getElementById('modal-quest-title');
    const descEl = document.getElementById('modal-quest-description');
    const input = document.getElementById('completion-code-input');
    const submitBtn = document.getElementById('submit-completion-btn');
    const cancelBtn = document.getElementById('cancel-completion-btn');
    const errorDiv = document.getElementById('completion-error');

    titleEl.textContent = quest.title;
    descEl.textContent = 'Enter the completion code to claim yer reward:';
    input.value = '';
    errorDiv.classList.add('hidden');

    modal.classList.remove('hidden');
    input.focus();

    const handleSubmit = () => {
        const code = input.value.trim();
        if (code === quest.code) {
            completeQuest(quest, playerName);
            modal.classList.add('hidden');
        } else {
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

async function completeQuest(quest, playerName) {
    // Mark as completed on server
    await updateQuest(quest.id, 'complete', playerName);

    // Award doubloons
    await awardDoubloons(playerName, quest.reward, `Completed: ${quest.title}`);

    alert(`Quest completed! Ye earned ${quest.reward} doubloons!`);
    updateDoubloonDisplay(playerName);
    loadQuests(playerName);
}

// Make functions global for onclick handlers
window.claimQuest = claimQuest;
window.completeQuestPrompt = completeQuestPrompt;
