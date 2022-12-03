import { ICommand } from "../../../interfaces/Command";
import { TwitchFetch } from "../../fetch/TwitchTv";
import { MessageData } from "../../MessageData";

export class TwitchTitle implements ICommand {
    private twitchFetch: TwitchFetch

    constructor(public messageData: MessageData, twitchFetch?: TwitchFetch) {
        this.twitchFetch = twitchFetch || new TwitchFetch()
    }

    run = async () => {
        const twitchChannels = await this.twitchFetch.channelList("CHANGE ME");
        const { title } = this.twitchFetch.filteredChannel(twitchChannels, this.messageData.channel);
        this.messageData.response = title;

        return this.messageData;
    };
}