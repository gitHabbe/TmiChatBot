import { IStreamerResponse, ITwitchChannel } from "../../interfaces/twitch";
import { IAPI, IAxiosOptions } from "./SpeedrunCom";

export class TwitchChannel {
  private options: IAxiosOptions = {
    name: this.name,
    type: "channel",
    url: `/search/channels?query=${this.name}`,
  };

  constructor(private api: IAPI<IStreamerResponse>, private name: string) {}

  fetch = async () => {
    const { data } = await this.api.fetch(this.options);
    return data;
  };

  find = async () => {
    const channels = await this.fetch();
    const channel = channels.data.find((channel: ITwitchChannel) => {
      return channel.broadcaster_login === this.name.toLowerCase();
    });

    if (!channel) throw new Error(`Channel: ${this.name} not found`);
    return channel;
  };
}
