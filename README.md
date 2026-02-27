# nanobanana-mcp

A hardened MCP server for Gemini image generation. Fork of [ConechoAI/Nano-Banana-MCP](https://github.com/ConechoAI/Nano-Banana-MCP) with security fixes, strict TypeScript, and model selection.

## Features

- **3 tools**: `generate_image`, `edit_image`, `continue_editing`
- **Model selection** via `NANOBANANA_MODEL` env var with whitelist validation
- **Security hardened**: path traversal protection, file size limits, no plaintext key storage
- **Strict TypeScript**: zero `any` types, Zod validation on all inputs

## Quick Start

### Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "nanobanana": {
      "command": "npx",
      "args": ["tsx", "/path/to/nanobanana-mcp/src/index.ts"],
      "env": {
        "GEMINI_API_KEY": "your-api-key",
        "NANOBANANA_MODEL": "gemini-2.5-flash-image"
      }
    }
  }
}
```

### Other MCP Clients

```bash
GEMINI_API_KEY=your-key npx tsx src/index.ts
```

The server communicates over stdio using the MCP protocol.

## Tools

### `generate_image`

Generate a new image from a text prompt.

```
prompt (required): Text describing the image to create (max 10,000 chars)
```

### `edit_image`

Edit an existing image with a text prompt.

```
imagePath (required): Full file path to the image to edit
prompt (required): Text describing the modifications (max 10,000 chars)
referenceImages (optional): Array of file paths to reference images
```

### `continue_editing`

Continue editing the last generated/edited image in the current session.

```
prompt (required): Text describing changes to make (max 10,000 chars)
referenceImages (optional): Array of file paths to reference images
```

## Configuration

All configuration is via environment variables. No config files are written to disk.

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `NANOBANANA_GEMINI_API_KEY` | No | Override for `GEMINI_API_KEY` (takes priority) |
| `NANOBANANA_MODEL` | No | Model to use (see below) |

### Available Models

| Model ID | Description |
|----------|-------------|
| `gemini-2.5-flash-image` | Fast generation, good for high-volume use (default) |
| `gemini-3-pro-image-preview` | Pro quality, complex prompts, better text rendering |
| `gemini-3.1-flash-image-preview` | Latest model, advanced features |

## Output

Generated images are saved to `~/nanobanana-images/` with unique filenames. The tool response includes both the file path and the image data inline.

## Security

This fork addresses the following security issues from the original:

| Issue | Fix |
|-------|-----|
| API key saved to disk in plaintext | Removed config file persistence entirely |
| `configure_gemini_token` tool accepts key via MCP | Tool removed; keys only via env vars |
| Path traversal in `editImage` | `validatePath()` checks paths resolve within `$HOME` or `$TMPDIR` |
| No prompt length validation | Capped at 10,000 chars via Zod |
| Hardcoded model | `NANOBANANA_MODEL` env var with whitelist |
| Silent swallowing of reference image errors | Errors now thrown and reported |
| `Math.random()` for filenames | `crypto.randomUUID()` |
| No file size limit on reads | Max 20MB |
| Verbose errors leak internal paths | Sanitized error messages |
| `process.cwd()` fallback for output dir | Fixed to `~/nanobanana-images/` |

## Development

```bash
npm install
npm run typecheck   # Type check without emitting
npm run dev         # Run with tsx (hot reload)
npm run build       # Compile to dist/
```

## Project Structure

```
src/
  index.ts          # MCP server entry point (3 tool handlers)
  gemini-client.ts  # Gemini API wrapper with model selection
  file-handler.ts   # Secure file I/O with path validation
  types.ts          # TypeScript interfaces and Zod schemas
```

## License

MIT - Based on [ConechoAI/Nano-Banana-MCP](https://github.com/ConechoAI/Nano-Banana-MCP)
