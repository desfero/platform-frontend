#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

source ~/.bashrc

# setup node version (will use version from .nvmrc)
nvm install
nvm alias default node

npm install --global yarn
