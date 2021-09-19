import { Userstate } from "tmi.js";
import { twitchAPI } from "../config/twitchConfig";
import {
  IFollowage,
  IFollowageResponse,
  ITwitchChannel,
  IStreamerResponse,
  IVideosResponse,
} from "../interfaces/twitch";
import {
  datesDaysDifference,
  dateToLetters,
  extractMillisecondsToObject,
} from "../utility/dateFormat";

export const fetchStreamer = async (
  channelName: string
): Promise<ITwitchChannel> => {
  try {
    const {
      data: { data: channels },
    } = await twitchAPI.get<IStreamerResponse>(
      `/search/channels?query=${channelName}`
    );
    const channel = channels.find((name: ITwitchChannel) => {
      return name.display_name.toLowerCase() === channelName.toLowerCase();
    });
    if (channel === undefined) throw new Error("User not found");

    return channel;
  } catch (error) {
    throw new Error(`${channelName} is not online`);
  }
};

export const fetchStreamerVideos = async (user_id: number) => {
  try {
    const {
      data: { data: videos },
    } = await twitchAPI.get<IVideosResponse>(`/videos?user_id=${user_id}`);
    if (videos.length === 0) throw new Error(`Streamer doesn't save vods`);

    return videos;
  } catch (error) {
    throw new Error(`Videos not found`);
  }
};

export const getStreamerTitle = async (
  channelName: string
): Promise<string> => {
  try {
    const { title }: ITwitchChannel = await fetchStreamer(channelName);

    return title;
  } catch (error) {
    return "Unable to read title";
  }
};

export const getStreamerGame = async (channel: string): Promise<string> => {
  const { game_name }: ITwitchChannel = await fetchStreamer(channel);

  return game_name;
};

export const getStreamerUptime = async (channelName: string) => {
  try {
    const { started_at }: ITwitchChannel = await fetchStreamer(channelName);
    if (started_at === "") throw new Error("Streamer not online");
    const date_started_at: Date = new Date(started_at);
    const date_now: Date = new Date();
    const time_diff_milliseconds: number =
      date_now.getTime() - date_started_at.getTime();
    const dateDataObject = extractMillisecondsToObject(time_diff_milliseconds);
    const uptime: string = dateToLetters(dateDataObject);

    return uptime;
  } catch (error) {
    return "Unable to get uptime";
  }
};

export const fetchFollowage = async (
  streamer_id: string,
  follower_id: string
) => {
  const {
    data: { data: followage },
  } = await twitchAPI.get<IFollowageResponse>(
    `/users/follows?to_id=${streamer_id}&from_id=${follower_id}`
  );

  return followage;
};

export const getFollowage = async (channel: string, user: Userstate) => {
  if (!user["user-id"]) throw new Error(`${user.username} not found`);
  const streamer: ITwitchChannel = await fetchStreamer(channel);
  const followage: IFollowage[] = await fetchFollowage(
    streamer.id,
    user["user-id"]
  );
  if (followage.length === 0) {
    return `${user.username} is not following ${channel}`;
  }
  const days_ago: number = datesDaysDifference(followage[0].followed_at);
  console.log("day_difference:", days_ago);

  return `${user.username} followage: ${days_ago} days`;
};
