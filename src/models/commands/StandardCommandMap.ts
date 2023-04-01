import { CommandName, ComponentsSupport } from "../../interfaces/tmi"
import { ICommand } from "../../interfaces/Command"
import { TwitchTitle } from "./twitch/TwitchTitle"
import { TwitchUptime } from "./twitch/TwitchUptime"
import { WorldRecord } from "./speedrun/WorldRecord"
import { IndividualWorldRecord } from "./speedrun/IndividualWorldRecord"
import { PersonalBest } from "./speedrun/PersonalBest"
import { IndividualPersonalBest } from "./speedrun/IndividualPersonalBest"
import { MessageData } from "../tmi/MessageData"
import { Followage } from "./twitch/Followage"
import { Slots } from "./Tmi"
import { SetSpeedrunner } from "./speedrun/SetSpeedrunner"
import { TimeTrialWorldRecord } from "./speedrun/TimeTrialWorldRecord"
import { TimeTrialPersonalBest } from "./speedrun/TimeTrialPersonalBest"
import { JoinedUser } from "../../interfaces/prisma"
import { AddTrust } from "./tmi/AddTrust"
import { UnTrust } from "./tmi/UnTrust"
import { Timestamp } from "./tmi/Timestamp"
import { FindTimestamp } from "./tmi/FindTimestamp"
import { DeleteTimestamp } from "./tmi/DeleteTimestamp"
import { ToggleComponent } from "./tmi/ToggleComponent"
import { NewCommand } from "./tmi/NewCommand"
import { DeleteCommand } from "./tmi/DeleteCommand"
import { UserJoin } from "./tmi/UserJoin"
import { UserLeave } from "./tmi/UserLeave"
import { SetPrefix } from "./tmi/SetPrefix"
import { Pokemon } from "./pokemon/Pokemon"
import { PokemonMoveImpl } from "./pokemon/PokemonMoveImpl"
import { PokemonItemImpl } from "./pokemon/PokemonItemImpl"
import { PokemonMachine } from "./pokemon/PokemonHM"

export class StandardCommandMap {
    private commandMap = new Map<string, ICommand>()

    constructor(public messageData: MessageData, private joinedUser: JoinedUser) {
        this.buildCommandMap()
    }

    get(commandName: string): ICommand | undefined{
        const commandNameUpperCase = commandName.toUpperCase()
        console.log(`Command used: ${commandNameUpperCase}`)
        return this.commandMap.get(commandNameUpperCase)
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
        this.commandMap.set(ComponentsSupport.POKEMONMOVE, new PokemonMoveImpl(this.messageData))
        this.commandMap.set(ComponentsSupport.POKEMONITEM, new PokemonItemImpl(this.messageData))
        this.commandMap.set(ComponentsSupport.POKEMONHM, new PokemonMachine(this.messageData))
        this.commandMap.set(ComponentsSupport.POKEMONTM, new PokemonMachine(this.messageData))
        this.commandMap.set(ComponentsSupport.SLOTS, new Slots(this.messageData))
    }
}
