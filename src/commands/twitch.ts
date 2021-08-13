import { twitchAPI } from "../config/twitchConfig";
import { IChannelType, IStreamerResponse } from "../interfaces/twitch";
import {
  dateToLetters,
  extractMillisecondsToObject,
} from "../utility/dateFormat";

export const fetchStreamerByUsername = async (
  channelName: string
): Promise<IChannelType> => {
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
};

export const getStreamerTitle = async (
  channelName: string
): Promise<string> => {
  const { title } = await fetchStreamerByUsername(channelName);

  return title;
};

export const getStreamerGame = async (channel: string): Promise<string> => {
  const { game_name } = await fetchStreamerByUsername(channel);

  return game_name;
};

export const getStreamerUptime = async (channelName: string) => {
  const { started_at } = await fetchStreamerByUsername(channelName);
  const date_started_at: Date = new Date(started_at);
  const date_now: Date = new Date();
  const time_diff_milliseconds: number =
    date_now.getTime() - date_started_at.getTime();
  const dateDataObject = extractMillisecondsToObject(time_diff_milliseconds);
  const uptime: string = dateToLetters(dateDataObject);

  return uptime;
};
