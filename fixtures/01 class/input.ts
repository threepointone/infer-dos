import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject {
  constructor(state: DurableObjectState, env: {}) {
    super(state, env);
  }
}
