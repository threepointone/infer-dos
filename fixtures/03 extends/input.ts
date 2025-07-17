import { Actor } from "@cloudflare/actors";
import { Agent } from "agents";
import { Server } from "partyserver";

export class MyServer extends Server {
  constructor(state: DurableObjectState, env: {}) {
    super(state, env);
  }
}

export class MyAgent extends Agent<{}, {}> {
  constructor(state: DurableObjectState, env: {}) {
    super(state, env);
  }
}

export class MyActor extends Actor<{}> {
  constructor(state: DurableObjectState, env: {}) {
    super(state, env);
  }
}
