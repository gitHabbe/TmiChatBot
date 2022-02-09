import {twitchAPI} from "../../config/twitchConfig";
import {IFollowage, IFollowageResponse, IStreamerResponse, ITwitchChannel} from "../../interfaces/twitch";
import {datesDaysDifference, dateToLetters, extractMillisecondsToObject,} from "../../utility/dateFormat";
import {Api} from "../fetch/SpeedrunCom";
import {TwitchChannel} from "../fetch/TwitchTv";
import {MessageData} from "../Tmi";
import {ICommand} from "../../interfaces/Command";

abstract class TwitchFetch {
  constructor(public messageData: MessageData) {}

  twitchChannel = () => {
    const { channel } = this.messageData;
    const api = new Api<IStreamerResponse>(twitchAPI);
    const twitchChannel = new TwitchChannel(api, channel);

    return twitchChannel.find();
  };
}

export class TwitchUptime extends TwitchFetch implements ICommand {
  constructor(messageData: MessageData) {
    super(messageData);
  }

  run = async () => {
    const { channel } = this.messageData;
    const { started_at } = await this.twitchChannel();
    if (!started_at) return `${channel} not online`;
    const start: number = new Date(started_at).getTime();
    const today: number = new Date().getTime();
    const time_diff_milliseconds: number = today - start;
    const dateDataObject = extractMillisecondsToObject(time_diff_milliseconds);
    const uptime: string = dateToLetters(dateDataObject);

    return uptime;
  };
}

export class TwitchTitle extends TwitchFetch implements ICommand {
  constructor(messageData: MessageData) {
    super(messageData);
  }

  run = async () => {
    const { title } = await this.twitchChannel();

    return title;
  };
}


export class Followage extends TwitchFetch implements ICommand {
  constructor(messageData: MessageData) {
    super(messageData);
  }

  private fetchFollowage = async (
      streamer_id: string,
      follower_id: string
  ) => {
    const {
      data: {data: followage},
    } = await twitchAPI.get<IFollowageResponse>(
        `/users/follows?to_id=${streamer_id}&from_id=${follower_id}`
    );

    return followage;
  };

  private fetchStreamer = async (
      channelName: string
  ): Promise<ITwitchChannel> => {
    const query = `/search/channels?query=${channelName}`;
    const {data} = await twitchAPI.get<IStreamerResponse>(query);
    const channels: ITwitchChannel[] = data.data;
    const channel = channels.find((name: ITwitchChannel) => {
      return name.display_name.toLowerCase() === channelName.toLowerCase();
    });
    if (!channel) throw new Error("User not found");

    return channel;
  };

  run = async () => {
    const user = this.messageData.chatter
    if (!user["user-id"]) throw new Error(`${user.username} not found`);
    const { id }: ITwitchChannel = await this.fetchStreamer(this.messageData.channel);
    const followage: IFollowage[] = await this.fetchFollowage(id, user["user-id"]);
    if (followage.length === 0) {
      return `${user.username} is not following ${this.messageData.channel}`;
    }
    const days_ago: number = datesDaysDifference(followage[0].followed_at);
    console.log("day_difference:", days_ago);

    return `${user.username} followage: ${days_ago} days`;

  }
}
