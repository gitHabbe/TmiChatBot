import { CommandName, ComponentsSupport, ModuleFamily } from "../../interfaces/tmi"
import { ICommand, ICommandUser } from "../../interfaces/Command"
import { TwitchTitle } from "./twitch/TwitchTitle"
import { TwitchUptime } from "./twitch/TwitchUptime"
import { WorldRecord } from "./speedrun/WorldRecord"
import { IndividualWorldRecord } from "./speedrun/IndividualWorldRecord"
import { PersonalBest } from "./speedrun/PersonalBest"
import { IndividualPersonalBest } from "./speedrun/IndividualPersonalBest"
import { MessageData } from "../tmi/MessageData"
import { Followage } from "./twitch/Followage"
import {
    AddTrust,
    DeleteCommand,
    DeleteTimestamp,
    FindTimestamp,
    NewCommand,
    Pokemon,
    Slots,
    Timestamp,
    ToggleComponent,
    UnTrust,
    UserJoin,
    UserLeave
} from "./Tmi"
import { SetSpeedrunner } from "./speedrun/SetSpeedrunner"
import { TimeTrialWorldRecord } from "./speedrun/TimeTrialWorldRecord"
import { TimeTrialPersonalBest } from "./speedrun/TimeTrialPersonalBest"
import { JoinedUser } from "../../interfaces/prisma"

class SetPrefix implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData, private joinedUser: JoinedUser) {}

    run(): Promise<MessageData> {
        return Promise.resolve(undefined);
    }
}

export class StandardCommandMap {
    private commandMap = new Map<string, ICommand>()

    constructor(public messageData: MessageData, private joinedUser: JoinedUser) {
        this.buildCommandMap()
    }

    get(commandName: string): ICommand | undefined{
        const commandNameUpperCase = commandName.toUpperCase()
        console.log(`Command used: ${commandNameUpperCase}`)
        const targetCommand = this.commandMap.get(commandNameUpperCase)
        // if (!targetCommand) throw new Error()
        return targetCommand
    }

    private buildCommandMap(): void {
        this.commandMap.set(CommandName.UPTIME, new TwitchUptime(this.messageData))
        this.commandMap.set(CommandName.TITLE, new TwitchTitle(this.messageData))
        this.commandMap.set(CommandName.WR, new WorldRecord(this.messageData))
        this.commandMap.set(CommandName.ILWR, new IndividualWorldRecord(this.messageData))
        this.commandMap.set(CommandName.PB, new PersonalBest(this.messageData))
        this.commandMap.set(CommandName.ILPB, new IndividualPersonalBest(this.messageData))
        this.commandMap.set(CommandName.FOLLOWAGE, new Followage(this.messageData))
        this.commandMap.set(CommandName.TRUST, new AddTrust(this.messageData))
        this.commandMap.set(CommandName.UNTRUST, new UnTrust(this.messageData))
        this.commandMap.set(CommandName.TS, new Timestamp(this.messageData))
        this.commandMap.set(CommandName.DTS, new DeleteTimestamp(this.messageData))
        this.commandMap.set(CommandName.FINDTS, new FindTimestamp(this.messageData))
        this.commandMap.set(CommandName.NEWCMD, new NewCommand(this.messageData))
        this.commandMap.set(CommandName.DELCMD, new DeleteCommand(this.messageData))
        this.commandMap.set(CommandName.TOGGLE, new ToggleComponent(this.messageData))
        this.commandMap.set(CommandName.SETSPEEDRUNNER, new SetSpeedrunner(this.messageData))
        this.commandMap.set(CommandName.SETPREFIX, new SetPrefix(this.messageData, this.joinedUser))
        this.commandMap.set(CommandName.JOIN, new UserJoin(this.messageData))
        this.commandMap.set(CommandName.PART, new UserLeave(this.messageData))
        this.commandMap.set(CommandName.TTWR, new TimeTrialWorldRecord(this.messageData))
        this.commandMap.set(CommandName.TTPB, new TimeTrialPersonalBest(this.messageData))
        this.commandMap.set(ComponentsSupport.POKEMON, new Pokemon(this.messageData))
        this.commandMap.set(ComponentsSupport.SLOTS, new Slots(this.messageData))
    }
}
