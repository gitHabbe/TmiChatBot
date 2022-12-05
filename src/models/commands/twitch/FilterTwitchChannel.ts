import { ITwitchChannel } from "../../../interfaces/twitch";

export class FilterTwitchChannel {
    channel(twitchChannels: ITwitchChannel[], targetChannel: string) {
        const filteredChannel = twitchChannels.find((twitchChannel: ITwitchChannel) => {
            return twitchChannel.display_name.toLowerCase() === targetChannel.toLowerCase()
        })
        if (filteredChannel === undefined) throw new Error("Error using command")
        return filteredChannel;
    }
}