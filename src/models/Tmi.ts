import { Client, Userstate } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";
import { OnMessage } from "../interfaces/tmi";

export class Tmi {
  private client: Client = new Client(tmiOptions);
  constructor() {
    this.client.connect();
  }

  on = this.client.on;
}

const onMessage: OnMessage = async (
  streamer: string,
  chatter: Userstate,
  message: string,
  self: boolean
) => {
  if (self) return;
};

const tmi = new Tmi();
tmi.on("message", onMessage);
