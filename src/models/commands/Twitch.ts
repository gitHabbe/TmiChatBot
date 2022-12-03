import { IFollowage, ITwitchChannel } from "../../interfaces/twitch";
import { datesDaysDifference, dateToLetters, millisecondsToDistance, } from "../../utility/dateFormat";
import { ICommand } from "../../interfaces/Command";
import { MessageData } from "../MessageData";
import { TwitchFetch } from "../fetch/TwitchTv";
import { ChatUserstate } from "tmi.js";

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
    const twitchChannels = await this.twitchFetch.channelList("CHANGE ME");
    const { started_at } = this.twitchFetch.filteredChannel(twitchChannels, this.messageData.channel);

    return started_at;
  }
}

export class TwitchTitle implements ICommand {
  private twitchFetch: TwitchFetch

  constructor(public messageData: MessageData, twitchFetch?: TwitchFetch) {
    this.twitchFetch = twitchFetch || new TwitchFetch()
  }

  run = async () => {
    const twitchChannels = await this.twitchFetch.channelList("CHANGE ME");
    const { title } = this.twitchFetch.filteredChannel(twitchChannels, this.messageData.channel);
    this.messageData.response = title;

    return this.messageData;
  };
}


export class Followage implements ICommand {
  private twitchFetch = new TwitchFetch()

  constructor(public messageData: MessageData) {}

  async run(): Promise<MessageData> {
    const follower: ChatUserstate = this.messageData.chatter
    if (!follower["user-id"]) throw new Error(`${follower.username} not found`);
    const channelList: ITwitchChannel[] = await this.twitchFetch.channelList(this.messageData.channel)
    const targetChannel = this.getChannel(channelList);
    const streamerId: string = targetChannel.display_name;
    const followerId: string = follower["user-id"];
    const followage: IFollowage[] = await this.twitchFetch.followage(streamerId, followerId);
    if (followage.length === 0) {
      this.messageData.response = `${follower.username} is not following ${this.messageData.channel}`;
      return this.messageData
    }
    const days_ago: number = datesDaysDifference(followage[0].followed_at);
    this.messageData.response = `${follower.username} followage: ${days_ago} days`;

    return this.messageData

  }

  private getChannel(channelList: ITwitchChannel[]) {
    const targetChannel = channelList.find((channel: ITwitchChannel) => {
      return channel.display_name.toLowerCase() === this.messageData.channel.toLowerCase()
    })
    if (targetChannel === undefined) throw new Error("Error using command")
    return targetChannel;
  }
}
