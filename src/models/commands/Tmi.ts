import { ICommand } from "../../interfaces/Command"
import { ChatUserstate } from "tmi.js"
import { TrustPrisma } from "../database/TrustPrisma"
import { UserPrisma } from "../database/UserPrisma"
import { ComponentPrisma } from "../database/ComponentPrisma"
import { MessageData } from "../tmi/MessageData"
import { ModuleFamily, TmiClient } from "../../interfaces/tmi"
import { JoinedUser } from "../../interfaces/prisma"
import { Trust } from "@prisma/client"
import { TwitchFetch } from "../fetch/TwitchTv"
import { IVideo } from "../../interfaces/twitch"
import { TimestampPrisma } from "../database/TimestampPrisma"
import { CommandPrisma } from "../database/CommandPrisma"
import { IPokemon, IPokemonStat } from "../../interfaces/pokemon"
import { pokemonAPI } from "../../config/pokemonConfig"
import { randomInt } from "../../utility/math"
import { ClientSingleton } from "../tmi/ClientSingleton"
import { JsonChannels } from "../JsonArrayFile"

export class AddTrust implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    private async addTrust(user: JoinedUser, chatter: ChatUserstate, newTrust: string) {
        const trust = new TrustPrisma(user, chatter);
        return await trust.save(newTrust, newTrust);
    }

    private async getUser(channel: string): Promise<JoinedUser> {
        const userPrisma = new UserPrisma(channel);
        return await userPrisma.get();
    }

    async run(): Promise<MessageData> {
        const { channel, message, chatter } = this.messageData;
        if (!chatter["user-id"]) {
            throw new Error("asdf")
        }
        const newTrust = message.split(" ")[1];
        if (!newTrust) throw new Error("No user specified");
        const user: JoinedUser = await this.getUser(channel);
        const isTrusted = user.trusts.find((user: Trust) => {
            return user.name.toUpperCase() === newTrust.toUpperCase();
        })
        if (!chatter.username) throw new Error("Creator not specified");
        const canAddTrust = user.trusts.some((user: Trust) => {
            if (!chatter.username) throw new Error("Creator not specified");
            return user.name.toUpperCase() === chatter.username.toUpperCase();
        }) || chatter.username.toUpperCase() === channel.toUpperCase();
        if (!canAddTrust) {
            this.messageData.response = `${chatter.username} cannot add trust`
            return this.messageData
        }
        if (isTrusted) {
            this.messageData.response = `${isTrusted.name} is already trusted`
            return this.messageData
        }
        const addTrust = await this.addTrust(user, chatter, newTrust);
        this.messageData.response = `${addTrust.name} added to trust-list`;
        return this.messageData;
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

export const isTrustedUser = async (
    streamer: string,
    madeBy: ChatUserstate
): Promise<boolean> => {
    const userModel = new UserPrisma(streamer);
    const joinedUser: JoinedUser = await userModel.get();
    const trustList = joinedUser.trusts.find((trustee: Trust) => {
        return trustee.name.toUpperCase() === madeBy.username?.toUpperCase();
    })
    if (streamer.toUpperCase() === madeBy.username?.toUpperCase()) {
        return true
    }
    if (!trustList) {
        return false;
    }
    return true;
};

export class Timestamp implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.TIMESTAMP

    constructor(public messageData: MessageData) {}

    private isTrusted = async (channel: string, chatter: ChatUserstate) => {
        const isTrusted = await isTrustedUser(channel, chatter);
        if (!isTrusted)
            throw new Error(`${chatter.username} not allowed to create timestamps`);
    }

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`msg`);
        return user;
    }

    private fetchStreamerVideos = async () => {
        const { channel } = this.messageData
        const twitchFetch = new TwitchFetch()
        const videos = await twitchFetch.fetchVideos(channel)
        return videos
    };

    // TODO: Uniqueness
    run = async () => {
        const { channel, message, chatter } = this.messageData;
        const twitchFetch = new TwitchFetch()
        const { started_at } = await twitchFetch.singleChannel(channel)
        if (started_at === "") {
            this.messageData.response = `${channel} is not live. Cannot create timestamp.`;
            return this.messageData;
        }
        if (!chatter.username) throw new Error("Creator not specified");
        await this.isTrusted(channel, chatter);
        const timestampName: string = message.split(" ")[1];
        const user = await this.getUser(channel);
        const videos: IVideo[] = await this.fetchStreamerVideos();
        const timestamp = new TimestampPrisma(user);
        const newTimestamp = await timestamp.add(
            videos[0],
            timestampName,
            chatter.username
        );
        this.messageData.response = `Timestamp ${newTimestamp.name} created. Use !findts ${newTimestamp.name} to watch it`;

        return this.messageData;
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
        console.log("~ user", user);
        const timestampObj = new TimestampPrisma(user);
        const targetTimestamp: string = message.split(" ")[1];
        console.log("targetTimestamp:", targetTimestamp)
        if (targetTimestamp === undefined) {
            const allTimestamps = await timestampObj.findAll();
            console.log("~ allTimestamps", allTimestamps);
            const timestampsList = allTimestamps
                .map((timestamp) => {
                    return timestamp.name;
                })
                .join(", ");
            this.messageData.response = `Timestamps: ${timestampsList}`;
            return this.messageData;
        }
        const foundTimestamp = await timestampObj.find(targetTimestamp);
        const backtrackLength = 90;
        const { name, url, timestamp } = foundTimestamp;
        this.messageData.response = `${name}: ${url}?t=${timestamp - backtrackLength}s`;

        return this.messageData;
    }
}

