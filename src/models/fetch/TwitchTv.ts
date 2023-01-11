import { IFollowage, IFollowageResponse, IStreamerResponse, ITwitchChannel } from "../../interfaces/twitch";
import { AxiosInstance } from "axios";
import { twitchAPI } from "../../config/twitchConfig";

export class TwitchFetch {
    private api: AxiosInstance = twitchAPI;

    async channelList(channel: string): Promise<ITwitchChannel[]> {
        const query = `/search/channels?query=${channel}`;
        const { data: { data: twitchChannelList } } = await this.api.get<IStreamerResponse>(query);
        return twitchChannelList
    };

    async followage(streamerId: string, followerId: string): Promise<IFollowage[]> {
        const query = `/users/follows?to_id=${streamerId}&from_id=${followerId}`;
        const { data: { data: followage }, } = await this.api.get<IFollowageResponse>(query);
        return followage
    }

    filteredChannel(twitchChannel: ITwitchChannel[], channelParameter: string): ITwitchChannel {
        const targetChannel = twitchChannel.find((channel: ITwitchChannel) => {
            return channel.display_name.toLowerCase() === channelParameter.toLowerCase()
        })
        if (targetChannel === undefined) throw new Error("Error using command")
        return targetChannel;
    }
}