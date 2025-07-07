# infer-dos

A TypeScript tool to detect DurableObject classes in your codebase. Analyzes TypeScript files and identifies exported classes that extend or implement `DurableObject`, including transitive inheritance.

## Installation

```bash
npm install infer-dos
```

## CLI Usage

```bash
npx infer-dos <input-file>
```

**Output:** JSON array of DurableObject class names

### Examples

See `fixtures/` directory for example inputs and expected outputs. Run `npm test` to verify all test cases.

## Programmatic Usage

```typescript
import { getDurableObjectClassNames } from "infer-dos";

const classNames = getDurableObjectClassNames("./src/my-file.ts");
console.log(classNames); // ["MyDurableObject", "MyServer"]
```

## How It Works

- Uses your project's `tsconfig.json` for accurate type resolution
- Detects classes that directly extend `DurableObject` from `cloudflare:workers`
- Detects classes that implement the `DurableObject` interface
- Follows inheritance chains to detect transitive DurableObject classes
- Handles generic types and complex type hierarchies

## Supported Patterns

```typescript
// Direct extends
export class MyClass extends DurableObject {}

// Implements interface
export class MyClass implements DurableObject {}

// Transitive extends (Server, Agent, Actor, etc.)
export class MyServer extends Server {} // Server extends DurableObject
export class MyAgent extends Agent {} // Agent extends Server extends DurableObject
export class MyActor extends Actor {} // Actor extends DurableObject
```

## Next up:

- maybe a vite plugin? so you'd never need to run the CLI
- using the clouflare api to infer migrations as well
