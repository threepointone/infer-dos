import { Server } from "partyserver";
import { Agent } from "agents";
import { DurableObject } from "cloudflare:workers";

export class MyServer extends Server {}
export class MyAgent extends Agent<{}> {}
export class MyDurableObject extends DurableObject {}

export default {
  fetch(request: Request) {
    return new Response("Hello, world!");
  },
};
