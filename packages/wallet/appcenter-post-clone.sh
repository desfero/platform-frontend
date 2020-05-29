#!/usr/bin/env bash

# use the proper nvm version from our .nvmrc
nvm install

# install dependencies from the monorepo root
cd ../..
yarn
cd ./packages/wallet

# fix local dependencies
node scripts/appcenter-postclone.js

# install pods
cd ios
pod install
cd ../

# move yarn.lock to wallet package to force AppCenter to use yarn
mv ../../yarn.lock ./yarn.lock


