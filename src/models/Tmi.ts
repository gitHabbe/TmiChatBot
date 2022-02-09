import { ChatUserstate, Client } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";
import { OnMessage } from "../interfaces/tmi";
import { callLinkCommand } from "./commands/callLinkCommand";
import { callCustomCommand } from "./commands/callCustomCommand";
import { callStandardCommand } from "./commands/callStandardCommand";
import { MessageData } from "./MessageData";

export class Tmi {
  private client: Client = new Client(tmiOptions);

  constructor() {
    this.client.connect().then(r => { console.log(r)} )
    this.client.on("message", this.onMessage)
  }

  onMessage: OnMessage = async (
      streamer: string,
      chatter: ChatUserstate,
      message: string,
      self: boolean
  ) => {
    if (self) return;
    const messageData = new MessageData(streamer, chatter, message);

    const isLink = await callLinkCommand(this.client, messageData);
    if (isLink) return;

    const isCustomCommand = await callCustomCommand(this.client, messageData);
    if (isCustomCommand) return;

    if (message[0] !== "!") return;

    await callStandardCommand(this.client, messageData);
  }
}

