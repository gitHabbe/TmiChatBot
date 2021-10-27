import { Client, ChatUserstate } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { callStandardCommand } from "./models/commands/callStandardCommand";
import { callLinkCommand } from "./models/commands/callLinkCommand";
import { callCustomCommand } from "./models/commands/callCustomCommand";

export const tmiClient = new Client(tmiOptions);

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
    userstate: ChatUserstate,
    message: string,
    self: boolean
  ) => {
    if (self) return;

    const isLink = await callLinkCommand(tmiClient, channel, message);
    if (isLink) return;

    const streamer: string = channel.slice(1);
    const chatterCommand: string = message.split(" ")[0];

    const isCustomCommand = await callCustomCommand(
      tmiClient,
      streamer,
      channel,
      chatterCommand
    );
    if (isCustomCommand) return;

    if (message[0] !== "!") return;
    const chatterCommandUpper: string = chatterCommand.slice(1).toUpperCase();
    const messageArray: string[] = message.split(" ").slice(1);

    await callStandardCommand(
      tmiClient,
      chatterCommandUpper,
      channel,
      streamer,
      messageArray,
      userstate
    );
  }
);
