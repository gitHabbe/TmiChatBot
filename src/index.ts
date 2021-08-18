import { Client, Userstate } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { CommandName } from "./interfaces/tmi";
import { getPersonalBest, getWorldRecord } from "./commands/speedrun";
import { getStreamerTitle, getStreamerUptime } from "./commands/twitch";
import {
  createUser,
  isUserCustomCommand,
  newCommand,
  removeCommand,
  removeUser,
} from "./commands/tmi";

const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

tmiClient.on("message", async (channel, userstate, message, self) => {
  if (self) return;
  const streamer: string = channel.slice(1);
  const chatterCommand: string = message.split(" ")[0];
  console.log("~ chatterCommand", chatterCommand);
  const isCommand = await isUserCustomCommand(streamer, chatterCommand);
  console.log("~ isCommand", isCommand);
  if (isCommand) return tmiClient.say(channel, isCommand.content);
  const chatterCommandUpper: string = chatterCommand.slice(1).toUpperCase();
  const messageArray: string[] = message.split(" ").slice(1);

  switch (chatterCommandUpper) {
    case CommandName.UPTIME:
      tmiClient.say(channel, await getStreamerUptime(streamer));
      break;
    case CommandName.TITLE:
      tmiClient.say(channel, await getStreamerTitle(streamer));
      break;
    case CommandName.WR:
      tmiClient.say(channel, await getWorldRecord(channel, messageArray));
      break;
    case CommandName.PB:
      tmiClient.say(channel, await getPersonalBest(channel, messageArray));
      break;
    case CommandName.JOIN:
      tmiClient.say(channel, await createUser(channel, userstate.username));
      break;
    case CommandName.PART:
      tmiClient.say(channel, await removeUser(userstate.username));
      break;
    case CommandName.NEWCMD:
      tmiClient.say(
        channel,
        await newCommand(streamer, messageArray, userstate.username)
      );
      break;
    case CommandName.DELCMD:
      tmiClient.say(
        channel,
        await removeCommand(streamer, messageArray, userstate.username)
      );
    default:
      break;
  }
});
