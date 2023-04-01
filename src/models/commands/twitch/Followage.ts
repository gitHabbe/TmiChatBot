import { ICommandUser } from "../../../interfaces/Command"
import { TwitchFetch } from "../../fetch/TwitchTv";
import { ChatUserstate } from "tmi.js";
import { IFollowage} from "../../../interfaces/twitch";
import { datesDaysDifference } from "../../../utility/dateFormat";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";
import { JoinedUser } from "../../../interfaces/prisma"

export class Followage implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.FOLLOWAGE

    private twitchFetch = new TwitchFetch()

    constructor(public messageData: MessageData, public user: JoinedUser, twitchFetch?: TwitchFetch) {
        this.twitchFetch = twitchFetch || new TwitchFetch()
    }

    async run(): Promise<MessageData> {
        const { channel } = this.messageData;
        const follower: ChatUserstate = this.messageData.chatter
        if (!follower["user-id"]) throw new Error(`${follower.username} not found`);
        const twitchFetch = new TwitchFetch()
        const singleChannel = await twitchFetch.singleChannel(channel)
        const streamerId: string = singleChannel.id;
        const followerId: string = follower["user-id"];
        const followage: IFollowage[] = await this.twitchFetch.followage(streamerId, followerId);
        if (followage.length === 0) {
            this.messageData.response = `${follower.username} is not following ${this.messageData.channel}`;
            return this.messageData
        }
        const days_ago: number = datesDaysDifference(followage[0].followed_at);
        this.messageData.response = `${follower.username} followage: ${days_ago} days`;
        return this.messageData
    }
}