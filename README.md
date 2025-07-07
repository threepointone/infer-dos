## infer-dos

This is a helper tool to infer the Durable Objects of a given file. It uses typescript to infer the types of the exports of an entrypoint, and logs every export that either extends the `DurableObject` class from "cloudflare:workers", or implements the `DurableObject` interface from "@cloudflare/workers-types". It should also be able to detect classes that extend an already exported DurableObject class.

### Examples:

- input:

```ts
// index.ts
import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject {
  constructor(state: DurableObjectState) {
    super(state);
  }
}
```

- output:

```
MyDurableObject
```

- input:

```ts
// index.ts
import { DurableObject } from "cloudflare:workers";

export class MyDurableObject implements DurableObject {
  constructor(state: DurableObjectState) {
    super(state);
  }
}
```

- output:

```
MyDurableObject
```

```ts
// index.ts
export class MyDurableObject implements DurableObject {
  constructor(state: DurableObjectState) {
    super(state);
  }
}
```

(because DurableObject is a global type)

- output:

```
MyDurableObject
```

- input:

```ts
// index.ts
import { Server } from "partyserver";
export class MyServer extends Server {
  constructor(state: DurableObjectState) {
    super(state);
  }
}
```

- output:
  (because Server extends DurableObject)

```
MyServer
```

### Usage:

```bash
bun src/index.ts fixtures/01/input.ts
# ["MyDurableObject"]
bun src/index.ts fixtures/02/input.ts
# ["MyDurableObject"]
bun src/index.ts fixtures/03 extends/input.ts
# ["MyServer", "MyAgent", "MyActor"]
```
