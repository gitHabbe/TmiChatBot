import { ICommand } from "../../interfaces/Command";
import { ChatUserstate } from "tmi.js";
import { TrustPrisma } from "../database/TrustPrisma";
import { UserPrisma } from "../database/UserPrisma";
import { ComponentPrisma } from "../database/ComponentPrisma";
import { MessageData } from "../tmi/MessageData";
import { ModuleFamily } from "../../interfaces/tmi";
import { JoinedUser } from "../../interfaces/prisma";
import { Trust } from "@prisma/client";

export class AddTrust implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {
    }

    private async addTrust(user: JoinedUser, chatter: ChatUserstate, newTrust: string) {
        const trust = new TrustPrisma(user, chatter);
        return await trust.save(newTrust, newTrust);
    }

    private async getUser(channel: string): Promise<JoinedUser> {
        const userPrisma = new UserPrisma(channel);
        return await userPrisma.get();
    }

    run = async () => {
        const { channel, message, chatter } = this.messageData;
        if (!chatter.username) throw new Error("Creator not specified");
        if (!chatter.id) {
            throw new Error("asdf")
        }
        const newTrust = message.split(" ")[1];
        if (!newTrust) throw new Error("No user specified");
        const user: JoinedUser = await this.getUser(channel);
        const isTrusted = user.trusts.find((user: Trust) => {
            return user.name.toUpperCase() === newTrust.toUpperCase();
        })
        if (isTrusted) {
            this.messageData.response = `${isTrusted.name} is already trusted`
            return this.messageData
        }
        const addTrust = await this.addTrust(user, chatter, newTrust);
        this.messageData.response = `${addTrust.name} added to trust-list`;
        return this.messageData;
    }
}

export class NewTrust {
    constructor(public messageData: MessageData) {
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
        const newTrust = message.split(" ")[1];
        if (!newTrust) throw new Error("No user specified");
        const user = await this.getUser(channel);
        const trust = new TrustPrisma(user, chatter);
        const addTrust = await trust.save(chatter.username);
        this.messageData.response = `${addTrust.name} added to trust-list`;

        return this.messageData;
    }
}

// export class UnTrust implements ICommand {
//     constructor(public messageData: MessageData) {
//     }
//
//     private getUser = async (channel: string) => {
//         const userPrisma = new UserModel(channel);
//         const user = await userPrisma.get();
//         if (!user) throw new Error(`User not found`);
//         return user;
//     }
//
//     run = async () => {
//         const { channel, message, chatter } = this.messageData;
//         if (!chatter.username) throw new Error("Creator not specified");
//         const deleteTrust = message.split(" ")[1];
//         if (!deleteTrust) throw new Error("No user specified");
//         const user = await this.getUser(channel);
//         const trust = new TrustModel(user, chatter);
//         const removeTrust = await trust.delete(chatter.username);
//         this.messageData.response = `${removeTrust} removed from trust-list`;
//
//         return this.messageData;
//     }
// }

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

// export class Timestamp {
//     constructor(public messageData: MessageData) {
//     }
//
//     private isTrusted = async (channel: string, chatter: ChatUserstate) => {
//         const isTrusted = await isTrustedUser(channel, chatter);
//         if (!isTrusted)
//             throw new Error(`${chatter.username} not allowed to create timestamps`);
//     }
//
//     private getUser = async (channel: string) => {
//         const userPrisma = new UserModel(channel);
//         const user = await userPrisma.get();
//         if (!user) throw new Error(`msg`);
//         return user;
//     }
//
//     private fetchStreamerVideos = async (user_id: number) => {
//         try {
//             const {
//                 data: { data: videos },
//             } = await twitchAPI.get<IVideosResponse>(`/videos?user_id=${user_id}`);
//             if (videos.length === 0) throw new Error(`Streamer doesn't save vods`);
//
//             return videos;
//         } catch (error) {
//             throw new Error(`Videos not found`);
//         }
//     };
//
//     private fetchStreamer = async (
//         channelName: string
//     ): Promise<ITwitchChannel> => {
//         const query = `/search/channels?query=${channelName}`;
//         const { data } = await twitchAPI.get<IStreamerResponse>(query);
//         const channels: ITwitchChannel[] = data.data;
//         const channel = channels.find((name: ITwitchChannel) => {
//             return name.display_name.toLowerCase() === channelName.toLowerCase();
//         });
//         if (!channel) throw new Error("User not found");
//
//         return channel;
//     };
//
//     // TODO: Uniqueness
//     run = async () => {
//         const { channel, message, chatter } = this.messageData;
//         if (!chatter.username) throw new Error("Creator not specified");
//         await this.isTrusted(channel, chatter);
//         const timestampName: string = message.split(" ")[1];
//         const user = await this.getUser(channel);
//         const { id, started_at }: ITwitchChannel = await this.fetchStreamer(channel);
//         const videos: IVideo[] = await this.fetchStreamerVideos(parseInt(id));
//         const timestamp = new TimestampPrisma(user);
//         const newTimestamp = await timestamp.add(
//             videos[0],
//             timestampName,
//             chatter.username
//         );
//         this.messageData.response = `Timestamp ${newTimestamp.name} created. Use !findts ${newTimestamp.name} to watch it`;
//
//         return this.messageData;
//     }
// }

