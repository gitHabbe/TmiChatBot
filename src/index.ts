import { Client } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { isUserCustomCommand } from "./commands/tmi";
import { callStandardCommand } from "./models/commands/callStandardCommand";
import { callLinkCommand } from "./models/commands/callLinkCommand";

export const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

tmiClient.on("message", async (channel, userstate, message, self) => {
  if (self) return;

  const isLink = await callLinkCommand(tmiClient, channel, message);
  if (isLink) return;

  const streamer: string = channel.slice(1);
  const chatterCommand: string = message.split(" ")[0];
  const isCommand = await isUserCustomCommand(streamer, chatterCommand);
  if (isCommand) return tmiClient.say(channel, isCommand.content);

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
});
