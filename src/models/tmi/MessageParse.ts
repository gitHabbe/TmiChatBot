import { MessageData } from "./MessageData"
import { TwitchFetch } from "../fetch/TwitchTv"

export class MessageParser {
    getCommandName(message: string): string {
        const chatterCommand = this.getWordIndex(message, 0)
        return chatterCommand.slice(1).toUpperCase()
    };

    getWordIndex(message: string, index: number): string {
        return message.split(" ")[index]
    }

    private static getSentenceFromIndex(message: string, index: number): string {
        return message.split(" ").slice(index).join(" ")
    }

    async gameName(messageData: MessageData, index: number, twitchFetch?: TwitchFetch): Promise<string> {
        const { message, channel } = messageData
        const targetGame = this.getWordIndex(message, index)
        if (!targetGame) {
            const fetcher = twitchFetch || new TwitchFetch()
            const { game_name } = await fetcher.singleChannel(channel)
            return game_name
        }
        return targetGame
    }

    async categoryName(messageData: MessageData, index: number, twitchFetch?: TwitchFetch): Promise<string> {
        const { message, channel } = messageData
        const targetCategory = MessageParser.getSentenceFromIndex(message, index)
        if (!targetCategory) {
            const fetcher = twitchFetch || new TwitchFetch()
            return fetcher.getTitle(channel)
        }
        return targetCategory
    }
}
