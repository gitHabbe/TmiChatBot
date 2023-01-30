import { twitchAPI } from "../config/twitchConfig";
import { ITwitchChannel } from "../interfaces/twitch";
import { speedrunAPI } from "../config/speedrunConfig";
import { TwitchFetch } from "./fetch/TwitchTv";
import { MessageData } from "./tmi/MessageData";

export class StringExtract {
  private twitchFetch = new TwitchFetch();
  constructor(private messageData: MessageData) {}

  async game(): Promise<string> {
    const { message } = this.messageData;
    const messageArray = message.split(" ").slice(1);
    if (!messageArray || !messageArray[0]) {
      const twitchChannels = await this.twitchFetch.channelList("CHANGE ME")
      const { game_name } = this.twitchFetch.filteredChannel(twitchChannels, this.messageData.channel);
      return game_name;
    }
    return messageArray[0];
  };

  async category(): Promise<string> {
    const { message } = this.messageData;
    const messageArray = message.split(" ").slice(2);
    if (!messageArray || !messageArray[0]) {
      const twitchChannels = await this.twitchFetch.channelList("CHANGE ME");
      const { title } = this.twitchFetch.filteredChannel(twitchChannels, this.messageData.channel);
      return title;
    }
    return messageArray.join(" ");
  };
}
