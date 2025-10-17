# Pirate's Treasure Hunt - Halloween Party Scavenger Hunt App

A pirate-themed web application for running an interactive scavenger hunt at your Halloween party. Guests find physical clues around your house, each containing alphanumeric codes that unlock the next part of the story.

## Features

- **Pirate-Themed Design**: Authentic parchment background with aged, vintage styling
- **Code Entry System**: Guests enter alphanumeric codes to unlock clues
- **Progressive Hints**: Timed hint system that unlocks over time
- **Player Tracking**: Cross-device player tracking with Node.js backend
- **Admin Panel**: Game Master control panel to manage the party live
- **Side Quests**: Create custom quests with doubloon rewards
- **Leaderboard**: Track active players and completed hunters
- **Mobile Responsive**: Works perfectly on phones as guests move around the house
- **Animated Effects**: Smooth transitions, shake effects for wrong codes
- **RESTful API**: Full backend for multiplayer tracking
- **Docker Ready**: Easy deployment with Docker Compose

## Quick Start - Home Lab Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed on your home lab server
- Git installed

### Deployment Steps

```bash
# 1. Clone the repository
git clone https://github.com/JordenGershenson/halloween-2025-app.git
cd halloween-2025-app

# 2. Deploy with Docker Compose
docker-compose up -d

# 3. View logs (optional)
docker-compose logs -f

# 4. Access the application
# Main app: http://YOUR-SERVER-IP:8000
# Admin panel: http://YOUR-SERVER-IP:8000/admin.html
# Side quests: http://YOUR-SERVER-IP:8000/quests.html
```

### Updating the App

When changes are pushed to GitHub:

```bash
# Pull latest changes
git pull

# Restart containers
docker-compose restart

# OR rebuild if code changed (not just config)
docker-compose down
docker-compose up -d --build
```

### Stopping the App

```bash
docker-compose down
```

## Alternative: Local Development (Node.js)

If you want to run it locally without Docker:

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js

# 3. Access at http://localhost:8000
```

For Windows:
```bash
start-server.bat
```

For Mac/Linux:
```bash
./start-server.sh
```

## File Structure

```
halloween-2025-app/
│
├── Frontend
│   ├── index.html          # Main landing page with code entry
│   ├── clue.html           # Template for displaying individual clues
│   ├── complete.html       # Completion/victory page
│   ├── leaderboard.html    # Leaderboard page
│   ├── quests.html         # Side quests page for players
│   ├── admin.html          # Admin control panel
│   ├── styles.css          # Main pirate-themed styling
│   ├── admin.css           # Admin panel styling
│   ├── app.js              # Main application logic
│   ├── quests.js           # Quest system logic
│   ├── admin.js            # Admin panel logic
│   └── api.js              # API helper functions
│
├── Backend
│   ├── server.js           # Node.js/Express server
│   ├── package.json        # Node dependencies
│   └── game-data.json      # Persistent game state (auto-generated)
│
├── Configuration
│   └── config.json         # Clue configuration (EDIT THIS!)
│
├── Deployment
│   ├── Dockerfile          # Docker container definition
│   ├── docker-compose.yml  # Docker Compose configuration
│   ├── .dockerignore       # Docker ignore rules
│   └── DEPLOYMENT.md       # Detailed deployment guide
│
└── Documentation
    └── README.md           # This file
```

## Customizing Your Hunt

### Editing Clues and Codes

Open `config.json` and customize:

1. **Change Codes**: Use any 4-character alphanumeric codes (e.g., "GOLD", "AB12", "TIDE", "1234")
2. **Edit Content**: Update the `title`, `story`, and `hints` array for each clue
3. **Add/Remove Clues**: Add more clue entries or remove some
4. **Update Total**: Make sure `totalClues` matches the number of clues you have
5. **Hint Timing**: Adjust `hintUnlockTimes` array (in seconds) for progressive hints

Example structure:

```json
{
  "title": "Your Hunt Title",
  "totalClues": 5,
  "hintUnlockTimes": [0, 300, 600],
  "clues": {
    "GOLD": {
      "title": "Your Clue Title",
      "story": "The story/lore text that appears when they find this clue...",
      "hints": [
        "First hint (shows immediately)",
        "Second hint (unlocks after 5 minutes)",
        "Third hint (unlocks after 10 minutes)"
      ]
    }
  }
}
```

**Note:** Codes are automatically converted to uppercase, so "gold" and "GOLD" are treated the same.

### Printing Physical Clues

Create small cards or notes with:
1. Some thematic decoration
2. The 4-character code prominently displayed
3. Optional: Additional riddle or flavor text

You can design these in any graphics program, or simply write them on aged-looking paper.

## Sharing with Guests

### Finding Your Server IP

1. Find your home lab server's IP address:
   - Linux: `ip addr` or `hostname -I`
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac: `ifconfig` or System Preferences → Network

2. Your server is accessible at: `http://YOUR-SERVER-IP:8000`
   - Example: `http://192.168.1.100:8000`

