# Docker Deployment Guide

## Prerequisites
- Docker installed on your home lab server
- Docker Compose (optional, but recommended)

## Quick Start with Docker Compose (Recommended)

1. **Copy files to your home lab server:**
   ```bash
   scp -r halloween-2025-app/ user@your-server:/path/to/deploy/
   ```

2. **Navigate to the directory:**
   ```bash
   cd /path/to/deploy/halloween-2025-app
   ```

3. **Start the container:**
   ```bash
   docker-compose up -d
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Stop the container:**
   ```bash
   docker-compose down
   ```

## Manual Docker Commands

### Build the image:
```bash
docker build -t pirate-treasure-hunt .
```

### Run the container:
```bash
docker run -d \
  --name pirate-treasure-hunt \
  -p 8000:8000 \
  -v $(pwd)/game-data.json:/app/game-data.json \
  -v $(pwd)/config.json:/app/config.json \
  --restart unless-stopped \
  pirate-treasure-hunt
```

### View logs:
```bash
docker logs -f pirate-treasure-hunt
```

### Stop the container:
```bash
docker stop pirate-treasure-hunt
```

### Remove the container:
```bash
docker rm pirate-treasure-hunt
```

## Updating the Application

### With Docker Compose:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Manual:
```bash
docker stop pirate-treasure-hunt
docker rm pirate-treasure-hunt
docker build -t pirate-treasure-hunt .
docker run -d \
  --name pirate-treasure-hunt \
  -p 8000:8000 \
  -v $(pwd)/game-data.json:/app/game-data.json \
  -v $(pwd)/config.json:/app/config.json \
  --restart unless-stopped \
  pirate-treasure-hunt
```

## Updating Config Without Rebuilding

Since `config.json` and `game-data.json` are mounted as volumes, you can:

1. Edit the files on your host system
2. Restart the container:
   ```bash
   docker-compose restart
   # or
   docker restart pirate-treasure-hunt
   ```

## Port Configuration

The app runs on port 8000 by default. To use a different port, modify the port mapping:

**Docker Compose:** Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:8000"  # Host port 3000 -> Container port 8000
```

**Docker CLI:**
```bash
docker run -d -p 3000:8000 ...
```

## Accessing the Application

Once running, access the app at:
- Main app: `http://your-server-ip:8000`
- Admin panel: `http://your-server-ip:8000/admin.html`
- Side quests: `http://your-server-ip:8000/quests.html`

## Data Persistence

Game data and player progress are stored in `game-data.json`, which is mounted as a volume. This ensures data persists across container restarts and updates.

To backup your data:
```bash
cp game-data.json game-data.backup.json
```

To reset the game:
```bash
docker-compose down
rm game-data.json
docker-compose up -d
```

## Troubleshooting

### Container won't start:
```bash
docker-compose logs
```

### Port already in use:
Change the host port in `docker-compose.yml` or your `docker run` command.

### Permission issues with volumes:
Make sure the files exist before starting:
```bash
touch game-data.json
chmod 666 game-data.json config.json
```
