#!/bin/bash
# Build script for Netlify - fetches memory data from GitHub then builds

set -e

# Detect if running on Netlify vs local
if [ -n "$NETLIFY" ]; then
  echo "🌐 Running on Netlify - fetching memory data from GitHub..."
  
  # Use GitHub token if available for private repo access
  if [ -n "$GITHUB_TOKEN" ]; then
    git clone --depth 1 "https://${GITHUB_TOKEN}@github.com/AnanasYang/ai-memory-system.git" /tmp/ai-memory-system 2>/dev/null || {
      echo "⚠️  GitHub token clone failed, trying public clone..."
      git clone --depth 1 https://github.com/AnanasYang/ai-memory-system.git /tmp/ai-memory-system
    }
  else
    git clone --depth 1 https://github.com/AnanasYang/ai-memory-system.git /tmp/ai-memory-system
  fi
  
  echo "✅ Memory data cloned to /tmp/ai-memory-system"
  ls -la /tmp/ai-memory-system/Memory/ 2>/dev/null || echo "⚠️  Memory dir not found in cloned repo"
else
  echo "💻 Running locally - using local ai-memory-system path"
fi

echo ""
echo "🔧 Step 1: Generating static data..."
node scripts/build-static-data.js

echo ""
echo "🏗️  Step 2: Building Next.js app..."
next build
