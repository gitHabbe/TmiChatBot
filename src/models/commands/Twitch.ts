import { twitchAPI } from "../../config/twitchConfig";
import { IFollowage, IFollowageResponse, ITwitchChannl } from "../../interfaces/twitch";
import { datesDaysDifference, dateToLetters, millisecondsToDistance, } from "../../utility/dateFormat";
import { ICommand } from "../../interfaces/Command";
import { MessageData } from "../MessageData";
import { ChatUserstate } from "tmi.js";
import { AxiosInstance } from "axios";

export class TwitchFetch {
  private api: AxiosInstance = twitchAPI;

  constructor() {}

  async getChannels(channel: string): Promise<ITwitchChannel[]> {
    const query = `/search/channels?query=${channel}`;
    const { data: twitchChannelList } = await this.api.get<ITwitchChannel[]>(query);
    return twitchChannelList
  };

  async fetchFollowage(channel: string = "CHANGE ME", chatter: ChatUserstate): Promise<IFollowage[]> {
    const twitchChannels: ITwitchChannel[] = await this.getChannels(channel);
    const targetChannel = this.filteredChannel(twitchChannels);
    const follower: ChatUserstate = chatter
    const followerId = follower["user-id"];
    if (!followerId) throw new Error(`${follower.username} not found`);
    const { id } = targetChannel;
    const query = `/users/follows?to_id=${id}&from_id=${followerId}`;
    const { data: { data: followage }, } = await this.api.get<IFollowageResponse>(query);

    return followage
  }

  filteredChannel(twitchChannel: ITwitchChannel[]): ITwitchChannel {
    const targetChannel = twitchChannel.find((channel: ITwitchChannel) => {
      return channel.display_name.toLowerCase() === this.messageData.channel
    })
    if (targetChannel === undefined) throw new Error("Error using command")
    return targetChannel;
  }
}

export class TwitchUptime implements ICommand {
  private twitchFetch: TwitchFetch

  constructor(public messageData: MessageData, twitchFetch?: TwitchFetch) {
    this.twitchFetch = twitchFetch || new TwitchFetch()
  }

  run = async () => {
    const { channel } = this.messageData;
    const started_at = await this.getStartedAt();
    if (!started_at) {
      this.messageData.response = `${channel} not online`;
      return this.messageData
    }
    this.messageData.response = this.formatResponse(started_at)
    return this.messageData;
  };

  private formatResponse(started_at: string) {
    const start: number = new Date(started_at).getTime();
    const today: number = new Date().getTime();
    const time_diff_milliseconds: number = today - start;
    const dateDataObject = millisecondsToDistance(time_diff_milliseconds);
    return dateToLetters(dateDataObject);
  }

  private async getStartedAt() {
    const twitchChannels = await this.twitchFetch.getChannels("CHANGE ME");
    const { started_at } = this.twitchFetch.filteredChannel(twitchChannels);

    return started_at;
  }
}

export class TwitchTitle implements ICommand {
  private twitchFetch: TwitchFetch

  constructor(public messageData: MessageData, twitchFetch?: TwitchFetch) {
    this.twitchFetch = twitchFetch || new TwitchFetch()
  }

  run = async () => {
    const twitchChannels = await this.twitchFetch.getChannels("CHANGE ME");
    const { title } = this.twitchFetch.filteredChannel(twitchChannels);
    this.messageData.response = title;

    return this.messageData;
  };
}


export class Followage implements ICommand {
  private twitchFetch = new TwitchFetch()

  constructor(public messageData: MessageData) {}

  run = async () => {
    const user = this.messageData.chatter
    if (!user["user-id"]) throw new Error(`${user.username} not found`);
    const followage: IFollowage[] = await this.twitchFetch.fetchFollowage();
    if (followage.length === 0) {
      this.messageData.response = `${user.username} is not following ${this.messageData.channel}`;
      return this.messageData
    }
    const days_ago: number = datesDaysDifference(followage[0].followed_at);
    console.log("day_difference:", days_ago);
    this.messageData.response = `${user.username} followage: ${days_ago} days`;

    return this.messageData

  }
}
