#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Widamine TMUX Session Starter        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Kill existing tmux sessions
tmux kill-session -t widamine-api 2>/dev/null
tmux kill-session -t widamine-admin 2>/dev/null
tmux kill-session -t widamine-landing 2>/dev/null
sleep 1

# Start API
echo -e "${BLUE}[1/3]${NC} Starting API in tmux session 'widamine-api'..."
tmux new-session -d -s widamine-api
tmux send-keys -t widamine-api "cd /home/alae/Documents/repos/widamine/api" C-m
tmux send-keys -t widamine-api "npm run start:dev" C-m
echo -e "${GREEN}✓${NC} API session created"

# Start Admin
echo -e "${BLUE}[2/3]${NC} Starting Admin in tmux session 'widamine-admin'..."
tmux new-session -d -s widamine-admin
tmux send-keys -t widamine-admin "cd /home/alae/Documents/repos/widamine/new-widamine" C-m
tmux send-keys -t widamine-admin "npm run dev -- --port 5174 --host" C-m
echo -e "${GREEN}✓${NC} Admin session created"

# Start Landing
echo -e "${BLUE}[3/3]${NC} Starting Landing in tmux session 'widamine-landing'..."
tmux new-session -d -s widamine-landing
tmux send-keys -t widamine-landing "cd /home/alae/Documents/repos/widamine/landing" C-m
tmux send-keys -t widamine-landing "npm run dev" C-m
echo -e "${GREEN}✓${NC} Landing session created"

sleep 3

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      All Services Started in TMUX      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🗄️  Database:${NC}       PostgreSQL @ 91.98.161.53:5420"
echo -e "${BLUE}🔌 API:${NC}             http://localhost:3000"
echo -e "${BLUE}👨‍💼 Admin:${NC}           http://localhost:5174"
echo -e "${BLUE}🌐 Landing:${NC}          http://localhost:5173"
echo ""
echo -e "${BLUE}📺 Attach to sessions:${NC}"
echo -e "   tmux attach -t widamine-api"
echo -e "   tmux attach -t widamine-admin"
echo -e "   tmux attach -t widamine-landing"
echo ""
echo -e "${BLUE}📋 List sessions:${NC}"
echo -e "   tmux ls"
echo ""
echo -e "${BLUE}🛑 Stop all services:${NC}"
echo -e "   tmux kill-session -t widamine-api"
echo -e "   tmux kill-session -t widamine-admin"
echo -e "   tmux kill-session -t widamine-landing"
echo ""
echo -e "${BLUE}🧪 Test category pages:${NC}"
echo -e "   http://localhost:5173/category/visage"
echo -e "   http://localhost:5173/category/corps"
echo -e "   http://localhost:5173/category/techniques"
echo ""
