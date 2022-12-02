import { IFollowage, IFollowageResponse,  ITwitchChannel } from "../../interfaces/twitch";
import { AxiosInstance } from "axios";
import { twitchAPI } from "../../config/twitchConfig";
import { ChatUserstate } from "tmi.js";

export class TwitchFetch {
    private api: AxiosInstance = twitchAPI;

    async getChannels(channel: string): Promise<ITwitchChannel[]> {
        const query = `/search/channels?query=${channel}`;
        const { data: twitchChannelList } = await this.api.get<ITwitchChannel[]>(query);
        return twitchChannelList
    };

    async fetchFollowage(channel: string = "CHANGE ME", chatter: ChatUserstate): Promise<IFollowage[]> {
        const twitchChannels: ITwitchChannel[] = await this.getChannels(channel);
        const targetChannel = this.filteredChannel(twitchChannels);
        const follower: ChatUserstate = chatter
        const followerId = follower["user-id"];
        if (!followerId) throw new Error(`${follower.username} not found`);
        const { id } = targetChannel;
        const query = `/users/follows?to_id=${id}&from_id=${followerId}`;
        const { data: { data: followage }, } = await this.api.get<IFollowageResponse>(query);

        return followage
    }

    filteredChannel(twitchChannel: ITwitchChannel[]): ITwitchChannel {
        const targetChannel = twitchChannel.find((channel: ITwitchChannel) => {
            return channel.display_name.toLowerCase() === this.messageData.channel
        })
        if (targetChannel === undefined) throw new Error("Error using command")
        return targetChannel;
    }
}