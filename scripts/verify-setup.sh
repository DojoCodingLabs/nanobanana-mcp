#!/bin/bash
# nanobanana-mcp — Session Start Hook
# Verifies GEMINI_API_KEY is configured and output directory exists

IMAGES_DIR="$HOME/nanobanana-images"

# Create output directory if it doesn't exist
mkdir -p "$IMAGES_DIR"

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Warning: GEMINI_API_KEY is not set. nanobanana image generation will not work."
  echo "Set it in your environment or Claude Code settings."
fi

exit 0
