import { twitchAPI } from "../config/twitchConfig";
import { IChannelType, IStreamerResponse } from "../interfaces/twitch";
import {
  dateToLetters,
  extractMillisecondsToObject,
} from "../utility/dateFormat";

export const fetchStreamerByUsername = async (
  channelName: string
): Promise<IChannelType> => {
  try {
    const {
      data: { data: streamers },
    } = await twitchAPI.get<IStreamerResponse>(
      `/search/channels?query=${channelName}`
    );
    const streamer = streamers.find(
      (name: IChannelType) =>
        name.display_name.toLowerCase() === channelName.toLowerCase()
    );
    if (streamer === undefined) throw new Error("User not found");

    return streamer;
  } catch (error) {
    throw new Error(`${channelName} is not online`);
  }
};

export const getStreamerTitle = async (
  channelName: string
): Promise<string> => {
  try {
    const { title }: IChannelType = await fetchStreamerByUsername(channelName);

    return title;
  } catch (error) {
    return error.message;
  }
};

export const getStreamerGame = async (channel: string): Promise<string> => {
  const { game_name }: IChannelType = await fetchStreamerByUsername(channel);

  return game_name;
};

export const getStreamerUptime = async (channelName: string) => {
  try {
    const { started_at }: IChannelType = await fetchStreamerByUsername(
      channelName
    );
    if (started_at === "") throw new Error("Streamer not online");
    const date_started_at: Date = new Date(started_at);
    const date_now: Date = new Date();
    const time_diff_milliseconds: number =
      date_now.getTime() - date_started_at.getTime();
    const dateDataObject = extractMillisecondsToObject(time_diff_milliseconds);
    const uptime: string = dateToLetters(dateDataObject);

    return uptime;
  } catch (error) {
    return error.message;
  }
};
