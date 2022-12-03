import { ICommand } from "../../../interfaces/Command";
import { TwitchFetch } from "../../fetch/TwitchTv";
import { MessageData } from "../../MessageData";
import { ChatUserstate } from "tmi.js";
import { IFollowage, ITwitchChannel } from "../../../interfaces/twitch";
import { datesDaysDifference } from "../../../utility/dateFormat";

export class Followage implements ICommand {
    private twitchFetch = new TwitchFetch()

    constructor(public messageData: MessageData) {
    }

    async run(): Promise<MessageData> {
        const follower: ChatUserstate = this.messageData.chatter
        if (!follower["user-id"]) throw new Error(`${follower.username} not found`);
        const channelList: ITwitchChannel[] = await this.twitchFetch.channelList(this.messageData.channel)
        const targetChannel = this.getChannel(channelList);
        const streamerId: string = targetChannel.display_name;
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

    private getChannel(channelList: ITwitchChannel[]) {
        const targetChannel = channelList.find((channel: ITwitchChannel) => {
            return channel.display_name.toLowerCase() === this.messageData.channel.toLowerCase()
        })
        if (targetChannel === undefined) throw new Error("Error using command")
        return targetChannel;
    }
}