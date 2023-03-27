import { ICommand, ICommandUser } from "../../interfaces/Command"
import { ChatUserstate } from "tmi.js"
import { TrustPrisma } from "../database/TrustPrisma"
import { UserPrisma } from "../database/UserPrisma"
import { ComponentPrisma } from "../database/ComponentPrisma"
import { MessageData } from "../tmi/MessageData"
import { ModuleFamily, TmiClient } from "../../interfaces/tmi"
import { JoinedUser } from "../../interfaces/prisma"
import { Command, Trust } from "@prisma/client"
import { TwitchFetch } from "../fetch/TwitchTv"
import { IVideo } from "../../interfaces/twitch"
import { TimestampPrisma } from "../database/TimestampPrisma"
import { CommandPrisma } from "../database/CommandPrisma"
import { IPokemon, IPokemonStat, PokemonMove } from "../../interfaces/pokemon"
import { randomInt } from "../../utility/math"
import { ClientSingleton } from "../tmi/ClientSingleton"
import { JsonChannels } from "../JsonArrayFile"
import { TrustLevel } from "../tmi/TrustLevel"
import { SettingPrisma } from "../database/SettingPrisma"
import { ChatError } from "../error/ChatError"
import { PokemonAPI } from "../fetch/PokemonAPI"
import { MessageParser } from "../tmi/MessageParse"

export class AddTrust implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    private static async addTrust(user: JoinedUser, chatter: ChatUserstate, newTrust: string) {
        const trust = new TrustPrisma(user, chatter);
        return await trust.save(newTrust, newTrust);
    }

    private static async getUser(channel: string): Promise<JoinedUser> {
        const userPrisma = new UserPrisma(channel);
        return await userPrisma.get();
    }

    async run(): Promise<MessageData> {
        const { channel, message, chatter } = this.messageData;
        const user: JoinedUser = await AddTrust.getUser(channel);
        this.cannotCreateTrustError(user)
        const newTrust = this.newTrustNotSpecifiedError(message)
        this.alreadyTrustedError(user, newTrust)

        const addTrust = await AddTrust.addTrust(user, chatter, newTrust);
        this.messageData.response = `${addTrust.name} added to trust-list`;
        return this.messageData;
    }

    private alreadyTrustedError(user: JoinedUser, newTrust: string) {
        const isAlreadyTrusted = user.trusts.find((user: Trust) => {
            return user.name.toUpperCase() === newTrust.toUpperCase()
        })
        if (isAlreadyTrusted) {
            throw new ChatError(`${isAlreadyTrusted.name} is already trusted`)
        }
    }

    private newTrustNotSpecifiedError(message: string) {
        const newTrust = message.split(" ")[1]
        if (!newTrust) throw new ChatError("No user specified")
        return newTrust
    }

    private cannotCreateTrustError(user: JoinedUser) {
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isTrusted()) {
            throw new Error("This user cannot create trust")
        }
    }
}

export class NewTrust implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    private async getUser(channel: string): Promise<JoinedUser> {
        const userPrisma = new UserPrisma(channel);
        return await userPrisma.get();
    }

    async run(): Promise<MessageData> {
        const { channel, message, chatter } = this.messageData;
        if (!chatter.username) throw new Error("Creator not specified");
        const newTrust = message.split(" ")[1];
        if (!newTrust) throw new Error("No user specified");
        const user = await this.getUser(channel);
        const trust = new TrustPrisma(user, chatter);
        const addTrust = await trust.save(chatter.username, newTrust);
        this.messageData.response = `${addTrust.name} added to trust-list`;

        return this.messageData;
    }
}

export class UnTrust implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`User not found`);
        return user;
    }
    run = async () => {
        const { channel, message, chatter } = this.messageData;
        if (!chatter.username) throw new Error("Creator not specified");
        const deleteTrust = message.split(" ")[1];
        if (!deleteTrust) throw new Error("No user specified");
        const user: JoinedUser = await this.getUser(channel);
        const trustPrisma = new TrustPrisma(user, chatter);
        const trustee = message.split(" ")[1];
        try {
            await trustPrisma.delete(channel, trustee, chatter.username);
            this.messageData.response = `${trustee} removed from trust-list`;
        } catch (error) {
            if (error instanceof Error) {
                this.messageData.response = `${error.message}`
            }
        }

        return this.messageData;
    }
}

