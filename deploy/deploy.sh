#!/usr/bin/env bash
# Deploy vocalFlow sur VPS
set -euo pipefail

VPS_DIR="/opt/vocal-flow"
REPO="EUREKAI25/vocal-flow"
BRANCH="main"

echo "=== vocalFlow deploy ==="

# 1. Pull latest
cd "$VPS_DIR"
git fetch origin && git reset --hard "origin/$BRANCH"

# 2. Backend
cd "$VPS_DIR/backend"
"$VPS_DIR/venv/bin/pip" install -q -r requirements.txt

# 3. Frontend build
cd "$VPS_DIR/frontend"
npm ci --silent
npm run build

# 4. Restart
systemctl restart vocal-flow
systemctl is-active vocal-flow && echo "✓ vocal-flow actif" || echo "✗ erreur"
echo "=== Terminé ==="
