import {
    IFollowage,
    IFollowageResponse,
    IStreamerResponse,
    ITwitchChannel, IVideo,
    IVideosResponse
} from "../../interfaces/twitch"
import { AxiosInstance } from "axios";
import { twitchAPI } from "../../config/twitchConfig";

export class TwitchFetch {
    private api: AxiosInstance = twitchAPI;

    async getTitle(channel: string) {
        const { title } = await this.singleChannel(channel);
        return title;
    }

    async singleChannel(channel: string): Promise<ITwitchChannel> {
        const twitchChannels = await this.channelList(channel);
        return this.filteredChannel(twitchChannels, channel);
    }

    private filteredChannel(twitchChannel: ITwitchChannel[], channelParameter: string): ITwitchChannel {
        const targetChannel = twitchChannel.find((channel: ITwitchChannel) => {
            return channel.display_name.toLowerCase() === channelParameter.toLowerCase()
        })
        if (targetChannel === undefined) throw new Error("Error using command")
        return targetChannel;
    }

    async followage(streamerId: string, followerId: string): Promise<IFollowage[]> {
        const query = `/users/follows?to_id=${streamerId}&from_id=${followerId}`;
        const { data: { data: followage }, } = await this.api.get<IFollowageResponse>(query);
        return followage
    }

    private async channelList(channel: string): Promise<ITwitchChannel[]> {
        const query = `/search/channels?query=${channel}`;
        const { data: { data: twitchChannelList } } = await this.api.get<IStreamerResponse>(query);
        return twitchChannelList
    };

    async fetchVideos(channel: string): Promise<IVideo[]> {
        const { id } = await this.singleChannel(channel)
        const query = `/videos?user_id=${id}`;
        const { data } = await this.api.get<IVideosResponse>(query)
        return data.data;
    }
}