export class Timestamp implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.TIMESTAMP

    constructor(public messageData: MessageData) {}

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel);
        return await userPrisma.get();
    }

    private fetchStreamerVideos = async () => {
        const { channel } = this.messageData
        const twitchFetch = new TwitchFetch()
        return await twitchFetch.fetchVideos(channel)
    };

    run = async () => {
        const { channel, message, chatter } = this.messageData;
        const twitchFetch = new TwitchFetch()
        await this.streamerNotLiveError(twitchFetch, channel)
        const user = await this.chatterNotTrustedError(channel)
        const timestampName: string = message.split(" ")[1];
        const videos: IVideo[] = await this.fetchStreamerVideos();
        const timestamp = new TimestampPrisma(user);
        await Timestamp.timestampAlreadyExistsError(timestamp, timestampName)
        if (!chatter.username) throw new Error("Useless error")
        const newTimestamp = await timestamp.add(
            videos[0],
            timestampName.toLowerCase(),
            chatter.username
        );
        this.messageData.response = `Timestamp ${newTimestamp.name} created. Use !findts ${newTimestamp.name} to watch it`;

        return this.messageData;
    }

    private static async timestampAlreadyExistsError(timestamp: TimestampPrisma, timestampName: string) {
        const oldTimestamp = await timestamp.find(timestampName.toLowerCase())
        if (oldTimestamp) {
            throw new ChatError(`Timestamp ${timestampName} already exists`)
        }
    }

    private async chatterNotTrustedError(channel: string) {
        const user = await this.getUser(channel)
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isTrusted()) {
            throw new Error("This user cannot create timestamps")
        }
        return user
    }

    private async streamerNotLiveError(twitchFetch: TwitchFetch, channel: string) {
        const { started_at } = await twitchFetch.singleChannel(channel)
        if (!started_at) {
            throw new ChatError(`${channel} is not live. Cannot create timestamp.`)
        }
    }
}

export class FindTimestamp implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.TIMESTAMP

    constructor(public messageData: MessageData) {}

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`msg`);
        return user;
    }

    run = async () => {
        const { channel, message, chatter } = this.messageData;
        const user = await this.getUser(channel);
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isTrusted()) {
            throw new Error(`This user cannot find timestamps`)
        }
        const timestampPrisma = new TimestampPrisma(user);
        const targetTimestamp: string = message.split(" ")[1];
        console.log("targetTimestamp:", targetTimestamp)
        if (targetTimestamp === undefined) {
            const allTimestamps = await timestampPrisma.findAll();
            console.log("~ allTimestamps", allTimestamps);
            const timestampsList = allTimestamps
                .map((timestamp) => {
                    return timestamp.name;
                })
                .join(", ");
            this.messageData.response = `Timestamps: ${timestampsList}`;
            return this.messageData;
        }
        const foundTimestamp = await timestampPrisma.find(targetTimestamp);
        if (!foundTimestamp) throw new ChatError(`Timestamp: ${targetTimestamp} not found. Use "!findts" to list all`);
        const backtrackLength = 90;
        const { name, url, timestamp } = foundTimestamp;
        this.messageData.response = `${name}: ${url}?t=${timestamp - backtrackLength}s`;

        return this.messageData;
    }
}

export class DeleteTimestamp implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.TIMESTAMP

    constructor(public messageData: MessageData) {}

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`User not found`);
        return user;
    }

    run = async () => {
        const { channel, message } = this.messageData;
        const user = await this.getUser(channel);
        const timestampName: string = message.split(" ")[1]
        this.chatterNotTrustedError(user)
        DeleteTimestamp.noTimestampSpecifiedError(message, timestampName)
        await this.timestampAlreadyExistsError(user, timestampName)

        const timestampPrisma = new TimestampPrisma(user)
        const deleteTimestamp = await timestampPrisma.remove(timestampName.toLowerCase());
        this.messageData.response = `Timestamp ${deleteTimestamp.name} deleted`;

        return this.messageData;
    }

    private async timestampAlreadyExistsError(user: JoinedUser, timestampName: string) {
        const foundTimestamp = user.timestamps.find((timestamp) => {
            return timestamp.name.toLowerCase() === timestampName.toUpperCase()
        })
        if (foundTimestamp) throw new ChatError(`Timestamp ${foundTimestamp.name} doesn't exist`)
    }

    private chatterNotTrustedError(user: JoinedUser) {
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isTrusted()) {
            throw new Error("This user cannot delete timestamps")
        }
    }

    private static noTimestampSpecifiedError(message: string, targetTimestamp: string) {
        if (!targetTimestamp) {
            throw new ChatError("No timestampPrisma specified")
        }
        return targetTimestamp
    }
}

export class ToggleComponent implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    private async getUser(channel: string) {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`msg`);
        return user;
    }

    async run(): Promise<MessageData> {
        const { channel, message } = this.messageData;
        const user = await this.getUser(channel);
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isStreamer()) {
            throw new Error("Only streamer can toggle components")
        }
        const targetComponent = message.split(" ")[1].toUpperCase();
        const isModuleFamily = targetComponent in ModuleFamily;
        if (!isModuleFamily) {
            throw new ChatError(`${targetComponent} is not a valid component`)
        }
        const component = new ComponentPrisma(user, targetComponent);
        await component.toggle();
        const componentStatus =
            (await component.isEnabled()) === true ? "Enabled" : "Disabled";
        this.messageData.response = `Component ${targetComponent} is now: ${componentStatus}`;

        return this.messageData;

    }
}

