import { ICommand } from "../../../interfaces/Command";
import { TwitchFetch } from "../../fetch/TwitchTv";
import { MessageData } from "../../MessageData";
import { ITwitchChannel } from "../../../interfaces/twitch";
import { FilterTwitchChannel } from "./FilterTwitchChannel";

export class TwitchTitle implements ICommand {
    private twitchFetch: TwitchFetch

    constructor(public messageData: MessageData, twitchFetch?: TwitchFetch) {
        this.twitchFetch = twitchFetch || new TwitchFetch()
    }

    async run(): Promise<MessageData> {
        const { channel } = this.messageData;
        const twitchChannelList: ITwitchChannel[] = await this.twitchFetch.channelList(channel);
        const filterTwitchChannel = new FilterTwitchChannel();
        const singleChannel = filterTwitchChannel.channel(twitchChannelList, channel);
        this.messageData.response = singleChannel.title;
        return this.messageData;
    };
}