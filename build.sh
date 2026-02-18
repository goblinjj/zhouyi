#!/bin/bash
set -e

BUILD_VER=$(date +%s)

# Clean
rm -rf dist
mkdir -p dist

# Copy homepage and SEO files, inject version
sed "s/__BUILD_VER__/$BUILD_VER/g" index.html > dist/index.html
cp style.css dist/
cp robots.txt dist/
cp sitemap.xml dist/
cp llms.txt dist/
cp favicon.svg dist/

# Build Astrology
cd Astrology
npm install
npm run build
cd ..
cp -r Astrology/dist dist/astrology
# SPA fallback: copy index.html to sub-routes for direct navigation
mkdir -p dist/astrology/dianji dist/astrology/stars
cp Astrology/dist/index.html dist/astrology/dianji/index.html
cp Astrology/dist/index.html dist/astrology/stars/index.html

# Build hexagram (Vite handles JS/CSS hashing, but HTML refs need version)
cd hexagram
npm install
npm run build
cd ..
cp -r hexagram/dist dist/hexagram
sed -i '' "s/__BUILD_VER__/$BUILD_VER/g" dist/hexagram/index.html dist/hexagram/study.html

# Generate SEO static pages (hexagram, stars, classics) + update sitemap
node scripts/generate-seo-pages.js

# Copy Cloudflare Pages Functions
if [ -d "functions" ]; then
  cp -r functions dist/functions
fi

echo "Build complete (v=$BUILD_VER). Output in dist/"

# Deploy
if [ "$1" = "--deploy" ] || [ "$1" = "-d" ]; then
  echo "Pushing to GitHub..."
  git add -A
  git commit -m "${2:-Update and deploy}" --allow-empty
  git push

  echo "Deploying to Cloudflare Pages..."
  npx wrangler pages deploy dist --project-name=zhouyi --branch=main --commit-dirty=true

  echo "Deploying MCP server..."
  cd mcp-server && npx wrangler deploy && cd ..

  echo "Done! Site live at https://zhouyi.goblin.top"
  echo "MCP server at https://zhouyi-mcp.goblin.top/mcp"
fi
