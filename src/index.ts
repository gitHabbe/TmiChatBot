import { Client } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { CommandName, ComponentsSupport } from "./interfaces/tmi";
import {
  getInduvidualPersonalBest,
  getInduvidualWorldRecord,
  getPersonalBest,
  getTimeTrialPersonalBest,
  getTimeTrialWorldRecord,
  getWorldRecord,
  setSpeedrunComUsername,
} from "./commands/speedrun";
import {
  getFollowage,
  getStreamerTitle,
  getStreamerUptime,
} from "./commands/twitch";
import {
  createUser,
  isUserCustomCommand,
  newCommand,
  removeCommand,
  removeUser,
  addUserTrust,
  removeUserTrust,
  addTimestamp,
  removeTimestamp,
  findTimestamp,
  toggleComponent,
  componentSlots,
  componentPokemon,
} from "./commands/tmi";
import { youtubeRegex } from "./config/youtubeConfig";
import { tweetInfo, youtubeInfo } from "./commands/socialMedia";
import { twitterRegex } from "./config/twitterConfig";

const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

tmiClient.on("message", async (channel, userstate, message, self) => {
  if (self) return;
  const youtube_hit = youtubeRegex.exec(message);
  const tweet_hit = twitterRegex.exec(message);

  if (youtube_hit) {
    return tmiClient.say(channel, await youtubeInfo(youtube_hit));
  } else if (tweet_hit) {
    return tmiClient.say(channel, await tweetInfo(tweet_hit));
  }

  const streamer: string = channel.slice(1);
  const chatterCommand: string = message.split(" ")[0];
  const isCommand = await isUserCustomCommand(streamer, chatterCommand);
  if (isCommand) return tmiClient.say(channel, isCommand.content);

  if (message[0] !== "!") return;
  const chatterCommandUpper: string = chatterCommand.slice(1).toUpperCase();
  const messageArray: string[] = message.split(" ").slice(1);
  console.log("chatterCommandUpper:", chatterCommandUpper);

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
    case CommandName.ILWR:
      tmiClient.say(
        channel,
        await getInduvidualWorldRecord(streamer, messageArray)
      );
      break;
    case CommandName.PB:
      tmiClient.say(channel, await getPersonalBest(channel, messageArray));
      break;
    case CommandName.ILPB:
      tmiClient.say(
        channel,
        await getInduvidualPersonalBest(streamer, messageArray)
      );
      break;
    case CommandName.TTWR:
      tmiClient.say(
        channel,
        await getTimeTrialWorldRecord(streamer, messageArray)
      );
      break;
    case CommandName.TTPB:
      tmiClient.say(
        channel,
        await getTimeTrialPersonalBest(streamer, messageArray)
      );
      break;
    case CommandName.JOIN:
      tmiClient.say(channel, await createUser(channel, userstate));
      break;
    case CommandName.PART:
      tmiClient.say(channel, await removeUser(userstate));
      break;
    case CommandName.NEWCMD:
      tmiClient.say(
        channel,
        await newCommand(streamer, messageArray, userstate)
      );
      break;
    case CommandName.DELCMD:
      tmiClient.say(
        channel,
        await removeCommand(streamer, messageArray, userstate)
      );
      break;
    case CommandName.TRUST:
      tmiClient.say(
        channel,
        await addUserTrust(streamer, messageArray, userstate)
      );
      break;
    case CommandName.UNTRUST:
      tmiClient.say(
        channel,
        await removeUserTrust(streamer, messageArray, userstate)
      );
      break;
    case CommandName.TS:
      tmiClient.say(
        channel,
        await addTimestamp(streamer, messageArray, userstate)
      );
      break;
    case CommandName.FINDTS:
      tmiClient.say(channel, await findTimestamp(streamer, messageArray));
      break;
    case CommandName.DTS:
      tmiClient.say(
        channel,
        await removeTimestamp(streamer, messageArray, userstate)
      );
      break;
    case CommandName.FOLLOWAGE:
      tmiClient.say(channel, await getFollowage(streamer, userstate));
      break;
    case CommandName.TOGGLE:
      tmiClient.say(channel, await toggleComponent(streamer, messageArray));
      break;
    case CommandName.SETSPEEDRUNNER:
      tmiClient.say(
        channel,
        await setSpeedrunComUsername(streamer, messageArray)
      );
      break;
    case ComponentsSupport.SLOTS:
      tmiClient.say(channel, await componentSlots(streamer, messageArray));
      break;
    case ComponentsSupport.POKEMON:
    case ComponentsSupport.PKMN:
      tmiClient.say(channel, await componentPokemon(streamer, messageArray));
      break;
    default:
      break;
  }
});
