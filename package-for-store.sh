#!/bin/bash

# Script to package the Chrome extension for submission to Chrome Web Store
# This excludes development files and creates a clean production zip

echo "📦 Packaging LLM Prompt Library for Chrome Web Store..."

# Create a temporary directory for packaging
TEMP_DIR="./temp_package"
ZIP_NAME="llm-prompt-library-v1.0.0.zip"

# Remove old package and temp directory if they exist
rm -rf "$TEMP_DIR"
rm -f "$ZIP_NAME"

# Create temp directory
mkdir -p "$TEMP_DIR"

echo "📋 Copying production files..."

# Copy necessary files and directories
cp manifest.json "$TEMP_DIR/"
cp -r popup "$TEMP_DIR/"
cp -r background "$TEMP_DIR/"
cp -r assets "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp PRIVACY.md "$TEMP_DIR/"

# Remove any backup files or unwanted files from the temp directory
find "$TEMP_DIR" -name "*.backup" -delete
find "$TEMP_DIR" -name ".DS_Store" -delete

echo "🗜️  Creating ZIP archive..."

# Create the zip file from the temp directory
cd "$TEMP_DIR"
zip -r "../$ZIP_NAME" ./*
cd ..

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo "✅ Package created: $ZIP_NAME"
echo ""
echo "📝 Next steps:"
echo "1. Go to https://chrome.google.com/webstore/devconsole"
echo "2. Upload $ZIP_NAME"
echo "3. Fill in store listing details (screenshots, description, etc.)"
echo "4. Submit for review"
echo ""
echo "Note: Make sure you have prepared:"
echo "  - Screenshots (1280x800px)"
echo "  - Small promotional tile (440x280px)"
echo "  - Store description and detailed description"
