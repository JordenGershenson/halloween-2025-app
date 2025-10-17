# Pirate's Treasure Hunt - Halloween Party Scavenger Hunt App

A pirate-themed web application for running an interactive scavenger hunt at your Halloween party. Guests find physical clues around your house, each containing a 4-digit code that unlocks the next part of the story.

## Features

- **Pirate-Themed Design**: Authentic parchment background with aged, vintage styling
- **Code Entry System**: Guests enter 4-digit codes to unlock clues
- **Progress Tracking**: Visual progress bar showing how many clues have been found
- **Story Progression**: Each clue reveals lore and hints for the next location
- **Completion Screen**: Special treasure found page with stats when all clues are discovered
- **Mobile Responsive**: Works perfectly on phones as guests move around the house
- **Animated Effects**: Smooth transitions, shake effects for wrong codes, and celebratory animations
- **Time Tracking**: Automatically tracks how long it takes to complete the hunt
- **Local Storage**: Progress is saved automatically (survives page refreshes)

## Quick Start

### Option 1: Python (Simplest)

If you have Python installed:

```bash
# Navigate to the project folder
cd F:\halloween-2025-app

# Python 3
python -m http.server 8000

# OR Python 2
python -m SimpleHTTPServer 8000
```

Then open your browser to: `http://localhost:8000`

### Option 2: Node.js

If you have Node.js installed:

```bash
# Install a simple HTTP server globally (one-time setup)
npm install -g http-server

# Navigate to the project folder
cd F:\halloween-2025-app

# Start the server
http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 3: PHP

If you have PHP installed:

```bash
cd F:\halloween-2025-app
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Option 4: Visual Studio Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## File Structure

```
halloween-2025-app/
│
├── index.html          # Main landing page with code entry
├── clue.html           # Template for displaying individual clues
├── complete.html       # Completion/victory page
├── styles.css          # All pirate-themed styling
├── app.js              # Application logic and functionality
├── config.json         # Clue configuration (EDIT THIS!)
└── README.md           # This file
```

## Customizing Your Hunt

### Editing Clues and Codes

Open `config.json` and customize:

1. **Change Codes**: Replace the codes like "1234", "5678", etc. with your own 4-digit codes
2. **Edit Content**: Update the `title`, `story`, and `hint` for each clue
3. **Add/Remove Clues**: Add more clue entries or remove some
4. **Update Total**: Make sure `totalClues` matches the number of clues you have

Example structure:

```json
{
  "totalClues": 5,
  "clues": {
    "1234": {
      "title": "Your Clue Title",
      "story": "The story/lore text that appears when they find this clue...",
      "hint": "A hint about where to find the NEXT clue..."
    }
  }
}
```

### Example Clue Placement Ideas

The default config assumes these hiding spots:
- **Code 1234**: Captain's Quarters → Hidden in a bedroom
- **Code 5678**: Galley → Hidden in/near the kitchen (fridge mentioned)
- **Code 9012**: Crew's Quarters → Hidden in another bedroom
- **Code 3456**: Crow's Nest → Hidden somewhere high up
- **Code 7890**: Cargo Hold → Hidden in a basement, closet, or storage area

### Printing Physical Clues

Create small cards or notes with:
1. Some thematic decoration
2. The 4-digit code prominently displayed
3. Optional: Additional riddle or flavor text

You can design these in any graphics program, or simply write them on aged-looking paper.

## Sharing with Guests

### On Local Network

1. Find your computer's local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Start the server on your computer

3. Share the URL with guests: `http://YOUR-IP-ADDRESS:8000`
   - Example: `http://192.168.1.100:8000`

4. Guests can access it on their phones by entering this URL in their browser

### Tips for Party Setup

- **Test First**: Run through the entire hunt yourself before the party
- **WiFi**: Make sure your WiFi is working well
- **Battery**: Remind guests to have charged phones
- **Backup**: Have printed clues as a backup if tech fails
- **Groups**: Consider having guests work in teams
- **Prizes**: Maybe hide an actual physical treasure at the final location!

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