3. Share this URL with guests so they can access it on their phones

### Party URLs

Share these with your guests:
- **Main Hunt**: `http://YOUR-SERVER-IP:8000`
- **Leaderboard**: `http://YOUR-SERVER-IP:8000/leaderboard.html`
- **Side Quests**: `http://YOUR-SERVER-IP:8000/quests.html`

Keep for yourself (Game Master):
- **Admin Panel**: `http://YOUR-SERVER-IP:8000/admin.html` (Password: `captain`)

### Tips for Party Setup

- **Test First**: Run through the entire hunt yourself before the party
- **WiFi**: Make sure all guests are on the same WiFi network as the server
- **Battery**: Remind guests to have charged phones
- **Backup**: Have printed clues as a backup if tech fails
- **Groups**: Consider having guests work in teams
- **Prizes**:
  - Physical treasure at the final location for main hunt winners
  - Prize for player with most doubloons at end of party
- **Monitor**: Keep admin panel open to track progress live

## Customization Ideas

### Changing the Theme

Edit `styles.css` to modify:
- Colors (the `:root` section has all color variables)
- Fonts
- Background effects
- Animations

### Adding Sound Effects

You could add pirate music or sound effects by adding audio elements:

```javascript
// Add to app.js
const successSound = new Audio('success.mp3');
successSound.play();
```

### Adding Images

Add images to clue pages by modifying the clue content in `config.json`:

```json
"story": "<img src='clue-image.jpg' style='max-width:100%'><p>Your story text...</p>"
```

## Troubleshooting

### "Cannot GET /clue.html" or similar errors

Make sure you're running a local server (see Quick Start options above). Opening the HTML files directly (file://) won't work because the app uses JavaScript fetch() which requires HTTP.

### Progress not saving

Make sure your browser allows localStorage. Check browser console (F12) for errors.

### Clues not appearing

1. Check that `config.json` is valid JSON (use a JSON validator online)
2. Check browser console (F12) for errors
3. Make sure codes in config.json are strings ("1234" not 1234)

### Mobile devices can't connect

1. Verify your phone is on the same WiFi network as the server
2. Check firewall settings aren't blocking connections
3. Try temporarily disabling firewall to test

## Advanced: Adding More Features

### Leaderboard

You could add a leaderboard by saving completion times and displaying them:
- Use localStorage or a simple backend
- Show fastest times on completion page

### Hints System

Add a "hint" button that reveals progressive hints:
- Show hint 1 after 5 minutes
- Show hint 2 after 10 minutes

### Team Mode

Track multiple teams separately:
- Add team selection at start
- Store progress per team
- Show comparative progress

## Admin Panel

The admin panel allows the Game Master to manage the party in real-time.

### Accessing Admin Panel

1. Navigate to `http://localhost:8000/admin.html`
2. Default password: `captain` (change in admin.js:10)
3. Access the Game Master Control Panel

### Admin Features

**Dashboard Tab:**
- View total players, active hunters, and completed hunters
- Monitor main quest progress for all players
- See recent activity

**Quest Manager Tab:**
- Create custom side quests with:
  - Title and description
  - Doubloon reward
  - Optional completion code
- Deactivate quests
- Track how many players claimed/completed each quest

**Doubloons Tab:**
- Award doubloons to any player
- View doubloon leaderboard
- Track who has the most doubloons

**Players Tab:**
- View all players and their stats:
  - Main quest progress
  - Side quests completed
  - Total doubloons earned

### Side Quests System

**For Players:**
- Click "📜 Side Quests" button on home page
- View available quests
- Claim quests to accept them
- Complete quests to earn doubloons
- Some quests require a completion code

**For Game Master:**
1. Create quests in admin panel
2. Optionally set a completion code (players must enter this code)
3. Players can claim and complete quests
4. Award bonus doubloons manually for special achievements
5. At end of party, player with most doubloons wins a prize!

### Changing Admin Password

Edit `admin.js` line 10:
```javascript
const ADMIN_PASSWORD = 'captain'; // Change this to your desired password
```

## Credits

Built for an epic Halloween 2025 pirate-themed party!

## License

Free to use and modify for your own parties and events!

---

**Have a legendary treasure hunt! 🏴‍☠️**
