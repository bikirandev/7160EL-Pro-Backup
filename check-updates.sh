#!/bin/bash

# Auto-update status checker
# Checks the current configuration and status of auto-updates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Auto-Update Configuration Status${NC}"
echo "======================================="

# Check package.json configuration
echo -e "${YELLOW}📦 Package Configuration:${NC}"
if [ -f "package.json" ]; then
    VERSION=$(node -p "require('./package.json').version")
    APP_ID=$(node -p "require('./package.json').build?.appId || 'Not set'")
    PROVIDER=$(node -p "require('./package.json').build?.publish?.provider || 'Not set'")
    REPO_OWNER=$(node -p "require('./package.json').build?.publish?.owner || 'Not set'")
    REPO_NAME=$(node -p "require('./package.json').build?.publish?.repo || 'Not set'")
    
    echo "  Version: $VERSION"
    echo "  App ID: $APP_ID"
    echo "  Publish Provider: $PROVIDER"
    echo "  Repository: $REPO_OWNER/$REPO_NAME"
else
    echo -e "${RED}❌ package.json not found${NC}"
fi

echo ""

# Check dependencies
echo -e "${YELLOW}📚 Dependencies:${NC}"
DEPS_OK=true

if node -e "require('electron-updater')" 2>/dev/null; then
    UPDATER_VERSION=$(node -p "require('electron-updater/package.json').version")
    echo -e "  ${GREEN}✅ electron-updater: $UPDATER_VERSION${NC}"
else
    echo -e "  ${RED}❌ electron-updater not installed${NC}"
    DEPS_OK=false
fi

if node -e "require('electron-log')" 2>/dev/null; then
    LOG_VERSION=$(node -p "require('electron-log/package.json').version")
    echo -e "  ${GREEN}✅ electron-log: $LOG_VERSION${NC}"
else
    echo -e "  ${RED}❌ electron-log not installed${NC}"
    DEPS_OK=false
fi

echo ""

# Check files
echo -e "${YELLOW}📁 Auto-Update Files:${NC}"
FILES_OK=true

if [ -f "src/utils/AutoUpdater.js" ]; then
    echo -e "  ${GREEN}✅ AutoUpdater.js${NC}"
else
    echo -e "  ${RED}❌ AutoUpdater.js missing${NC}"
    FILES_OK=false
fi

if [ -f "src/Api/UpdaterApi.js" ]; then
    echo -e "  ${GREEN}✅ UpdaterApi.js${NC}"
else
    echo -e "  ${RED}❌ UpdaterApi.js missing${NC}"
    FILES_OK=false
fi

if grep -q "AutoUpdater" "src/main.js" 2>/dev/null; then
    echo -e "  ${GREEN}✅ AutoUpdater integrated in main.js${NC}"
else
    echo -e "  ${RED}❌ AutoUpdater not integrated in main.js${NC}"
    FILES_OK=false
fi

if grep -q "checkForUpdates\|downloadUpdate" "src/ApiRegistry.js" 2>/dev/null; then
    echo -e "  ${GREEN}✅ Updater API registered${NC}"
else
    echo -e "  ${RED}❌ Updater API not registered${NC}"
    FILES_OK=false
fi

echo ""

# Check GitHub Actions
echo -e "${YELLOW}🚀 GitHub Actions:${NC}"
ACTIONS_OK=true

if [ -f ".github/workflows/release.yml" ]; then
    echo -e "  ${GREEN}✅ Release workflow${NC}"
else
    echo -e "  ${RED}❌ Release workflow missing${NC}"
    ACTIONS_OK=false
fi

if [ -f ".github/workflows/manual-release.yml" ]; then
    echo -e "  ${GREEN}✅ Manual release workflow${NC}"
else
    echo -e "  ${YELLOW}⚠️  Manual release workflow missing${NC}"
fi

echo ""

# Check GitHub repository
echo -e "${YELLOW}🌐 GitHub Repository:${NC}"
REPO_OK=true

if git remote get-url origin &>/dev/null; then
    ORIGIN_URL=$(git remote get-url origin)
    echo "  Origin: $ORIGIN_URL"
    
    if [[ "$ORIGIN_URL" == *"github.com"* ]]; then
        echo -e "  ${GREEN}✅ GitHub repository detected${NC}"
    else
        echo -e "  ${RED}❌ Not a GitHub repository${NC}"
        REPO_OK=false
    fi
else
    echo -e "  ${RED}❌ No git remote origin${NC}"
    REPO_OK=false
fi

# Check latest releases
if [ "$REPO_OK" = true ] && command -v curl &>/dev/null; then
    echo -e "${YELLOW}📋 Latest Releases:${NC}"
    if curl -s "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases?per_page=3" | grep -q "tag_name"; then
        curl -s "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases?per_page=3" | \
        node -e "
            const releases = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
            releases.forEach(r => console.log(\`  \${r.tag_name} - \${r.published_at.split('T')[0]} \${r.draft ? '(draft)' : ''}\`));
        " 2>/dev/null || echo "  No releases found or API error"
    else
        echo "  No releases found"
    fi
fi

echo ""

# Overall status
echo -e "${BLUE}📊 Overall Status:${NC}"
if [ "$DEPS_OK" = true ] && [ "$FILES_OK" = true ] && [ "$ACTIONS_OK" = true ] && [ "$REPO_OK" = true ]; then
    echo -e "${GREEN}✅ Auto-update system is properly configured!${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Ready to create releases:${NC}"
    echo "  ./release.sh patch   # For bug fixes"
    echo "  ./release.sh minor   # For new features"
    echo "  ./release.sh major   # For breaking changes"
else
    echo -e "${RED}❌ Auto-update system needs attention${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Recommended actions:${NC}"
    
    if [ "$DEPS_OK" = false ]; then
        echo "  - Install missing dependencies: yarn add electron-updater electron-log"
    fi
    
    if [ "$FILES_OK" = false ]; then
        echo "  - Ensure all auto-updater files are properly set up"
    fi
    
    if [ "$ACTIONS_OK" = false ]; then
        echo "  - Set up GitHub Actions workflows"
    fi
    
    if [ "$REPO_OK" = false ]; then
        echo "  - Configure GitHub repository properly"
    fi
fi

echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "  AUTO_UPDATE_GUIDE.md - Complete setup guide"
echo "  TESTING_AUTO_UPDATE.md - Testing instructions"
