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
  getStreamerUptime,
  getStreamerTitle,
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
import { Client } from "tmi.js";
import { MessageData } from "../Tmi";

export const callStandardCommand = async (
  tmiClient: Client,
  messageData: MessageData
): Promise<void> => {
  const { channel, message, chatter } = messageData;
  const chatterCommand: string = message.split(" ")[0];
  const chatterCommandUpper: string = chatterCommand.slice(1).toUpperCase();
  const messageArray: string[] = message.split(" ").slice(1);

  switch (chatterCommandUpper) {
    case CommandName.UPTIME:
      tmiClient.say(channel, await getStreamerUptime(channel));
      break;
    case CommandName.TITLE:
      tmiClient.say(channel, await getStreamerTitle(channel));
      break;
    case CommandName.WR:
      tmiClient.say(channel, await worldRecord(channel, messageArray));
      break;
    case CommandName.ILWR:
      tmiClient.say(
        channel,
        await induvidualWorldRecord(channel, messageArray)
      );
      break;
    case CommandName.PB:
      tmiClient.say(channel, await personalBest(channel, messageArray));
      break;
    case CommandName.ILPB:
      tmiClient.say(
        channel,
        await induvidualPersonalBest(channel, messageArray)
      );
      break;
    case CommandName.TTWR:
      tmiClient.say(channel, await timeTrialWorldRecord(channel, messageArray));
      break;
    case CommandName.TTPB:
      tmiClient.say(
        channel,
        await timeTrialPersonalBest(channel, messageArray)
      );
      break;
    case CommandName.JOIN:
      tmiClient.say(channel, await createUser(channel, chatter));
      break;
    case CommandName.PART:
      tmiClient.say(channel, await removeUser(chatter));
      break;
    case CommandName.NEWCMD:
      tmiClient.say(channel, await newCommand(channel, messageArray, chatter));
      break;
    case CommandName.DELCMD:
      tmiClient.say(
        channel,
        await removeCommand(channel, messageArray, chatter)
      );
      break;
    case CommandName.TRUST:
      tmiClient.say(
        channel,
        await addUserTrust(channel, messageArray, chatter)
      );
      break;
    case CommandName.UNTRUST:
      tmiClient.say(
        channel,
        await removeUserTrust(channel, messageArray, chatter)
      );
      break;
    case CommandName.TS:
      tmiClient.say(
        channel,
        await addTimestamp(channel, messageArray, chatter)
      );
      break;
    case CommandName.FINDTS:
      tmiClient.say(channel, await findTimestamp(channel, messageArray));
      break;
    case CommandName.DTS:
      tmiClient.say(
        channel,
        await removeTimestamp(channel, messageArray, chatter)
      );
      break;
    case CommandName.FOLLOWAGE:
      tmiClient.say(channel, await getFollowage(channel, chatter));
      break;
    case CommandName.TOGGLE:
      tmiClient.say(channel, await toggleComponent(channel, messageArray));
      break;
    case CommandName.SETSPEEDRUNNER:
      tmiClient.say(
        channel,
        await setSpeedrunComUsername(channel, messageArray)
      );
      break;
    case ComponentsSupport.SLOTS:
      tmiClient.say(channel, await componentSlots(channel, messageArray));
      break;
    case ComponentsSupport.POKEMON:
    case ComponentsSupport.PKMN:
      tmiClient.say(channel, await pokemonComponent(channel, messageArray));
      break;
    default:
      break;
  }
};
