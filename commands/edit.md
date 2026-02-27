---
description: Edit an existing image with a text description of changes
---

# Edit Image

The user wants to edit an existing image using nanobanana.

## Instructions

1. Determine the image to edit:
   - If a file path was provided (e.g., `/nanobanana:edit ~/nanobanana-images/generated-2026-02-26.png`), use that path.
   - If no path was provided, check if there is a recently generated image the user likely wants to edit. Look in `~/nanobanana-images/` for the most recent file.
   - If ambiguous, ask the user which image they want to edit.

2. Determine the edit instructions:
   - If provided after the path, use those directly.
   - If not provided, ask what changes they want to make.

3. Call the appropriate MCP tool:
   - If editing a specific file: use `edit_image` with `imagePath` and `prompt`
   - If continuing from the last generation in this session: use `continue_editing` with just `prompt`

4. If the user mentions reference images (e.g., "make it look like this style"), ask for the file paths to include as `referenceImages`.

5. After editing, display the result and offer next steps:
   - Use `continue_editing` for further iterative refinements
   - The edited version is saved as a new file (original is preserved)
