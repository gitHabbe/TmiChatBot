import { twitchAPI } from "../config/twitchConfig";
import { IStreamerResponse, ITwitchChannel } from "../interfaces/twitch";
import { Api } from "./fetch/SpeedrunCom";
import { TwitchChannel } from "./fetch/TwitchTv";
import {MessageData} from "./MessageData";

export class StringExtract {
  constructor(private messageData: MessageData) {}

  game = async (): Promise<string> => {
    const { channel, message } = this.messageData;
    const messageArray = message.split(" ").slice(1);
    if (!messageArray || !messageArray[0]) {
      const api = new Api<IStreamerResponse>(twitchAPI);
      const twitchChannel = new TwitchChannel(api, channel);
      const { game_name } = await twitchChannel.find();
      return game_name;
    }
    return messageArray[0];
  };

  category = async (): Promise<string> => {
    const { channel, message } = this.messageData;
    const messageArray = message.split(" ").slice(2);
    if (!messageArray || !messageArray[0]) {
      const api = new Api<IStreamerResponse>(twitchAPI);
      const twitchChannel = new TwitchChannel(api, channel);
      const { title } = await twitchChannel.find();
      return title;
    }
    return messageArray.join(" ");
  };
}