export class NewCommand implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`User not found`);
        return user;
    }

    run = async () => {
        const { channel, message, chatter } = this.messageData;
        if (!chatter.username) throw new Error("Creator not specified");
        const user = await this.getUser(channel);
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isTrusted()) {
            throw new Error("This user cannot create command")
        }
        const commandName = message.split(" ")[1];
        const commandContent = message.split(" ").slice(2).join(" ");
        const existingCommand = user.commands.find((command: Command) => {
            return command.name.toUpperCase() === commandName.toUpperCase()
        })
        if (existingCommand) {
            throw new ChatError(`${existingCommand.name} already exists`)
        }
        const commandPrisma = new CommandPrisma(user)
        const command = await commandPrisma.add(
            commandName,
            commandContent,
            chatter.username
        );
        this.messageData.response = `Command ${command.name} created`;


        return this.messageData;
    }
}

export class DeleteCommand implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    run = async () => {
        const { channel, message } = this.messageData;
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isStreamer()) {
            throw new Error("Only streamer can delete commands")
        }
        const commandName = message.split(" ")[1];
        const commandPrisma = new CommandPrisma(user);
        const foundCommand = await commandPrisma.find(commandName)
        if (!foundCommand) {
            throw new ChatError(`Command ${commandName} not found`)
        }
        const delCommand = await commandPrisma.remove(commandName);
        this.messageData.response = `Command ${delCommand.name} deleted`;

        return this.messageData;
    }
}

export class Slots implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.SLOTS

    constructor(public messageData: MessageData) {}

    run = async () => {
        const { channel, message, chatter } = this.messageData;
        const targetComponent = "SLOTS";
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`msg`);
        const component = new ComponentPrisma(user, targetComponent);
        const isEnabled = await component.isEnabled();
        if (!isEnabled) {
            this.messageData.response = `Component ${targetComponent} is not enabled`;
            return this.messageData
        }

        const emoteSelection = [
            "PogChamp",
            "EleGiggle",
            "Jebaited",
            "VoHiYo",
            "SeemsGood",
        ];
        const maxLength = emoteSelection.length;
        const rolls = [
            randomInt(maxLength),
            randomInt(maxLength),
            randomInt(maxLength),
        ];
        const isBingo: boolean = rolls.every((roll) => roll === rolls[0]);
        const gameResult = [
            emoteSelection[rolls[0]],
            emoteSelection[rolls[1]],
            emoteSelection[rolls[2]],
        ];
        const gameResultSentence = gameResult.join(" | ");
        this.messageData.response = gameResultSentence;

        return this.messageData;

    }
}

export class UserJoin implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    async run() {
        const { channel,  chatter } = this.messageData;
        const botName = process.env.TWITCH_USERNAME;
        if (channel !== botName) {
            this.messageData.response = `!join only works in ${botName}'s channel`
            return this.messageData
        }
        if (!chatter.username) {
            this.messageData.response = "User not found";
            return this.messageData
        }

        const jsonUser = new JsonChannels("private/", "tmi_channels");
        const isInJson = jsonUser.data().some((channel: string) => {
            return channel.toLowerCase() === chatter.username?.toLowerCase()
        })
        if (isInJson) {
            this.messageData.response = "I am already in your chat";
            return this.messageData
        }

        const user = new UserPrisma(chatter.username);
        const newPrismaUser = await user.get();

        if (newPrismaUser) {
            jsonUser.add(newPrismaUser.name);
            const client = ClientSingleton.getInstance().client;
            await client.join(newPrismaUser.name)
        }
        this.messageData.response = `I have joined channel: ${newPrismaUser.name}`;

        return this.messageData;
    }
}

export class UserLeave implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    run = async () => {
        const { channel, chatter } = this.messageData;
        if (!chatter.username) {
            throw new Error("User not found");
        }
        if (channel.toLowerCase() !== chatter.username?.toLowerCase()) {
            this.messageData.response = `Only streamer can remove me`;
            return this.messageData;
        }
        const jsonUser = new JsonChannels("private/", "tmi_channels");
        const jsonData: string[] = jsonUser.data()
        const isInJson = jsonData.find((jsonChanel: string) => {
            return channel.toLowerCase() === jsonChanel.toLowerCase()
        })
        if (!isInJson) {
            this.messageData.response = `I am not in your chat`;
            return this.messageData;
        }
        const user = new UserPrisma(chatter.username);
        const deleteUser = await user.get();
        await user.delete();
        if (user) {
            const jsonUser = new JsonChannels("private/", "tmi_channels");
            jsonUser.remove(deleteUser.name);
            const client: TmiClient = ClientSingleton.getInstance().get();
            await client.part(deleteUser.name)
        }
        this.messageData.response = `I have left channel: ${deleteUser.name}`;

