import { CommandName, ComponentsSupport } from "../../interfaces/tmi";
import { Client } from "tmi.js";
import { Followage, TwitchTitle, TwitchUptime } from "./Twitch";

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
  NewTrust, UnTrust, UserJoin, UserLeave
} from "./Tmi";
import { MessageData } from "../MessageData";

export class StandardCommand implements ICommand {
  private commandMap = new Map<string, ICommand>();

  constructor(public messageData: MessageData, private tmiClient: Client) {
    this.buildCommands()
  }

  private buildCommands = () => {
    this.commandMap.set(CommandName.UPTIME, new TwitchUptime(this.messageData))
    this.commandMap.set(CommandName.TITLE, new TwitchTitle(this.messageData))
    this.commandMap.set(CommandName.WR, new WorldRecord(this.messageData))
    this.commandMap.set(CommandName.ILWR, new IndividualWorldRecord(this.messageData))
    this.commandMap.set(CommandName.PB, new PersonalBest(this.messageData))
    this.commandMap.set(CommandName.ILPB, new IndividualPersonalBest(this.messageData))
    this.commandMap.set(CommandName.FOLLOWAGE, new Followage(this.messageData))
    this.commandMap.set(CommandName.TRUST, new NewTrust(this.messageData))
    this.commandMap.set(CommandName.UNTRUST, new UnTrust(this.messageData))
    this.commandMap.set(CommandName.TS, new Timestamp(this.messageData))
    this.commandMap.set(CommandName.DTS, new DeleteTimestamp(this.messageData))
    this.commandMap.set(CommandName.FINDTS, new FindTimestamp(this.messageData))
    this.commandMap.set(CommandName.NEWCMD, new NewCommand(this.messageData))
    this.commandMap.set(CommandName.DELCMD, new DeleteCommand(this.messageData))
    this.commandMap.set(CommandName.SETSPEEDRUNNER, new SetSpeedrunner(this.messageData))
    this.commandMap.set(CommandName.TOGGLE, new ToggleComponent(this.messageData))
    this.commandMap.set(CommandName.JOIN, new UserJoin(this.messageData, this.tmiClient))
    this.commandMap.set(CommandName.PART, new UserLeave(this.messageData, this.tmiClient))
    this.commandMap.set(CommandName.TTWR, new TimeTrialWorldRecord(this.messageData))
    this.commandMap.set(CommandName.TTPB, new TimeTrialPersonalBest(this.messageData))
    this.commandMap.set(ComponentsSupport.POKEMON, new Pokemon(this.messageData))
    this.commandMap.set(ComponentsSupport.SLOTS, new Slots(this.messageData))
  }

  private getCommandName = (): string => {
    const { message } = this.messageData;
    const chatterCommand: string = message.split(" ")[0];
    const chatterCommandUpper: string = chatterCommand.slice(1).toUpperCase();

    return chatterCommandUpper;
  };

  run: () => Promise<MessageData> = async () => {
    const commandName = this.getCommandName();
    if (this.commandMap.has(commandName)) {
      // @ts-ignore
      return this.commandMap.get(commandName).run()
    }

    throw new Error("Command doesn't exist.")
  }
}
