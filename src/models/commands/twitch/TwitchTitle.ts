import { ICommandUser } from "../../../interfaces/Command"
import { TwitchFetch } from "../../fetch/TwitchTv";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";
import { JoinedUser } from "../../../interfaces/prisma"

export class TwitchTitle implements ICommandUser {
    public moduleFamily: ModuleFamily = ModuleFamily.TITLE;
    private twitchFetch: TwitchFetch

    constructor(public messageData: MessageData, public user: JoinedUser, twitchFetch?: TwitchFetch) {
        this.twitchFetch = twitchFetch || new TwitchFetch()
    }

    async run(): Promise<MessageData> {
        const { channel } = this.messageData;
        const singleChannel = await this.twitchFetch.singleChannel(channel)
        this.messageData.response = singleChannel.title;
        return this.messageData;
    };
}