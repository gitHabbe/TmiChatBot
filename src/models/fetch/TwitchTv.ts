import { IStreamerResponse, ITwitchChannel } from "../../interfaces/twitch";
import { IAPI, IAxiosOptions } from "./SpeedrunCom";

export class TwitchChannelApi {
  private options: IAxiosOptions = {
    name: this.name,
    type: "channel",
    url: `/search/channels?query=${this.name}`,
  };

  constructor(private api: IAPI<IStreamerResponse>, private name: string) {}

  fetch = async (): Promise<IStreamerResponse> => {
    const { data } = await this.api.fetch(this.options);
    return data;
  };

  get = async (): Promise<ITwitchChannel | undefined> => {
    const channels = await this.fetch();
    return channels.data.find((channel: ITwitchChannel) => {
      return channel.broadcaster_login.toLowerCase() === this.name.toLowerCase();
    });
  };
}
