#!/bin/bash
# Build script for Netlify - generates static data before building

set -e

echo "🔧 Step 1: Generating static data..."
node scripts/build-static-data.js

echo ""
echo "🏗️  Step 2: Building Next.js app..."
next build
