#!/bin/bash
set -e

# Clean
rm -rf dist
mkdir -p dist

# Copy homepage
cp index.html dist/
cp style.css dist/

# Build Astrology
cd Astrology
npm install
npm run build
cd ..
cp -r Astrology/dist dist/astrology

# Build hexagram
cd hexagram
npm install
npm run build
cd ..
cp -r hexagram/dist dist/hexagram

echo "Build complete. Output in dist/"
