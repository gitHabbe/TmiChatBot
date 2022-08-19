import { Client } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";

export class Tmi {
  private events: { [name: string]: Function } = {};
  client: Client;

  constructor(client: Client = new Client(tmiOptions)) {
    this.client = client;
  }

  connect = () => {
    this.client.connect().then();
  }

  addEvent = (name: string, eventFunction: Function): void => {
    this.events[name] = eventFunction;
  }
}

