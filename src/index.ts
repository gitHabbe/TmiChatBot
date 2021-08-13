import { Client, Userstate } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { CommandName } from "./interfaces/tmi";
import { getPersonalBest, getWorldRecord } from "./commands/speedrun";
import { getStreamerTitle, getStreamerUptime } from "./commands/twitch";
import { createUser, removeUser } from "./commands/tmi";

const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

tmiClient.on("message", async (channel, userstate, message, self) => {
  if (self) return;
  const isCommand: boolean = message.startsWith("!");
  if (!isCommand) return;

  const streamer: string = channel.slice(1);
  const userCommandName: string = message.split(" ")[0].slice(1).toUpperCase();
  const messageArray: string[] = message.split(" ").slice(1);

  switch (userCommandName) {
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
      tmiClient.say(channel, await removeUser(channel, userstate.username));
      break;

    default:
      break;
  }
});
