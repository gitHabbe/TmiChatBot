import {CommandName, ComponentsSupport} from "../../interfaces/tmi";
import { Client } from "tmi.js";
import { MessageData } from "../Tmi";
import {Followage, TwitchTitle, TwitchUptime} from "./Twitch";

import {
  IndividualPersonalBest,
  IndividualWorldRecord,
  PersonalBest,
  SetSpeedrunner, TimeTrialPersonalBest,
  TimeTrialWorldRecord,
  WorldRecord
} from "./Speedrun";
import { ICommand } from "../../interfaces/Command";
import {
  DeleteCommand,
  DeleteTimestamp,
  FindTimestamp,
  NewCommand,
  Pokemon,
  Slots,
  Timestamp, ToggleComponent,
  Trust,
  UnTrust, UserJoin, UserLeave
} from "./Tmi";

export const callStandardCommand = async (
  tmiClient: Client,
  messageData: MessageData
): Promise<void> => {
  const { channel, message } = messageData;
  const chatterCommand: string = message.split(" ")[0];
  const chatterCommandUpper: string = chatterCommand.slice(1).toUpperCase();
  console.log(chatterCommandUpper)

  const commandMap = new Map<string, ICommand>();
  commandMap.set(CommandName.UPTIME, new TwitchUptime(messageData))
  commandMap.set(CommandName.TITLE, new TwitchTitle(messageData))
  commandMap.set(CommandName.WR, new WorldRecord(messageData))
  commandMap.set(CommandName.ILWR, new IndividualWorldRecord(messageData))
  commandMap.set(CommandName.PB, new PersonalBest(messageData))
  commandMap.set(CommandName.ILPB, new IndividualPersonalBest(messageData))
  commandMap.set(CommandName.FOLLOWAGE, new Followage(messageData))
  commandMap.set(CommandName.TRUST, new Trust(messageData))
  commandMap.set(CommandName.UNTRUST, new UnTrust(messageData))
  commandMap.set(CommandName.TS, new Timestamp(messageData))
  commandMap.set(CommandName.DTS, new DeleteTimestamp(messageData))
  commandMap.set(CommandName.FINDTS, new FindTimestamp(messageData))
  commandMap.set(CommandName.NEWCMD, new NewCommand(messageData))
  commandMap.set(CommandName.DELCMD, new DeleteCommand(messageData))
  commandMap.set(CommandName.SETSPEEDRUNNER, new SetSpeedrunner(messageData))
  commandMap.set(CommandName.TOGGLE, new ToggleComponent(messageData))
  commandMap.set(CommandName.JOIN, new UserJoin(messageData, tmiClient))
  commandMap.set(CommandName.PART, new UserLeave(messageData, tmiClient))
  commandMap.set(CommandName.TTWR, new TimeTrialWorldRecord(messageData))
  commandMap.set(CommandName.TTPB, new TimeTrialPersonalBest(messageData))
  commandMap.set(ComponentsSupport.POKEMON, new Pokemon(messageData))
  commandMap.set(ComponentsSupport.SLOTS, new Slots(messageData))

  if (commandMap.has(chatterCommandUpper)) {
    // @ts-ignore
    const command: ICommand = commandMap.get(chatterCommandUpper)
    const response: string = await command.run()
    console.log("channel:", channel)
    await tmiClient.say(channel, response)
    return
  }

  throw new Error("Command doesn't exist.")
};
