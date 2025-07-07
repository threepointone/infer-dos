export class MyDurableObject implements DurableObject {
  constructor(state: DurableObjectState, env: {}) {}
  fetch() {
    return new Response("Hello, world!");
  }
}
