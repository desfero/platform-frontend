#!/usr/bin/env bash

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
