import { ICommand } from "../../../interfaces/Command";
import { TwitchFetch } from "../../fetch/TwitchTv";
import { MessageData } from "../../MessageData";
import { dateToLetters, ILetterFormattedDate, millisecondsToDistance } from "../../../utility/dateFormat";
import { ITwitchChannel } from "../../../interfaces/twitch";
import { FilterTwitchChannel } from "./FilterTwitchChannel";

export class TwitchUptime implements ICommand {
    private twitchFetch: TwitchFetch

    constructor(public messageData: MessageData, twitchFetch?: TwitchFetch) {
        this.twitchFetch = twitchFetch || new TwitchFetch()
    }

    async run(): Promise<MessageData> {
        const { channel } = this.messageData;
        const started_at = await this.getStartedAt();
        if (!started_at) {
            this.messageData.response = `${channel} not online`;
            return this.messageData
        }
        this.messageData.response = TwitchUptime.formatResponse(started_at)
        return this.messageData;
    };

    private static formatResponse(started_at: string): string {
        const start: number = new Date(started_at).getTime();
        const today: number = new Date().getTime();
        const time_diff_milliseconds: number = today - start;
        const dateDataObject: ILetterFormattedDate = millisecondsToDistance(time_diff_milliseconds);
        return dateToLetters(dateDataObject);
    }

    private async getStartedAt(): Promise<string> {
        const { channel } = this.messageData;
        const twitchChannelList: ITwitchChannel[] = await this.twitchFetch.channelList(channel);
        const filterTwitchChannel = new FilterTwitchChannel();
        const singleChannel = filterTwitchChannel.channel(twitchChannelList, channel);
        return singleChannel.started_at;
    }
}