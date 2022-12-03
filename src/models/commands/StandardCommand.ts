import { CommandName } from "../../interfaces/tmi";
import { Client } from "tmi.js";
import { TwitchTitle, TwitchUptime } from "./Twitch";
import { ICommand } from "../../interfaces/Command";
import { MessageData } from "../MessageData";
import { IndividualWorldRecord, WorldRecord } from "./Speedrun";
import { UserModel } from "../database/UserPrisma";
import { JoinedUser } from "../../interfaces/prisma";
import { Component } from "@prisma/client";
import { Followage } from "./twitch/Followage";

export class StandardCommand implements ICommand {
  private commandMap = new Map<string, ICommand>();

  constructor(public messageData: MessageData, private tmiClient: Client) {
    this.buildCommands()
  }

  private buildCommands = () => {
    this.commandMap.set(CommandName.UPTIME, new TwitchUptime(this.messageData))
    this.commandMap.set(CommandName.TITLE, new TwitchTitle(this.messageData))
    this.commandMap.set(CommandName.WR, new WorldRecord(this.messageData))
    // this.commandMap.set(CommandName.ILWR, new IndividualWorldRecord(this.messageData))
    // this.commandMap.set(CommandName.PB, new PersonalBest(this.messageData))
    // this.commandMap.set(CommandName.ILPB, new IndividualPersonalBest(this.messageData))
    // this.commandMap.set(CommandName.FOLLOWAGE, new Followage(this.messageData))
    // this.commandMap.set(CommandName.TRUST, new NewTrust(this.messageData))
    // this.commandMap.set(CommandName.UNTRUST, new UnTrust(this.messageData))
    // this.commandMap.set(CommandName.TS, new Timestamp(this.messageData))
    // this.commandMap.set(CommandName.DTS, new DeleteTimestamp(this.messageData))
    // this.commandMap.set(CommandName.FINDTS, new FindTimestamp(this.messageData))
    // this.commandMap.set(CommandName.NEWCMD, new NewCommand(this.messageData))
    // this.commandMap.set(CommandName.DELCMD, new DeleteCommand(this.messageData))
    // this.commandMap.set(CommandName.SETSPEEDRUNNER, new SetSpeedrunner(this.messageData))
    // this.commandMap.set(CommandName.TOGGLE, new ToggleComponent(this.messageData))
    // this.commandMap.set(CommandName.JOIN, new UserJoin(this.messageData, this.tmiClient))
    // this.commandMap.set(CommandName.PART, new UserLeave(this.messageData, this.tmiClient))
    // this.commandMap.set(CommandName.TTWR, new TimeTrialWorldRecord(this.messageData))
    // this.commandMap.set(CommandName.TTPB, new TimeTrialPersonalBest(this.messageData))
    // this.commandMap.set(ComponentsSupport.POKEMON, new Pokemon(this.messageData))
    // this.commandMap.set(ComponentsSupport.SLOTS, new Slots(this.messageData))
  }

  private getCommandName = (): string => {
    const { message } = this.messageData;
    const chatterCommand: string = message.split(" ")[0];

    return chatterCommand.slice(1).toUpperCase();
  };

  run: () => Promise<MessageData> = async () => {
    const commandName = this.getCommandName();
    if (this.commandMap.has(commandName)) {
      let { channel } = this.messageData;
      const userModel = new UserModel(channel);
      const joinedUser: JoinedUser = await userModel.get();
      const isComponentEnabled = userModel.isComponentEnabled(commandName, joinedUser.components);
      const components: Component[] = joinedUser.components;
      const isEnabledComponent = components.find((component) => {
        const componentName = component.name.toLowerCase();
        const targetCommand = commandName.toLowerCase();
        return componentName === targetCommand;
      });
      if (isEnabledComponent) {
        // @ts-ignore
        this.messageData = this.commandMap.get(commandName).run();
        return this.messageData
      }
    }
    return this.messageData
  }
}
