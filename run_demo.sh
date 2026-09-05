#!/usr/bin/env bash

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "================================================================================"
echo "⚽ CMPE 255: European Soccer Analytics & Pre-Kickoff Prediction Demo Launcher"
echo "================================================================================"

# 1. Check Python & Node
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is required but not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is required but not installed."
    exit 1
fi

# 2. Setup Virtual Environment
if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment (.venv)..."
    python3 -m venv .venv
fi

source .venv/bin/activate

# 3. Install/Update Backend Dependencies
echo "📦 Verifying Python dependencies..."
python -m pip install --upgrade pip --quiet
python -m pip install -r server/requirements.txt --quiet

# 4. Check Dataset & Precomputed Artifacts
if [ ! -f "data/database.sqlite" ]; then
    echo "⚠️ Warning: data/database.sqlite not found."
    echo "Please place the Kaggle database at data/database.sqlite before running."
fi

if [ ! -f "artifacts/metrics.json" ]; then
    echo "⚙️ Generating Data Science model artifacts and training models..."
    PYTHONPATH=. python3 server/ds/runner.py
fi

# 5. Install Frontend Dependencies
echo "📦 Verifying Frontend npm dependencies..."
cd "$PROJECT_DIR/client"
if [ ! -d "node_modules" ]; then
    npm install --quiet
fi
cd "$PROJECT_DIR"

# 6. Trap for Graceful Exit
cleanup() {
    echo ""
    echo "🛑 Shutting down backend and frontend servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 7. Start FastAPI Backend (Port 8000)
echo "🚀 Starting FastAPI Backend on http://127.0.0.1:8000..."
PYTHONPATH=. python3 server/main.py &
BACKEND_PID=$!

# Wait for backend to be healthy
sleep 2

# 8. Start Vite Frontend (Port 5173)
echo "🚀 Starting React/Vite Frontend on http://localhost:5173..."
cd "$PROJECT_DIR/client"
npm run dev -- --host &
FRONTEND_PID=$!

cd "$PROJECT_DIR"
sleep 2

# 9. Open Browser
echo "🌐 Opening http://localhost:5173 in browser..."
if command -v open &> /dev/null; then
    open "http://localhost:5173"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173"
fi

echo "================================================================================"
echo "✅ Application running!"
echo "   - Frontend UI: http://localhost:5173"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs:    http://localhost:8000/docs"
echo "Press Ctrl+C to stop all servers."
echo "================================================================================"

# Keep script running
wait
