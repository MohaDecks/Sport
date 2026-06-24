#!/bin/bash
# District Sports — Live Demo Helper
# Run: bash scripts/start-demo.sh

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo -e "${BLUE}  District Sports — Demo Diyaarinta${NC}"
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo ""

# Check MongoDB indirectly via backend health
check_backend() {
  curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/health 2>/dev/null
}

check_admin() {
  curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null
}

check_mobile() {
  curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/ 2>/dev/null
}

echo "Hubinta services..."
BACKEND=$(check_backend)
ADMIN=$(check_admin)
MOBILE=$(check_mobile)

[ "$BACKEND" = "200" ] && echo -e "  Backend (5001):  ${GREEN}✓ Socda${NC}" || echo "  Backend (5001):  ✗ Ma socdo — cd backend && npm run dev"
[ "$ADMIN" = "200" ]   && echo -e "  Admin (5173):    ${GREEN}✓ Socda${NC}"   || echo "  Admin (5173):    ✗ Ma socdo — cd admin-portal && npm run dev"
[ "$MOBILE" = "200" ]  && echo -e "  Mobile (8081):   ${GREEN}✓ Socda${NC}"   || echo "  Mobile (8081):   ✗ Ma socdo — cd mobile-app && npm start"

echo ""
echo "Furitaanka browser tabs..."
sleep 1
open "http://localhost:5173/login" 2>/dev/null
sleep 2
open "http://localhost:8081" 2>/dev/null
sleep 1
open "http://localhost:5001/api/health" 2>/dev/null

echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  QUICKTIME RECORDING — 5 TALAABO${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo "  1. QuickTime Player fur"
echo "  2. File → New Screen Recording"
echo "  3. Riix Record → dooro screen-ka"
echo "  4. Raac script-ka: scripts/DEMO-SCRIPT-SOMALI.md"
echo "  5. Stop → Save (District-Sports-Demo.mp4)"
echo ""
echo "Login credentials:"
echo "  Admin:  admin@dsms.com / admin123"
echo "  Coach:  ahmed@dsms.com / coach123"
echo ""
