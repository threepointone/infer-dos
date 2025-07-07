import { Server } from "partyserver";
import { Agent } from "agents";
import { Actor } from "@cloudflare/actors";

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
