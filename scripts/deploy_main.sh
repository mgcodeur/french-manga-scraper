#!/bin/bash
set -e

echo "Deployment started ..."

git reset --hard origin/main

echo "Pulling latest changes from main branch ..."
git pull origin main

echo "Installing npm dependencies ..."
npm install

echo "Building the assets ..."
npm run build

echo "Deployment finished!"