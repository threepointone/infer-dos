# infer-dos

A helper tool to infer Durable Objects from TypeScript files and automatically update `wrangler.jsonc` configuration files.

## Features

- 🔍 **Automatic Detection**: Scans TypeScript files for Durable Object classes
- ⚙️ **Configuration Updates**: Automatically updates `wrangler.jsonc` with proper bindings
- 🔒 **Safe Operations**: Creates backups before making changes
- 🛠️ **Vite Integration**: Works seamlessly with Vite build process
- 📝 **JSONC Support**: Handles comments and formatting in wrangler.jsonc files

## Installation

```bash
npm install infer-dos
```

## Usage

### CLI Tool

```bash
npx infer-dos path/to/your/file.ts
```

### Vite Plugin

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import inferDosPlugin from "infer-dos/vite-plugin";

export default defineConfig({
  plugins: [
    inferDosPlugin({
      verbose: true, // Enable detailed logging
      backup: true, // Create backup before modifications
    }),
  ],
});
```

#### Plugin Options

- `wranglerConfigPath` (string, default: "wrangler.jsonc"): Path to your wrangler.jsonc file
- `autoUpdate` (boolean, default: true): Whether to automatically update wrangler.jsonc
- `backup` (boolean, default: true): Whether to create backup before modifications
- `verbose` (boolean, default: false): Enable detailed logging

## How It Works

1. **Detection**: The plugin uses TypeScript's compiler API to scan your main entry point file for Durable Object classes
2. **Configuration**: Reads your existing `wrangler.jsonc` file and preserves all existing configuration
3. **Binding Generation**: Creates `durable_object_bindings` entries for each detected Durable Object class
4. **Update**: Writes the updated configuration back to `wrangler.jsonc`

## Example

### Input: `src/index.ts`

```typescript
import { DurableObject } from "cloudflare:workers";

export class UserSession extends DurableObject {
  constructor(state: DurableObjectState, env: {}) {
    super(state, env);
  }

  async fetch(request: Request): Promise<Response> {
    return new Response("User session handled");
  }
}

export class GameState extends DurableObject {
  constructor(state: DurableObjectState, env: {}) {
    super(state, env);
  }

  async fetch(request: Request): Promise<Response> {
    return new Response("Game state handled");
  }
}
```

### Input: `wrangler.jsonc`

```jsonc
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2024-09-23"
}
```

### Output: `wrangler.jsonc` (after plugin runs)

```jsonc
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2024-09-23",
  "durable_object_bindings": [
    {
      "name": "UserSession",
      "class_name": "UserSession"
    },
    {
      "name": "GameState",
      "class_name": "GameState"
    }
  ]
}
```

## Supported Durable Object Patterns

The plugin detects Durable Object classes that:

- Extend `DurableObject` from `cloudflare:workers`
- Are exported from the main entry point file
- Follow standard naming conventions

## Development

```bash
# Install dependencies
npm install

# Run tests
npm run check

# Build
npm run build
```

## License

MIT
