import { twitchAPI } from "../config/twitchConfig";
import { IStreamerResponse } from "../interfaces/twitch";
import { Api } from "./fetch/SpeedrunCom";
import { TwitchChannelApi } from "./fetch/TwitchTv";
import { MessageData } from "./MessageData";
import { TwitchFetch } from "./commands/Twitch";

export class StringExtract {
  private twitchFetch = new TwitchFetch(this.messageData);
  constructor(private messageData: MessageData) {}

  game = async (): Promise<string> => {
    const { message } = this.messageData;
    const messageArray = message.split(" ").slice(1);
    if (!messageArray || !messageArray[0]) {
      const twitchChannels = await this.twitchFetch.getChannels()
      const { game_name } = this.twitchFetch.filteredChannel(twitchChannels);
      return game_name;
    }
    return messageArray[0];
  };

  category = async (): Promise<string> => {
    const { message } = this.messageData;
    const messageArray = message.split(" ").slice(2);
    if (!messageArray || !messageArray[0]) {
      const twitchChannels = await this.twitchFetch.getChannels();
      const { title } = this.twitchFetch.filteredChannel(twitchChannels);
      return title;
    }
    return messageArray.join(" ");
  };
}