// export class FindTimestamp {
//     constructor(public messageData: MessageData) {
//     }
//
//     private getUser = async (channel: string) => {
//         const userPrisma = new UserModel(channel);
//         const user = await userPrisma.get();
//         if (!user) throw new Error(`msg`);
//         return user;
//     }
//
//     run = async () => {
//         const { channel, message, chatter } = this.messageData;
//         const user = await this.getUser(channel);
//         console.log("~ user", user);
//         const timestampObj = new TimestampPrisma(user);
//         const targetTimestamp: string = message.split(" ")[1];
//         console.log("targetTimestamp:", targetTimestamp)
//         if (targetTimestamp === undefined) {
//             const allTimestamps = await timestampObj.findAll();
//             console.log("~ allTimestamps", allTimestamps);
//             const timestampsList = allTimestamps
//                 .map((timestamp) => {
//                     return timestamp.name;
//                 })
//                 .join(", ");
//             this.messageData.response = `Timestamps: ${timestampsList}`;
//             return this.messageData;
//         }
//         const foundTimestamp = await timestampObj.find(targetTimestamp);
//         const backtrackLength = 90;
//         const { name, url, timestamp } = foundTimestamp;
//         this.messageData.response = `${name}: ${url}?t=${timestamp - backtrackLength}s`;
//
//         return this.messageData;
//     }
// }

// export class DeleteTimestamp {
//     constructor(public messageData: MessageData) {
//     }
//
//     private isTrusted = async (channel: string, chatter: ChatUserstate) => {
//         const isTrusted = await isTrustedUser(channel, chatter);
//         if (!isTrusted)
//             throw new Error(`${chatter.username} not allowed to delete timestamps`);
//     }
//
//     private getUser = async (channel: string) => {
//         const userPrisma = new UserModel(channel);
//         const user = await userPrisma.get();
//         if (!user) throw new Error(`User not found`);
//         return user;
//     }
//
//     run = async () => {
//         const { channel, message, chatter } = this.messageData;
//         if (!chatter.username) throw new Error("Creator not specified");
//         await this.isTrusted(channel, chatter);
//         const timestampName: string = message.split(" ")[1];
//         const user = await this.getUser(channel);
//         const timestamp = new TimestampPrisma(user);
//         const deleteTimestamp = await timestamp.remove(timestampName);
//         this.messageData.response = `Timestamp ${deleteTimestamp.name} deleted`;
//
//         return this.messageData;
//     }
// }