export class DeleteTimestamp implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.TIMESTAMP

    constructor(public messageData: MessageData) {}

    private isTrusted = async (channel: string, chatter: ChatUserstate) => {
        const isTrusted = await isTrustedUser(channel, chatter);
        if (!isTrusted)
            throw new Error(`${chatter.username} not allowed to delete timestamps`);
    }

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`User not found`);
        return user;
    }

    run = async () => {
        const { channel, message, chatter } = this.messageData;
        if (!chatter.username) throw new Error("Creator not specified");
        await this.isTrusted(channel, chatter);
        const timestampName: string = message.split(" ")[1];
        const user = await this.getUser(channel);
        const timestamp = new TimestampPrisma(user);
        const deleteTimestamp = await timestamp.remove(timestampName);
        this.messageData.response = `Timestamp ${deleteTimestamp.name} deleted`;

        return this.messageData;
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
        const { channel, message, chatter } = this.messageData;
        const isTrusted = await isTrustedUser(channel, chatter);
        if (!isTrusted) {
            this.messageData.response = `${chatter.username} is not allowed to toggle this command`
            return this.messageData;
        }
        const targetComponent = message.split(" ")[1].toUpperCase();
        const isModuleFamily = targetComponent in ModuleFamily;
        if (!isModuleFamily) {
            this.messageData.response = `${targetComponent} is not a valid component`
            return this.messageData
        }
        const user = await this.getUser(channel);
        const component = new ComponentPrisma(user, targetComponent);
        await component.toggle();
        const componentStatus =
            (await component.isEnabled()) === true ? "Enabled" : "Disabled";
        this.messageData.response = `Component ${targetComponent} is now: ${componentStatus}`;

        return this.messageData;

    }
}

export class Pokemon implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.POKEMON

    constructor(public messageData: MessageData) {}

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
        const targetComponent = "POKEMON";
        const userPrisma = new UserPrisma(channel);
        const user = await this.getUser(userPrisma);
        const component = new ComponentPrisma(user, targetComponent);
        const isEnabled = await component.isEnabled();
        if (!isEnabled) {
            this.messageData.response = `Component ${targetComponent} is not enabled`;
            return this.messageData
        }
        const pokemon = await pokemonAPI.get<IPokemon>(`pokemon/${targetPokemon}`);
        this.messageData.response = this.formatPokemonStats(pokemon.data);

        return this.messageData;
    }
}

export class NewCommand implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {}

    private isTrusted = async (channel: string, chatter: ChatUserstate) => {
        return await isTrustedUser(channel, chatter);
    }

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`User not found`);
        return user;
    }

    run = async () => {
        const { channel, message, chatter } = this.messageData;
        if (!chatter.username) throw new Error("Creator not specified");
        const isTrusted = await this.isTrusted(channel, chatter)
        if (!isTrusted) {
            this.messageData.response = `${chatter.username} cannot create commands. You need !trust`;
            return this.messageData;
        }
        const commandName = message.split(" ")[1];
        const commandContent = message.split(" ").slice(2).join(" ");
        const user = await this.getUser(channel);
        const commandPrisma = new CommandPrisma(user);
        const existingCommand = await commandPrisma.find(commandName)
        if (existingCommand !== null) {
            this.messageData.response = `${existingCommand.name} already exists`;
            return this.messageData;
        }

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

    private isTrusted = async (channel: string, chatter: ChatUserstate) => {
        const isTrusted = await isTrustedUser(channel, chatter);
        if (!isTrusted) throw new Error(`${chatter} not allowed to remove command`);
    }

    run = async () => {
        const { channel, message, chatter } = this.messageData;
        if (!chatter.username) throw new Error("Creator not specified");
        await this.isTrusted(channel, chatter);
        const commandName = message.split(" ")[1];
        console.log("commandName:", commandName)
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error("user not found");
        const command = new CommandPrisma(user);
        const delCommand = await command.remove(commandName);
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
        const { channel, message, chatter } = this.messageData;
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
        // jsonUser.remove(deleteUser.name);
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

