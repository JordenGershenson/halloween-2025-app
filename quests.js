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
    // Doubloons now tracked physically
    // updateDoubloonDisplay(playerName);

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

// Doubloons now tracked physically
// async function updateDoubloonDisplay(playerName) {
//     const playerData = await getPlayerDoubloons(playerName);
//     document.getElementById('player-doubloon-count').textContent = playerData.total;
// }

async function loadQuests(playerName) {
    const allQuests = await getQuests();
    const activeQuests = allQuests.filter(q => q.active);

    // Categorize quests
    const available = [];
    const myDiscovered = [];
    const myCompleted = [];

    activeQuests.forEach(quest => {
        if (quest.completedBy.includes(playerName)) {
            myCompleted.push(quest);
        } else if (quest.discoveredBy && quest.discoveredBy.includes(playerName)) {
            myDiscovered.push(quest);
        } else {
            available.push(quest);
        }
    });

    // Render each category
    renderAvailableQuests(available, playerName);
    renderDiscoveredQuests(myDiscovered, playerName);
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

function renderDiscoveredQuests(quests, playerName) {
    const container = document.getElementById('my-quests-list');
    const section = document.getElementById('my-quests-section');

    if (quests.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    container.innerHTML = '';

    quests.forEach(quest => {
        const card = createQuestCard(quest, 'discovered', playerName);
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

    // Add green border and checkmark for completed quests
    if (status === 'completed') {
        card.style.border = '3px solid #4CAF50';
        card.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.3)';
    }

    // Quest type badge
    const questTypeIcon = quest.questType === 'main' ? '⚓' : '⚔️';
    const questTypeBadge = `<span style="background: ${quest.questType === 'main' ? 'rgba(139, 69, 19, 0.3)' : 'rgba(212, 175, 55, 0.2)'}; padding: 4px 8px; border-radius: 3px; font-size: 0.8em; margin-left: 8px;">${questTypeIcon} ${quest.questType === 'main' ? 'Main' : 'Side'}</span>`;

    let icon = '📜';
    let buttonHtml = '';
    let statusHtml = '';

    if (status === 'available') {
        icon = quest.questType === 'main' ? '⚓' : '⚔️';
        buttonHtml = `<button class="nav-btn" style="margin-top: 10px; width: 100%;" onclick="discoverQuest('${quest.id}', '${playerName}')">Discover Quest</button>`;
    } else if (status === 'discovered') {
        icon = '🔍';
        if (quest.requiresApproval) {
            statusHtml = `<div style="background: rgba(255, 215, 0, 0.2); padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center; color: var(--pirate-gold);">
                ⏳ Awaiting Admin Approval
            </div>`;
        } else {
            statusHtml = `<div style="background: rgba(76, 175, 80, 0.2); padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center; color: #4CAF50;">
                ✅ Auto-Completed!
            </div>`;
        }
    } else if (status === 'completed') {
        icon = '✅';
        statusHtml = `<div style="background: rgba(76, 175, 80, 0.3); padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center; color: #4CAF50; font-weight: bold;">
            ✅ COMPLETED!
        </div>`;
    }

    // Doubloons now tracked physically
    // const rewardHtml = quest.reward > 0 ? `
    //     <div class="unlocked-clue-code" style="background: rgba(212, 175, 55, 0.2); padding: 8px; border-radius: 5px; font-weight: bold;">
    //         Reward: 💰 ${quest.reward} Doubloons
    //     </div>
    // ` : '';
    const rewardHtml = '';

    card.innerHTML = `
        <div class="unlocked-clue-icon">${icon}</div>
        <div class="unlocked-clue-title">${escapeHtml(quest.title)} ${questTypeBadge}</div>
        <div style="font-size: 0.9em; color: var(--pirate-brown); margin: 10px 0; line-height: 1.5;">
            ${escapeHtml(quest.description)}
        </div>
        ${rewardHtml}
        ${statusHtml}
        ${buttonHtml}
    `;

    return card;
}

async function discoverQuest(questId, playerName) {
    const quests = await getQuests();
    const quest = quests.find(q => q.id === questId);

    if (!quest) return;

    // If quest has a code, show modal to enter it
    if (quest.code) {
        showDiscoveryModal(quest, playerName);
    } else {
        // No code required, discover immediately
        if (confirm(`Mark "${quest.title}" as discovered?`)) {
            await updateQuest(questId, 'discover', playerName);

            // Show appropriate message
            if (quest.requiresApproval) {
                alert(`Quest discovered! Waiting for admin approval.`);
            } else {
                alert(`Quest discovered and completed!`);
            }

            // Doubloons now tracked physically
            // updateDoubloonDisplay(playerName);
            loadQuests(playerName);
        }
    }
}

function showDiscoveryModal(quest, playerName) {
    const modal = document.getElementById('quest-completion-modal');
    const titleEl = document.getElementById('modal-quest-title');
    const descEl = document.getElementById('modal-quest-description');
    const input = document.getElementById('completion-code-input');
    const submitBtn = document.getElementById('submit-completion-btn');
    const cancelBtn = document.getElementById('cancel-completion-btn');
    const errorDiv = document.getElementById('completion-error');

    titleEl.textContent = quest.title;
    descEl.textContent = 'Enter the quest code ye found:';
    input.value = '';
    errorDiv.classList.add('hidden');

    modal.classList.remove('hidden');
    input.focus();

    const handleSubmit = async () => {
        const code = input.value.trim().toUpperCase();
        const questCode = quest.code.toUpperCase();
        if (code === questCode) {
            // Discover the quest
            await updateQuest(quest.id, 'discover', playerName);
            modal.classList.add('hidden');

            // Show appropriate message
            if (quest.requiresApproval) {
                alert(`Quest discovered! Waiting for admin approval.`);
            } else {
                alert(`Quest discovered and completed!`);
            }

            // Doubloons now tracked physically
            // updateDoubloonDisplay(playerName);
            loadQuests(playerName);
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

// Make functions global for onclick handlers
window.discoverQuest = discoverQuest;
