#!/usr/bin/env bash
#
# Dogfood CLI Installation Script
# https://trydogfooding.com
#
# Usage: curl -fsSL https://get.trydogfooding.com | bash
#

set -e

# Formatting variables
BOLD="\033[1m"
GREEN="\033[32m"
RED="\033[31m"
YELLOW="\033[33m"
RESET="\033[0m"

echo -e "${BOLD}Dogfood CLI Installer${RESET}\n"

# 1. Check for Node.js
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}Error: Node.js is not installed.${RESET}"
  echo "Dogfood requires Node.js v20 or higher."
  echo "Please install Node.js (https://nodejs.org) and try again."
  exit 1
fi

# 2. Check Node version (simple major version check)
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo -e "${RED}Error: Node.js v20 or higher is required.${RESET}"
  echo "You are running v${NODE_VERSION}. Please upgrade Node.js."
  exit 1
fi

# 3. Check for NPM
if ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED}Error: npm is not installed.${RESET}"
  echo "npm should have been installed with Node.js."
  exit 1
fi

# 4. Install the CLI globally
echo "Installing @trydogfooding/cli globally via npm..."

if npm install -g @trydogfooding/cli >/dev/null 2>&1; then
  echo -e "\n${GREEN}✔ Dogfood CLI installed successfully!${RESET}"
else
  echo -e "\n${YELLOW}Permission denied. Trying with sudo...${RESET}"
  sudo npm install -g @trydogfooding/cli
  echo -e "\n${GREEN}✔ Dogfood CLI installed successfully!${RESET}"
fi

# 5. Post-install checks & Claude Code warning
echo -e "\n${BOLD}Next steps:${RESET}"

if ! command -v claude >/dev/null 2>&1; then
  echo -e "1. ${YELLOW}Install Claude Code${RESET} (required to run workflows):"
  echo "   npm install -g @anthropic-ai/claude-code"
  echo -e "2. Authenticate Claude Code with your Anthropic account."
  echo "3. Run ${BOLD}dogfood init <workspace-path>${RESET} to get started."
else
  echo -e "1. Run ${BOLD}dogfood init <workspace-path>${RESET} to get started."
fi

echo -e "\nHappy building!"
