import { CommandName } from "../../interfaces/tmi";
import { Client } from "tmi.js";
import { ICommand } from "../../interfaces/Command";
import { UserModel } from "../database/UserPrisma";
import { JoinedUser } from "../../interfaces/prisma";
import { Component } from "@prisma/client";
import { TwitchTitle } from "./twitch/TwitchTitle";
import { TwitchUptime } from "./twitch/TwitchUptime";
import { UserJoin } from "./Tmi";
import { ToggleComponent, UserJoin } from "./Tmi";
import { WorldRecord } from "./speedrun/WorldRecord";
import { IndividualWorldRecord } from "./speedrun/IndividualWorldRecord";
import { PersonalBest } from "./speedrun/PersonalBest";
import { IndividualPersonalBest } from "./speedrun/IndividualPersonalBest";
import { MessageData } from "../tmi/MessageData";

export interface CommandList {
  get(commandName: string): ICommand | undefined;
}

export class StandardCommandList implements CommandList {
  private commandMap = new Map<string, ICommand>();

  constructor(public messageData: MessageData) {
    this.buildCommandMap()
  }

  get(commandName: string): ICommand | undefined  {
    const commandNameUpperCase = commandName.toUpperCase();
    console.log(commandNameUpperCase);
    return this.commandMap.get(commandNameUpperCase);
  }

  private buildCommandMap(): void {
    this.commandMap.set(CommandName.UPTIME, new TwitchUptime(this.messageData))
    this.commandMap.set(CommandName.TITLE, new TwitchTitle(this.messageData))
    this.commandMap.set(CommandName.WR, new WorldRecord(this.messageData))
    this.commandMap.set(CommandName.ILWR, new IndividualWorldRecord(this.messageData))
    this.commandMap.set(CommandName.PB, new PersonalBest(this.messageData))
    this.commandMap.set(CommandName.ILPB, new IndividualPersonalBest(this.messageData))
    // this.commandMap.set(CommandName.FOLLOWAGE, new Followage(this.messageData))
    // this.commandMap.set(CommandName.TRUST, new NewTrust(this.messageData))
    // this.commandMap.set(CommandName.UNTRUST, new UnTrust(this.messageData))
    // this.commandMap.set(CommandName.TS, new Timestamp(this.messageData))
    // this.commandMap.set(CommandName.DTS, new DeleteTimestamp(this.messageData))
    // this.commandMap.set(CommandName.FINDTS, new FindTimestamp(this.messageData))
    // this.commandMap.set(CommandName.NEWCMD, new NewCommand(this.messageData))
    // this.commandMap.set(CommandName.DELCMD, new DeleteCommand(this.messageData))
    // this.commandMap.set(CommandName.SETSPEEDRUNNER, new SetSpeedrunner(this.messageData))
    this.commandMap.set(CommandName.JOIN, new UserJoin(this.messageData))
    this.commandMap.set(CommandName.TOGGLE, new ToggleComponent(this.messageData))
    // this.commandMap.set(CommandName.PART, new UserLeave(this.messageData, this.tmiClient))
    // this.commandMap.set(CommandName.TTWR, new TimeTrialWorldRecord(this.messageData))
    // this.commandMap.set(CommandName.TTPB, new TimeTrialPersonalBest(this.messageData))
    // this.commandMap.set(ComponentsSupport.POKEMON, new Pokemon(this.messageData))
    // this.commandMap.set(ComponentsSupport.SLOTS, new Slots(this.messageData))
  }
}
