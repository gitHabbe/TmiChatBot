import { Client, ChatUserstate } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { callStandardCommand } from "./models/commands/callStandardCommand";
import { callLinkCommand } from "./models/commands/callLinkCommand";
import { callCustomCommand } from "./models/commands/callCustomCommand";
import { MessageData } from "./models/Tmi";

const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

tmiClient.on(
  "message",
  async (
    channel: string,
    chatter: ChatUserstate,
    message: string,
    self: boolean
  ) => {
    if (self) return;
    const messageData = new MessageData(channel, chatter, message);

    const isLink = await callLinkCommand(tmiClient, messageData);
    if (isLink) return;

    const streamer: string = channel.slice(1);

    const isCustomCommand = await callCustomCommand(tmiClient, messageData);
    if (isCustomCommand) return;

    if (message[0] !== "!") return;

    await callStandardCommand(tmiClient, messageData);
  }
);