export class ToggleComponent implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.UPTIME;

    constructor(public messageData: MessageData) {
    }

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`msg`);
        return user;
    }

    run = async () => {
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

// export class Pokemon {
//     constructor(public messageData: MessageData) {
//     }
//
//     private getUser = async (userPrisma: UserModel) => {
//         const user = await userPrisma.get();
//         if (!user) throw new Error(`msg`);
//         return user;
//     }
//
//     private formatPokemonStats = (pokemon: IPokemon) => {
//         const truncatedStats = [ "HP", "A", "D", "SA", "SD", "S" ];
//         const stats = pokemon.stats.map((stat: IPokemonStat, i: number) => {
//             return `${truncatedStats[i]}:${stat.base_stat}`;
//         });
//         const statsString = stats.join(" ");
//         const types = pokemon.types.map((type) => {
//             return type.type.name[0].toUpperCase() + type.type.name.slice(1);
//         });
//         const typesString = types.join(" & ");
//         const { name, id } = pokemon;
//         const formalName = name[0].toUpperCase() + name.slice(1);
//
//         return `${formalName} #${id} | ${typesString} | ${statsString}`;
//     };
//
//     run = async () => {
//         const { channel, message } = this.messageData;
//         const targetPokemon = message.split(" ")[1];
//         const targetComponent = "POKEMON";
//         const userPrisma = new UserModel(channel);
//         const user = await this.getUser(userPrisma);
//         const component = new ComponentPrisma(user, targetComponent);
//         const isEnabled = await component.isEnabled();
//         if (!isEnabled) {
//             this.messageData.response = `Component ${targetComponent} is not enabled`;
//             return this.messageData
//         }
//         const pokemon = await pokemonAPI.get<IPokemon>(`pokemon/${targetPokemon}`);
//         this.messageData.response = this.formatPokemonStats(pokemon.data);
//
//         return this.messageData;
//     }
// }

// export class NewCommand {
//     constructor(public messageData: MessageData) {
//     }
//
//     private isTrusted = async (channel: string, chatter: ChatUserstate) => {
//         const isTrusted = await isTrustedUser(channel, chatter);
//         if (!isTrusted) throw new Error(`${chatter} not allowed to do that`);
//     }
//
//     private getUser = async (channel: string) => {
//         const userPrisma = new UserModel(channel);
//         const user = await userPrisma.get();
//         if (!user) throw new Error(`User not found`);
//         return user;
//     }
//
//     run = async () => {
//         const { channel, message, chatter } = this.messageData;
//         if (!chatter.username) throw new Error("Creator not specified");
//         await this.isTrusted(channel, chatter);
//         const commandName = message.split(" ")[1];
//         const commandContent = message.split(" ").slice(1).join("");
//         const user = await this.getUser(channel);
//         const newCommand = new CommandPrisma(user);
//         const command = await newCommand.add(
//             commandName,
//             commandContent,
//             chatter.username
//         );
//         this.messageData.response = `Command ${command.name} created`;
//
//         return this.messageData;
//     }
// }

// export class DeleteCommand {
//     constructor(public messageData: MessageData) {
//     }
//
//     private isTrusted = async (channel: string, chatter: ChatUserstate) => {
//         const isTrusted = await isTrustedUser(channel, chatter);
//         if (!isTrusted) throw new Error(`${chatter} not allowed to remove command`);
//     }
//
//     run = async () => {
//         const { channel, message, chatter } = this.messageData;
//         if (!chatter.username) throw new Error("Creator not specified");
//         await this.isTrusted(channel, chatter);
//         const commandName = message.split(" ")[1];
//         console.log("commandName:", commandName)
//         const userPrisma = new UserModel(channel);
//         const user = await userPrisma.get();
//         if (!user) throw new Error("user not found");
//         const command = new CommandPrisma(user);
//         const delCommand = await command.remove(commandName);
//         this.messageData.response = `Command ${delCommand.name} deleted`;
//
//         return this.messageData;
//
//     }
// }

// export class Slots {
//     constructor(public messageData: MessageData) {
//     }
//
//     run = async () => {
//         const { channel, message, chatter } = this.messageData;
//         const targetComponent = "SLOTS";
//         const userPrisma = new UserModel(channel);
//         const user = await userPrisma.get();
//         if (!user) throw new Error(`msg`);
//         const component = new ComponentPrisma(user, targetComponent);
//         const isEnabled = await component.isEnabled();
//         if (!isEnabled) {
//             this.messageData.response = `Component ${targetComponent} is not enabled`;
//             return this.messageData
//         }
//
//         const emoteSelection = [
//             "PogChamp",
//             "EleGiggle",
//             "Jebaited",
//             "VoHiYo",
//             "SeemsGood",
//         ];
//         const maxLength = emoteSelection.length;
//         const rolls = [
//             randomInt(maxLength),
//             randomInt(maxLength),
//             randomInt(maxLength),
//         ];
//         const isBingo: boolean = rolls.every((roll) => roll === rolls[0]);
//         const gameResult = [
//             emoteSelection[rolls[0]],
//             emoteSelection[rolls[1]],
//             emoteSelection[rolls[2]],
//         ];
//         const gameResultSentence = gameResult.join(" | ");
//         this.messageData.response = gameResultSentence;
//
//         return this.messageData;
//
//     }
// }

// export class UserJoin {
//     constructor(public messageData: MessageData) {}
//
//     async run() {
//         const { channel,  chatter } = this.messageData;
//         const botName = process.env.TWITCH_USERNAME;
//         if (channel !== botName) {
//             this.messageData.response = `!join only works in ${botName}'s channel`
//             return this.messageData
//         }
//         if (!chatter.username) {
//             this.messageData.response = "User not found";
//             return this.messageData
//         }
//         const user = new UserModel(chatter.username);
//         const newPrismaUser = await user.save();
//
//         if (newPrismaUser) {
//             const jsonUser = new JsonStringArray();
//             jsonUser.add(newPrismaUser.name);
//             const client = ClientSingleton.getInstance().get();
//             await client.join(newPrismaUser.name)
//         }
//         this.messageData.response = `I have joined channel: ${newPrismaUser.name}`;
//
//         return this.messageData;
//     }
// }

// export class UserLeave {
//     constructor(public messageData: MessageData, private tmiClient: Client) {
//     }
//
//     run = async () => {
//         const { channel, message, chatter } = this.messageData;
//         if (!chatter.username) {
//             throw new Error("User not found");
//         }
//         const user = new UserModel(chatter.username);
//         const removedUser = await user.delete();
//         if (removedUser) {
//             const jsonUser = new JsonStringArray();
//             jsonUser.remove(removedUser.name);
//             await this.tmiClient.part(removedUser.name)
//         }
//         this.messageData.response = `I have left channel: ${removedUser.name}`;
//
//         return this.messageData;
//     }
// }
