---
description: List recently generated images in ~/nanobanana-images/
---

# Gallery

The user wants to see their recently generated and edited images.

## Instructions

1. List the contents of `~/nanobanana-images/` sorted by modification time (newest first).

2. Display the results in a clean table format showing filename, size, date, and whether it was generated or edited.

3. Determine generated vs edited from the filename prefix (`generated-*` vs `edited-*`).

4. Show the 10 most recent files by default. If the user asks for more, show all.

5. If the directory is empty or does not exist, tell the user:
   "No images yet. Use `/nanobanana:generate` to create your first image."
