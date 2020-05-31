#!/usr/bin/env bash

# use the proper nvm version from our .nvmrc
node -v

# install dependencies from the monorepo root
cd ../..
yarn
cd ./packages/wallet

# fix local dependencies
node scripts/appcenter-postclone.js

# install pods
cd ios
pod install
cd ..

# move yarn.lock to wallet package to force AppCenter to use yarn
mv ../../yarn.lock ./yarn.lock

# Creates an .env from ENV variables for use with react-native-config
ENV_WHITELIST="^NF_"
printf "Creating an .env file with the following whitelist:\n"
env | egrep $ENV_WHITELIST > .env
printf "\n.env created with contents:\n"
cat .env
