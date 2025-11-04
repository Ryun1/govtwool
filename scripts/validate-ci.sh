#!/bin/bash

# CI/CD Validation Script
# Validates GitHub Actions workflows and project setup

set -e

echo "🔍 Validating CI/CD setup..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if workflows directory exists
if [ ! -d ".github/workflows" ]; then
    echo -e "${RED}❌ .github/workflows directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Workflows directory exists${NC}"

# Check for required workflows
required_workflows=("ci.yml")
for workflow in "${required_workflows[@]}"; do
    if [ ! -f ".github/workflows/$workflow" ]; then
        echo -e "${YELLOW}⚠️  Warning: $workflow not found${NC}"
    else
        echo -e "${GREEN}✅ Found $workflow${NC}"
    fi
done

# Validate YAML syntax (basic check)
echo ""
echo "🔍 Checking YAML syntax..."
for workflow in .github/workflows/*.yml; do
    if [ -f "$workflow" ]; then
        # Basic YAML structure check
        if grep -q "^name:" "$workflow" && grep -q "^on:" "$workflow" && grep -q "^jobs:" "$workflow"; then
            echo -e "${GREEN}✅ $(basename $workflow) has valid structure${NC}"
        else
            echo -e "${RED}❌ $(basename $workflow) may have invalid structure${NC}"
            exit 1
        fi
    fi
done

# Check Node.js version
echo ""
echo "🔍 Checking Node.js version..."
if command -v node &> /dev/null; then
    node_version=$(node --version | cut -d'v' -f2)
    required_version="20.9.0"
    
    if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then
        echo -e "${GREEN}✅ Node.js version $node_version meets requirement (>= $required_version)${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js version $node_version may not meet requirement (>= $required_version)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Node.js not found in PATH${NC}"
fi

# Check if npm scripts exist
echo ""
echo "🔍 Checking npm scripts..."
if [ -f "package.json" ]; then
    if grep -q '"lint"' package.json; then
        echo -e "${GREEN}✅ lint script found${NC}"
    else
        echo -e "${YELLOW}⚠️  lint script not found${NC}"
    fi
    
    if grep -q '"build"' package.json; then
        echo -e "${GREEN}✅ build script found${NC}"
    else
        echo -e "${RED}❌ build script not found${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ CI/CD validation complete!${NC}"
echo ""
echo "💡 Next steps:"
echo "   1. Push to GitHub to trigger workflows"
echo "   2. Check Actions tab for workflow runs"
echo "   3. Set up GitHub Secrets if deploying"
