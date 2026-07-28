#!/bin/bash
# ============================================================
#  ClaimRunner — one-click local launcher (macOS)
#  Double-click this file to build and run the app.
#  When you see "ClaimRunner backend listening", the app is ready.
# ============================================================

cd "$(dirname "$0")" || exit 1

echo ""
echo "=== ClaimRunner local launcher ==="
echo ""

# --- 1. Check Node.js ---------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed."
  echo "Please download and install it from https://nodejs.org (LTS version),"
  echo "then double-click this file again."
  open "https://nodejs.org" 2>/dev/null
  read -r -p "Press Enter to close..."
  exit 1
fi
echo "✓ Node.js found: $(node --version)"

# --- 2. Create server/.env if missing -----------------------
if [ ! -f server/.env ]; then
  echo "✓ Creating server/.env"
  cat > server/.env <<'EOF'
SUPABASE_URL=https://yolfaluimelplhjfnyxy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbGZhbHVpbWVscGxoamZueXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjA5NDgsImV4cCI6MjA5NzY5Njk0OH0.YJFwX-DwKa4xx3ISAg7bZLsazLyJkJMdHSPQ6cRGFvY
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Nw9-fm4SDUNtSarwjmMfDw_TYM_Yo7-
PORT=5555
PDF_TEMPLATE_PATH=./templates/notice-of-small-claim-september-2025.pdf
GROQ_API_KEY=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
EOF
else
  echo "✓ server/.env already exists"
fi

# --- 3. Install dependencies (first run only) ---------------
if [ ! -d node_modules ]; then
  echo "Installing frontend dependencies (first run only, a few minutes)..."
  npm install || { echo "ERROR: frontend npm install failed."; read -r -p "Press Enter to close..."; exit 1; }
fi
if [ ! -d server/node_modules ]; then
  echo "Installing server dependencies (first run only)..."
  (cd server && npm install) || { echo "ERROR: server npm install failed."; read -r -p "Press Enter to close..."; exit 1; }
fi
echo "✓ Dependencies installed"

# --- 4. Build the frontend (first run only) ------------------
if [ ! -f build/index.html ]; then
  echo "Building the frontend (first run only)..."
  npm run build || { echo "ERROR: frontend build failed."; read -r -p "Press Enter to close..."; exit 1; }
fi
echo "✓ Frontend build ready"

# --- 5. Build the server (first run only) --------------------
if [ ! -f server/dist/server.js ]; then
  echo "Building the server (first run only)..."
  (cd server && npm run build) || { echo "ERROR: server build failed."; read -r -p "Press Enter to close..."; exit 1; }
fi
echo "✓ Server build ready"

# --- 6. Start ------------------------------------------------
echo ""
echo "Starting ClaimRunner at http://localhost:5555"
echo "Keep this window open while testing. Press Ctrl+C to stop."
echo ""
( sleep 3 && open "http://localhost:5555" ) &
cd server && npm start
