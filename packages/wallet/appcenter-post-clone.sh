#!/usr/bin/env bash

# install dependencies from the monorepo root
cd ../..
yarn
cd ./packages/wallet

# move to native folder and fix local dependencies
#cd .. && cd native && node scripts/appcenter-postclone.js

# install pods
cd ios
pod install
cd ../
