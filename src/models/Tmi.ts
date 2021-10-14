import { Client } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";

export class Tmi {
  private client: Client = new Client(tmiOptions);
  constructor() {
    this.client.connect();
  }

  on = this.client.on;
}
