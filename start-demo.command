#!/bin/zsh
# Double-click in Finder to start BiasBrief locally and open it in the browser.
cd "$(dirname "$0")" || exit 1
BUN="$HOME/.bun/bin/bun"
if [ ! -x "$BUN" ]; then echo "Bun isn't installed: run  curl -fsSL https://bun.sh/install | bash"; read -k1; exit 1; fi
if [ ! -f .env.local ]; then echo "Missing .env.local with GOOGLE_API_KEY=... (YouTube sections will be empty)."; fi
[ -d node_modules ] || "$BUN" install
(sleep 4 && open "http://localhost:8080") &
echo "BiasBrief: http://localhost:8080  (same Wi-Fi: http://$(ipconfig getifaddr en0 2>/dev/null || echo '<your-ip>'):8080)"
echo "Keep this window open during the demo. Press Ctrl+C to stop."
exec "$BUN" --bun vite dev
