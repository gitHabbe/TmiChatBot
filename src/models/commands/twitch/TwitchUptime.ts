import { ICommand } from "../../../interfaces/Command";
import { TwitchFetch } from "../../fetch/TwitchTv";
import { MessageData } from "../../MessageData";
import { dateToLetters, millisecondsToDistance } from "../../../utility/dateFormat";

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
        this.messageData.response = this.formatResponse(started_at)
        return this.messageData;
    };

    private formatResponse(started_at: string) {
        const start: number = new Date(started_at).getTime();
        const today: number = new Date().getTime();
        const time_diff_milliseconds: number = today - start;
        const dateDataObject = millisecondsToDistance(time_diff_milliseconds);
        return dateToLetters(dateDataObject);
    }

    private async getStartedAt() {
        const twitchChannels = await this.twitchFetch.channelList("CHANGE ME");
        const { started_at } = this.twitchFetch.filteredChannel(twitchChannels, this.messageData.channel);

        return started_at;
    }
}