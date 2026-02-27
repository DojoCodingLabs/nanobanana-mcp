---
name: image-prompting
description: >
  Best practices for AI image generation prompts with Gemini models.
  Activated when the user works with nanobanana image generation or editing tools.
  Provides guidance on prompt structure, style keywords, and iterative refinement.
---

# Image Prompting Best Practices

When helping users generate or edit images with nanobanana, apply these guidelines.

## Prompt Structure for Generation

A strong image prompt follows this pattern:
**[Subject] + [Style] + [Composition] + [Lighting/Mood] + [Details]**

Example: "A cozy coffee shop interior, watercolor illustration style, wide angle view, warm golden lighting, with plants on shelves and a cat sleeping on a chair"

## Model Selection Guide

nanobanana supports three Gemini models via the `NANOBANANA_MODEL` env var:

| Model | Best For |
|-------|----------|
| `gemini-2.5-flash-image` (default) | Fast generation, prototyping, high-volume work |
| `gemini-3-pro-image-preview` | Complex prompts, text rendering in images, high quality |
| `gemini-3.1-flash-image-preview` | Latest features, advanced capabilities |

Recommend model changes when appropriate:
- User needs text in the image -> suggest Pro
- User is iterating rapidly -> stick with Flash (default)
- User wants highest quality for final output -> suggest Pro

## Editing Best Practices

When using `edit_image` or `continue_editing`:
- Be specific about what to change: "Make the sky more orange" not "improve the colors"
- Reference specific areas: "Add a tree in the bottom-left corner"
- For style transfer, use reference images via the `referenceImages` parameter
- Each edit creates a new file -- the original is always preserved

## Constraints

- Prompts over 10,000 characters will be rejected
- Image files must be under 20MB
- Supported input formats: JPEG, PNG, WebP, GIF
- Output is always PNG
- File paths must resolve within `$HOME` or `$TMPDIR` (security constraint)
- Images are saved to `~/nanobanana-images/`

## Iterative Workflow

The most effective image workflow is:
1. Generate a base image with a detailed prompt
2. Use `continue_editing` for incremental refinements
3. Each iteration should address ONE specific change
4. If the result diverges too far, start fresh with `generate_image`
