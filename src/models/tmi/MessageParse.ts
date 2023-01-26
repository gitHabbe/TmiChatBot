import { MessageData } from "./MessageData";
import { TwitchFetch } from "../fetch/TwitchTv";

export class MessageParser {
    getCommandName(message: string): string {
        const chatterCommand = this.getWordIndex(message, 0);
        return chatterCommand.slice(1).toUpperCase();
    };

    async getGame(messageData: MessageData, index: number, twitchFetch?: TwitchFetch): Promise<string> {
        const { message, channel } = messageData;
        const specifiedGame = this.getWordIndex(message, index)
        if (!specifiedGame) {
            twitchFetch = twitchFetch || new TwitchFetch()
            const twitchChannels = await twitchFetch.channelList(channel)
            const { game_name } = twitchFetch.filteredChannel(twitchChannels, channel);
            return game_name;
        }
        return specifiedGame
    }

    getWordIndex(message: string, index: number): string {
        return message.split(" ")[index];
    }
}