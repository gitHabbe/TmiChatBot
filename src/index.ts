import { Client } from "tmi.js";
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
  addUserTrust,
  removeUserTrust,
} from "./commands/tmi";
import { UserPrisma } from "./models/database/user";

const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

// const asdf = new UserPrisma("habbe");
// asdf.addUser();

tmiClient.on("message", async (channel, userstate, message, self) => {
  if (self) return;
  const streamer: string = channel.slice(1);
  const chatterCommand: string = message.split(" ")[0];
  const isCommand = await isUserCustomCommand(streamer, chatterCommand);
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
    case CommandName.TRUST:
      tmiClient.say(
        channel,
        await addUserTrust(streamer, messageArray, userstate.username)
      );
      break;
    case CommandName.UNTRUST:
      tmiClient.say(
        channel,
        await removeUserTrust(streamer, messageArray, userstate.username)
      );
      break;
    case CommandName.TS:
      tmiClient.say(channel, "creating timestamp");
      break;
    default:
      break;
  }
});
