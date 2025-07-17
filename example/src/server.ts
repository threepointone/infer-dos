import { Server } from "partyserver";
import { Agent } from "agents";
import { DurableObject } from "cloudflare:workers";
import { Actor } from "@cloudflare/actors";

export class MyServer extends Server {
  // hey a multiplayer server
}
export class MyAgent extends Agent<{}> {
  // smart agent
}
export class MyDurableObject extends DurableObject {
  // or a basic Durable Object
}

export class MyActor extends Actor<{}> {
  // or an actor
}

export default {
  fetch(request: Request) {
    return new Response("Hello, world!");
  },
};
