#!/bin/bash

echo "========================================"
echo "  Pirate's Treasure Hunt Server"
echo "========================================"
echo ""
echo "Starting local web server..."
echo ""
echo "Your app will be available at:"
echo "  http://localhost:8000"
echo ""
echo "Share this URL with guests on your network:"
IP=$(hostname -I | awk '{print $1}')
echo "  http://$IP:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

python3 -m http.server 8000
