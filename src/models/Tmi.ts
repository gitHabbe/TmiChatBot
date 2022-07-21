import { Client } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";

export class Tmi {
  client: Client = new Client(tmiOptions);
  private events: { [name: string]: Function } = {};

  connect = () => {
    this.client.connect().then();
  }

  addEvent = (name: string, eventFunction: Function): void => {
    this.events[name] = eventFunction;
  }
}

