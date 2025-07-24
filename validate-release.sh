#!/bin/bash

# Pre-release validation script
# Validates the app before creating a release

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Running pre-release validation...${NC}"

# Check package.json exists and is valid
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

# Validate package.json
echo -e "${YELLOW}📋 Validating package.json...${NC}"
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" || {
    echo -e "${RED}❌ Invalid package.json${NC}"
    exit 1
}

# Check required fields in package.json
REQUIRED_FIELDS=("name" "version" "main" "build.appId" "build.publish.provider")
for field in "${REQUIRED_FIELDS[@]}"; do
    if ! node -e "const pkg = require('./package.json'); const value = pkg['$field'] || (pkg.build && pkg.build['${field#build.}']) || (pkg.build && pkg.build.publish && pkg.build.publish['${field#build.publish.}']); if (!value) process.exit(1);" 2>/dev/null; then
        echo -e "${RED}❌ Missing required field: $field${NC}"
        exit 1
    fi
done

# Check if main file exists
MAIN_FILE=$(node -p "require('./package.json').main")
if [ ! -f "$MAIN_FILE" ]; then
    echo -e "${RED}❌ Main file not found: $MAIN_FILE${NC}"
    exit 1
fi

# Check if icon exists
ICON_PATH=$(node -p "require('./package.json').build.win.icon" 2>/dev/null || echo "")
if [ -n "$ICON_PATH" ] && [ ! -f "$ICON_PATH" ]; then
    echo -e "${YELLOW}⚠️  Warning: Icon file not found: $ICON_PATH${NC}"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules not found. Run 'yarn install' first${NC}"
    exit 1
fi

# Check for security vulnerabilities
echo -e "${YELLOW}🔒 Checking for security vulnerabilities...${NC}"
if yarn audit --level moderate --summary 2>/dev/null | grep -q "vulnerabilities found"; then
    echo -e "${YELLOW}⚠️  Security vulnerabilities found. Consider running 'yarn audit fix'${NC}"
fi

# Check if AutoUpdater is properly configured
echo -e "${YELLOW}🔄 Checking auto-updater configuration...${NC}"
if [ ! -f "src/utils/AutoUpdater.js" ]; then
    echo -e "${RED}❌ AutoUpdater not found${NC}"
    exit 1
fi

# Check if electron-updater is installed
if ! node -e "require('electron-updater')" 2>/dev/null; then
    echo -e "${RED}❌ electron-updater not installed${NC}"
    exit 1
fi

# Check GitHub repository configuration
REPO_URL=$(node -p "require('./package.json').repository?.url || ''" 2>/dev/null)
if [ -z "$REPO_URL" ]; then
    echo -e "${YELLOW}⚠️  Warning: Repository URL not set in package.json${NC}"
fi

# Validate publish configuration
PUBLISH_PROVIDER=$(node -p "require('./package.json').build?.publish?.provider || ''" 2>/dev/null)
if [ "$PUBLISH_PROVIDER" != "github" ]; then
    echo -e "${RED}❌ Publish provider must be 'github'${NC}"
    exit 1
fi

# Check if GitHub Actions workflows exist
if [ ! -f ".github/workflows/release.yml" ]; then
    echo -e "${YELLOW}⚠️  Warning: GitHub Actions release workflow not found${NC}"
fi

# Test build process (quick check)
echo -e "${YELLOW}🏗️  Testing build configuration...${NC}"
if ! yarn electron-builder --dir &>/dev/null; then
    echo -e "${RED}❌ Build test failed${NC}"
    exit 1
fi

# Check for large files that shouldn't be in the build
echo -e "${YELLOW}📏 Checking for large files...${NC}"
find . -name "*.log" -size +10M -not -path "./node_modules/*" -not -path "./dist/*" | while read file; do
    echo -e "${YELLOW}⚠️  Large file found: $file${NC}"
done

# Clean up test build
rm -rf dist/

echo -e "${GREEN}✅ Pre-release validation completed successfully!${NC}"
echo -e "${BLUE}📦 Ready for release${NC}"
