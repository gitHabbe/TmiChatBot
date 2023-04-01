import { ICommandUser } from "../../../interfaces/Command"
import { TwitchFetch } from "../../fetch/TwitchTv";
import { dateToLetters, ILetterFormattedDate, millisecondsToDistance } from "../../../utility/dateFormat";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";
import { JoinedUser } from "../../../interfaces/prisma"

export class TwitchUptime implements ICommandUser {
    public moduleFamily: ModuleFamily = ModuleFamily.UPTIME
    private twitchFetch: TwitchFetch

    constructor(public messageData: MessageData, public user: JoinedUser, twitchFetch?: TwitchFetch) {
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
        const iTwitchChannel = await this.twitchFetch.singleChannel(channel);
        return iTwitchChannel.started_at;
    }
}