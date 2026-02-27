---
description: Generate a new image from a text description using Gemini
---

# Generate Image

The user wants to generate a new image using nanobanana.

## Instructions

1. If the user provided a prompt after the command (e.g., `/nanobanana:generate a sunset over mountains`), use that as the image prompt directly.

2. If no prompt was provided, ask the user what they want to generate. Suggest being specific about: subject, style, colors, composition, and mood.

3. Call the `generate_image` MCP tool with the prompt.

4. After generation, display the result and remind the user:
   - The image was saved to `~/nanobanana-images/`
   - They can use `/nanobanana:edit` or say "continue editing" to refine it
   - Provide 2-3 specific refinement suggestions based on the generated image

## Prompt Enhancement Tips

If the user's prompt is very short (under 20 words), consider suggesting enhancements:
- Add style descriptors: "photorealistic", "watercolor", "flat illustration", "3D render"
- Add composition: "close-up", "wide angle", "bird's eye view", "centered"
- Add lighting: "golden hour", "dramatic lighting", "soft diffused light"
- Add mood: "serene", "energetic", "mysterious", "professional"

Do NOT auto-enhance without asking -- just suggest improvements and let the user decide.
