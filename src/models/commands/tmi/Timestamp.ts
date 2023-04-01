import { ICommand, ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { UserPrisma } from "../../database/UserPrisma"
import { TwitchFetch } from "../../fetch/TwitchTv"
import { IVideo } from "../../../interfaces/twitch"
import { TimestampPrisma } from "../../database/TimestampPrisma"
import { ChatError } from "../../error/ChatError"
import { TrustLevel } from "../../tmi/TrustLevel"
import { JoinedUser } from "../../../interfaces/prisma"

export class Timestamp implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.TIMESTAMP

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel)
        return await userPrisma.get()
    }

    private fetchStreamerVideos = async () => {
        const { channel } = this.messageData
        const twitchFetch = new TwitchFetch()
        return await twitchFetch.fetchVideos(channel)
    }

    run = async () => {
        const { channel, message, chatter } = this.messageData
        const twitchFetch = new TwitchFetch()
        await this.streamerNotLiveError(twitchFetch, channel)
        const user = await this.chatterNotTrustedError(channel)
        const timestampName: string = message.split(" ")[1]
        const videos: IVideo[] = await this.fetchStreamerVideos()
        const timestamp = new TimestampPrisma(user)
        await Timestamp.timestampAlreadyExistsError(timestamp, timestampName)
        if (!chatter.username) throw new Error("Useless error")
        const newTimestamp = await timestamp.add(
            videos[0],
            timestampName.toLowerCase(),
            chatter.username
        )
        this.messageData.response = `Timestamp ${newTimestamp.name} created. Use !findts ${newTimestamp.name} to watch it`

        return this.messageData
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