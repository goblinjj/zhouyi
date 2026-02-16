#!/bin/bash
set -e

# Clean
rm -rf dist
mkdir -p dist

# Copy homepage and SEO files
cp index.html dist/
cp style.css dist/
cp robots.txt dist/
cp sitemap.xml dist/

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

# Deploy
if [ "$1" = "--deploy" ] || [ "$1" = "-d" ]; then
  echo "Pushing to GitHub..."
  git add -A
  git commit -m "${2:-Update and deploy}" --allow-empty
  git push

  echo "Deploying to Cloudflare Pages..."
  npx wrangler pages deploy dist --project-name=zhouyi --branch=main --commit-dirty=true

  echo "Done! Site live at https://zhouyi-dbn.pages.dev"
fi