        return this.messageData;
    }
}

export class SetPrefix implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData, public user: JoinedUser) {}

    async run(): Promise<MessageData> {
        const { channel, chatter } = this.messageData
        const trustLevel = new TrustLevel(this.messageData, this.user)
        if (!trustLevel.isStreamer()) {
            throw new Error("Only streamer can change prefix")
        }
        const settingPrisma = new SettingPrisma(this.user)
        let updatedPrefix
        const newPrefix = this.messageData.message.split(" ")[1]?.slice(0, 1)
        for (let setting of this.user.settings) {
            if (setting.type === "prefix") {
                if (newPrefix === "!" || !newPrefix) {
                    updatedPrefix = await settingPrisma.delete(setting.id)
                    this.messageData.response = `Command prefix changed to "!"`
                    return this.messageData
                }
                updatedPrefix = await settingPrisma.update(setting.id, "prefix", newPrefix)
                this.messageData.response = `CCommand prefix changed to "${updatedPrefix.value}"`
                return this.messageData
            }
        }
        if (!updatedPrefix) {
            await settingPrisma.add("prefix", newPrefix)
            this.messageData.response = `CCCommand prefix changed to "${newPrefix}"`
        }
        return this.messageData
    }
}

export class Pokemon implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.POKEMON
    private pokeAPI: PokemonAPI

    constructor(public messageData: MessageData, pokeAPI?: PokemonAPI) {
        this.pokeAPI = pokeAPI || new PokemonAPI()
    }

    private getUser = async (userPrisma: UserPrisma) => {
        const user = await userPrisma.get();
        if (!user) throw new Error(`msg`);
        return user;
    }

    private formatPokemonStats = (pokemon: IPokemon) => {
        const truncatedStats = [ "HP", "A", "D", "SA", "SD", "S" ];
        const stats = pokemon.stats.map((stat: IPokemonStat, i: number) => {
            return `${truncatedStats[i]}:${stat.base_stat}`;
        });
        const statsString = stats.join(" ");
        const types = pokemon.types.map((type) => {
            return type.type.name[0].toUpperCase() + type.type.name.slice(1);
        });
        const typesString = types.join(" & ");
        const { name, id } = pokemon;
        const formalName = name[0].toUpperCase() + name.slice(1);

        return `${formalName} #${id} | ${typesString} | ${statsString}`;
    };

    run = async () => {
        const { channel, message } = this.messageData;
        const targetPokemon = message.split(" ")[1];
        const userPrisma = new UserPrisma(channel);
        const user = await this.getUser(userPrisma);
        const pokemon = await this.pokeAPI.fetchPokemon(targetPokemon)
        this.messageData.response = this.formatPokemonStats(pokemon);

        return this.messageData;
    }
}

export class PokemonMoveImpl implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.POKEMON
    private pokeAPI: PokemonAPI

    constructor(public messageData: MessageData, pokeAPI?: PokemonAPI) {
        this.pokeAPI = pokeAPI || new PokemonAPI()
    }

    async run(): Promise<MessageData> {
        const { message } = this.messageData
        const messageParser = new MessageParser()
        const pokemonMoveName = messageParser.getPokemonMove(message, 1)
        const pokemonMove: PokemonMove = await this.pokeAPI.fetchMove(pokemonMoveName)
        const { pp, names, accuracy, name, power, meta, type } = pokemonMove
        const pokemonName = names.find(hit => hit.language.name === 'en')?.name || name
        let response = ""
        response += `${this.toTitleCase(pokemonName)}`
        response += ` [${this.toTitleCase(type.name)}] |`
        response += ` PWR:${power}`
        response += ` PP:${pp}`
        response += ` ACC:${accuracy}`
        const { crit_rate, ailment_chance, flinch_chance, ailment } = meta
        if (crit_rate) {
            response += ` Crit: ${crit_rate}`
        }
        if (flinch_chance) {
            response += ` Flinch: ${flinch_chance}`
        }
        if (ailment_chance) {
            response += ` | Proc: ${this.toTitleCase(ailment.name)}(${ailment_chance}%)`
        }

        this.messageData.response = response
        return this.messageData
    }

    private toTitleCase(str: string) {
        return str.toLowerCase().split(' ').map(function (word) {
            return (word.charAt(0).toUpperCase() + word.slice(1))
        }).join(' ')
    }

}