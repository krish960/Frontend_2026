#!/usr/bin/env bash
# ============================================================
#  PortfolioAI Frontend — One-Click Setup Script
#  Usage:  cd frontend && bash setup.sh
# ============================================================

set -e
CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   PortfolioAI Frontend Setup${NC}"
echo -e "${CYAN}   React 18 + Tailwind CSS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Node check
NODE=$(node --version 2>&1 || echo "missing")
if [[ "$NODE" == "missing" ]]; then
    echo -e "${YELLOW}Node.js not found. Install from https://nodejs.org${NC}"; exit 1
fi
echo -e "${GREEN}[OK]${NC}    $NODE found"

# .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}[WARN]${NC}  .env created from example. Edit if needed."
else
    echo -e "${GREEN}[OK]${NC}    .env exists"
fi

# Install
echo -e "${CYAN}[INFO]${NC}  Installing npm packages (this may take a minute)..."
npm install --legacy-peer-deps
echo -e "${GREEN}[OK]${NC}    node_modules installed"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Frontend Ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Start dev:   ${CYAN}npm start${NC}"
echo -e "  Opens at:    ${CYAN}http://localhost:3000${NC}"
echo ""
