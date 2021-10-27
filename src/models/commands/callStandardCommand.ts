import { CommandName, ComponentsSupport } from "../../interfaces/tmi";
import {
  induvidualPersonalBest,
  induvidualWorldRecord,
  timeTrialPersonalBest,
  timeTrialWorldRecord,
  worldRecord,
  setSpeedrunComUsername,
  personalBest,
} from "../../commands/speedrun";
import {
  getFollowage,
  getStreamerTitle,
  getStreamerUptime,
} from "../../commands/twitch";
import {
  createUser,
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
  pokemonComponent,
} from "../../commands/tmi";
import { ChatUserstate, Client, Userstate } from "tmi.js";

export async function callStandardCommand(
  tmiClient: Client,
  chatterCommandUpper: string,
  channel: string,
  streamer: string,
  messageArray: string[],
  userstate: ChatUserstate
): Promise<void> {
  switch (chatterCommandUpper) {
    case CommandName.UPTIME:
      tmiClient.say(channel, await getStreamerUptime(streamer));
      break;
    case CommandName.TITLE:
      tmiClient.say(channel, await getStreamerTitle(streamer));
      break;
    case CommandName.WR:
      tmiClient.say(channel, await worldRecord(channel, messageArray));
      break;
    case CommandName.ILWR:
      tmiClient.say(
        channel,
        await induvidualWorldRecord(streamer, messageArray)
      );
      break;
    case CommandName.PB:
      tmiClient.say(channel, await personalBest(channel, messageArray));
      break;
    case CommandName.ILPB:
      tmiClient.say(
        channel,
        await induvidualPersonalBest(streamer, messageArray)
      );
      break;
    case CommandName.TTWR:
      tmiClient.say(
        channel,
        await timeTrialWorldRecord(streamer, messageArray)
      );
      break;
    case CommandName.TTPB:
      tmiClient.say(
        channel,
        await timeTrialPersonalBest(streamer, messageArray)
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
      tmiClient.say(channel, await pokemonComponent(streamer, messageArray));
      break;
    default:
      break;
  }
}
