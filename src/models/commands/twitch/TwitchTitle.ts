import { ICommand } from "../../../interfaces/Command";
import { TwitchFetch } from "../../fetch/TwitchTv";
import { ITwitchChannel } from "../../../interfaces/twitch";
import { FilterTwitchChannel } from "./FilterTwitchChannel";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";

export class TwitchTitle implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.TITLE;
    private twitchFetch: TwitchFetch

    constructor(public messageData: MessageData, twitchFetch?: TwitchFetch) {
        this.twitchFetch = twitchFetch || new TwitchFetch()
    }

    async run(): Promise<MessageData> {
        const { channel } = this.messageData;
        const singleChannel = await this.twitchFetch.singleChannel(channel)
        this.messageData.response = singleChannel.title;
        return this.messageData;
    };
}