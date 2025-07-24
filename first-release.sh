#!/bin/bash

# First release helper script
# Creates the first release with auto-update functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 First Release with Auto-Updates${NC}"
echo "===================================="

# Check if this is indeed the first release
echo -e "${YELLOW}🔍 Checking release status...${NC}"
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Check for existing releases
if curl -s "https://api.github.com/repos/bikirandev/7160EL-Pro-Backup/releases" | grep -q "tag_name"; then
    echo -e "${YELLOW}ℹ️  Existing releases found. This will create a new release.${NC}"
else
    echo -e "${GREEN}✨ This appears to be your first release!${NC}"
fi

echo ""

# Show what will happen
echo -e "${YELLOW}📋 Release Plan:${NC}"
echo "1. Run pre-release validation"
echo "2. Create a patch release (increment version)"
echo "3. Commit and tag the new version"
echo "4. Push to GitHub (triggers auto-build)"
echo "5. GitHub Actions will build and publish the release"
echo ""

# Confirm with user
read -p "🤔 Continue with first release? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}👋 Release cancelled${NC}"
    exit 0
fi

# Run validation
echo -e "${BLUE}🔍 Running validation...${NC}"
if ! ./validate-release.sh; then
    echo -e "${RED}❌ Validation failed. Please fix issues first.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Validation passed!${NC}"
echo ""

# Create the release
echo -e "${BLUE}🏗️  Creating release...${NC}"
./release.sh patch

echo ""
echo -e "${GREEN}🎉 First release created successfully!${NC}"
echo ""

# Show next steps
echo -e "${YELLOW}📋 What happens next:${NC}"
echo "1. GitHub Actions will build your app for Windows, macOS, and Linux"
echo "2. The built files will be uploaded to GitHub releases"
echo "3. Future app launches will check for updates automatically"
echo ""

echo -e "${YELLOW}🔗 Monitor progress:${NC}"
echo "• GitHub Actions: https://github.com/bikirandev/7160EL-Pro-Backup/actions"
echo "• Releases: https://github.com/bikirandev/7160EL-Pro-Backup/releases"
echo ""

echo -e "${YELLOW}🧪 Testing:${NC}"
echo "• Build the app locally: yarn build"
echo "• Test updater UI: ./test-updater.sh"
echo "• Check status: ./check-updates.sh"
echo ""

echo -e "${GREEN}✨ Your app now has professional auto-updates!${NC}"
echo -e "${BLUE}📖 See AUTO_UPDATE_SUMMARY.md for complete documentation${NC}"
