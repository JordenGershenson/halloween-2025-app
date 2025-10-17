# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Pirate-themed Halloween scavenger hunt web application. Players enter alphanumeric codes found on physical clues hidden around a house, unlocking a progressive story with timed hints. Features cross-device player tracking, an admin panel for live game management, side quests with doubloon currency, and a leaderboard system.

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start server (runs on port 8000)
node server.js
# OR use convenience scripts:
./start-server.sh  # Mac/Linux
start-server.bat   # Windows
```

### Docker Deployment
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Restart after config changes
docker-compose restart

# Rebuild after code changes
docker-compose down
docker-compose up -d --build

# Stop
docker-compose down
```

## Architecture

### Backend (server.js)
- **Framework**: Express.js on Node.js (port 8000)
- **Persistence**: JSON file-based storage (`game-data.json` - auto-created)
- **State Management**: In-memory `gameState` object synced to disk on every mutation
- **Key Data Structures**:
  - `players[]`: All registered players with progress tracking
  - `activePlayers[]`: Currently active hunters (filtered from players)
  - `quests[]`: Side quest definitions with claim/completion tracking
  - `doubloons{}`: Player currency balances keyed by player name
  - `leaderboard[]`: Completion records sorted by duration
  - `config`: Loaded from `config.json` at startup

### Frontend Architecture
- **Pure vanilla JavaScript** - no frameworks
- **Multi-page SPA**: Index (code entry), clue display, completion, leaderboard, admin panel, quests
- **State Persistence**:
  - Client: localStorage for player progress (`pirateHuntProgress`, `pirateHuntLeaderboard`, `pirateHuntActivePlayers`)
  - Server: RESTful API calls sync localStorage to backend
- **Key Files**:
  - `app.js`: Main game logic, page initialization, localStorage management
  - `api.js`: API wrapper functions for all backend endpoints
  - `admin.js`: Admin panel logic (password: `captain`)
  - `quests.js`: Side quest system logic

### Configuration System
- **Source**: `config.json` (must be edited to customize hunt)
- **Structure**:
  - `clues{}`: Object keyed by 4-character codes (auto-uppercased)
  - `totalClues`: Number of clues in the hunt
  - `hintUnlockTimes[]`: Seconds for progressive hint reveals (e.g., [0, 300, 600])
  - `errorMessages[]`: Random error messages for wrong codes
- **Loading**: Server reads at startup; frontend fetches via `/api/config`

### State Synchronization Pattern
When a player finds a code:
1. `app.js` validates code against `config.clues`
2. Updates localStorage (`foundCodes[]`, timestamps)
3. Calls `registerOrUpdatePlayer()` via `api.js`
4. Server updates `gameState.players` and `gameState.activePlayers`
5. Calls `saveData()` to persist to `game-data.json`

This dual-storage approach enables offline-first gameplay while maintaining central leaderboard/admin features.

### Progressive Hint System
- Hints unlock based on elapsed time since clue was first viewed
- Timestamps stored in sessionStorage with key `clueViewed_{CODE}`
- `hintUpdateInterval` runs every 1 second to check unlock status
- Uses `getHintUnlockStatus()` to compare elapsed time vs `config.hintUnlockTimes[]`
- Visual feedback: locked hints show countdown timer and blurred text

### API Endpoints

**Config**
- `GET /api/config` - Returns game configuration

**Players**
- `GET /api/players` - All players
- `GET /api/players/active` - Currently hunting (not completed)
- `GET /api/players/:name` - Single player by name
- `POST /api/players` - Register or update player progress

**Leaderboard**
- `GET /api/leaderboard` - Top 50 fastest completions
- `POST /api/leaderboard` - Submit completion time

**Quests**
- `GET /api/quests` - All side quests
- `POST /api/quests` - Create new quest (admin)
- `PUT /api/quests/:id` - Update quest (claim/complete/deactivate)

**Doubloons**
- `GET /api/doubloons` - All player balances
- `GET /api/doubloons/:name` - Single player balance
- `POST /api/doubloons` - Award doubloons

**Admin**
- `POST /api/admin/reset` - Clear all data except config
- `POST /api/admin/clear-leaderboard` - Clear leaderboard and active players

### File Structure Context
- **Frontend Pages**: `index.html` (landing/code entry), `clue.html` (clue display template), `complete.html` (victory screen), `leaderboard.html`, `admin.html`, `quests.html`
- **Styles**: `styles.css` (main pirate theme with CSS variables in `:root`), `admin.css`
- **Backend**: `server.js` (single file, ~294 lines)
- **Config**: `config.json` (edit this to customize hunt)
- **Deployment**: `Dockerfile`, `docker-compose.yml` (volumes mounted for `game-data.json` and `config.json`)

### Key Implementation Details
- **Code Normalization**: All codes auto-converted to uppercase (`/[^a-zA-Z0-9]/g` filter)
- **Completion Detection**: Player marked complete when `foundCodes.length === config.totalClues`
- **Active Player Cleanup**: Removed from `activePlayers[]` when `completed: true`
- **Admin Password**: Hardcoded in `admin.js:10` as `'captain'`
- **Session Management**: Uses `sessionStorage` for current clue (`currentClue` key) and view timestamps
- **Docker Persistence**: Volumes mount `game-data.json` and `config.json` for updates without rebuilds

## Common Customizations

### Changing Clues/Codes
Edit `config.json` - update codes (keys), titles, story text, hints arrays. Ensure `totalClues` matches number of clue objects.

### Adjusting Hint Timing
Modify `hintUnlockTimes` array in `config.json` (values in seconds).

### Theming
Edit CSS variables in `styles.css` under `:root` section.

### Admin Password
Change `ADMIN_PASSWORD` constant in `admin.js:10`.

### Port Configuration
Default is 8000. Change in `server.js:7` and `docker-compose.yml:7`.

## Important Notes
- Codes must be exactly 4 characters (enforced in UI)
- `game-data.json` is auto-created on first player registration
- Server must be restarted after `config.json` changes (or use Docker `restart`)
- Leaderboard limited to top 50 entries (server-side sort/slice)
- No authentication beyond admin password - designed for trusted home network use
- localStorage keys: `pirateHuntProgress`, `pirateHuntLeaderboard`, `pirateHuntActivePlayers`
