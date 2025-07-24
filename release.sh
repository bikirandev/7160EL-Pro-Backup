#!/bin/bash

# Auto-update release script for Pro Backup
# Usage: ./release.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to patch if no argument provided
VERSION_TYPE=${1:-patch}

echo -e "${GREEN}🚀 Starting release process...${NC}"

# Check if we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ Error: You must be on the main branch to create a release${NC}"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Error: You have uncommitted changes. Please commit or stash them first.${NC}"
    exit 1
fi

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    echo -e "${RED}❌ Error: yarn is not installed${NC}"
    exit 1
fi

# Check if we can connect to GitHub
echo -e "${YELLOW}🔍 Checking GitHub connectivity...${NC}"
if ! git ls-remote origin &> /dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to GitHub repository${NC}"
    exit 1
fi

# Run tests if they exist
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    if ! yarn test; then
        echo -e "${RED}❌ Error: Tests failed${NC}"
        exit 1
    fi
fi

# Check if dependencies are up to date
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
yarn install --frozen-lockfile

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}📦 Current version: ${CURRENT_VERSION}${NC}"

# Update version
echo -e "${GREEN}📝 Updating version (${VERSION_TYPE})...${NC}"
yarn version --${VERSION_TYPE} --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}🆕 New version: ${NEW_VERSION}${NC}"

# Commit the version change
echo -e "${GREEN}💾 Committing version change...${NC}"
git add package.json
git commit -m "chore: bump version to ${NEW_VERSION}"

# Create and push tag
echo -e "${GREEN}🏷️  Creating tag v${NEW_VERSION}...${NC}"
git tag "v${NEW_VERSION}"

echo -e "${GREEN}⬆️  Pushing changes and tag...${NC}"
git push origin main
git push origin "v${NEW_VERSION}"

echo -e "${GREEN}✅ Release process completed!${NC}"
echo -e "${YELLOW}🔗 Check the GitHub Actions at: https://github.com/bikirandev/7160EL-Pro-Backup/actions${NC}"
echo -e "${YELLOW}📋 The release will be available at: https://github.com/bikirandev/7160EL-Pro-Backup/releases${NC}"

# Optional: Open GitHub releases page
read -p "📖 Open GitHub releases page? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://github.com/bikirandev/7160EL-Pro-Backup/releases"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://github.com/bikirandev/7160EL-Pro-Backup/releases"
    else
        echo "Please open: https://github.com/bikirandev/7160EL-Pro-Backup/releases"
    fi
fi
