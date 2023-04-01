import { CommandName, ComponentsSupport } from "../../interfaces/tmi"
import { ICommandUser } from "../../interfaces/Command"
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
    private commandMap = new Map<string, new (messageData: MessageData, joinedUser: JoinedUser) => ICommandUser>();

    constructor(public messageData: MessageData) {
        this.buildCommandMap()
    }

    get(commandName: string) {
        const commandNameUpperCase = commandName.toUpperCase()
        console.log(`Command used: ${commandNameUpperCase}`)
        return this.commandMap.get(commandNameUpperCase)
    }

    private buildCommandMap(): void {
        this.commandMap.set(CommandName.UPTIME, TwitchUptime)
        this.commandMap.set(CommandName.TITLE, TwitchTitle)
        this.commandMap.set(CommandName.WR, WorldRecord)
        this.commandMap.set(CommandName.ILWR, IndividualWorldRecord)
        this.commandMap.set(CommandName.PB, PersonalBest)
        this.commandMap.set(CommandName.ILPB, IndividualPersonalBest)
        this.commandMap.set(CommandName.FOLLOWAGE, Followage)
        this.commandMap.set(CommandName.TRUST, AddTrust)
        this.commandMap.set(CommandName.UNTRUST, UnTrust)
        this.commandMap.set(CommandName.TS, Timestamp)
        this.commandMap.set(CommandName.DTS, DeleteTimestamp)
        this.commandMap.set(CommandName.FINDTS, FindTimestamp)
        this.commandMap.set(CommandName.NEWCMD, NewCommand)
        this.commandMap.set(CommandName.DELCMD, DeleteCommand)
        this.commandMap.set(CommandName.TOGGLE, ToggleComponent)
        this.commandMap.set(CommandName.SETSPEEDRUNNER, SetSpeedrunner)
        this.commandMap.set(CommandName.SETPREFIX, SetPrefix)
        this.commandMap.set(CommandName.JOIN, UserJoin)
        this.commandMap.set(CommandName.PART, UserLeave)
        this.commandMap.set(CommandName.TTWR, TimeTrialWorldRecord)
        this.commandMap.set(CommandName.TTPB, TimeTrialPersonalBest)
        this.commandMap.set(ComponentsSupport.POKEMON, Pokemon)
        this.commandMap.set(ComponentsSupport.POKEMONMOVE, PokemonMoveImpl)
        this.commandMap.set(ComponentsSupport.POKEMONITEM, PokemonItemImpl)
        this.commandMap.set(ComponentsSupport.POKEMONHM, PokemonMachine)
        this.commandMap.set(ComponentsSupport.POKEMONTM, PokemonMachine)
        this.commandMap.set(ComponentsSupport.SLOTS, Slots)
    }
}
