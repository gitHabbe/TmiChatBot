import { twitchAPI } from "../config/twitchConfig";
import { ChannelType, StreamerResponse } from "../interfaces/twitch";
import {
  letterFormatedDate,
  extractMillisecondsToObject,
} from "../utility/dateFormat";

export const fetchStreamerByUsername = async (
  channelName: string
): Promise<ChannelType> => {
  const {
    data: { data: streamers },
  } = await twitchAPI.get<StreamerResponse>(
    `/search/channels?query=${channelName}`
  );

  const streamer = streamers.find(
    (name: ChannelType) =>
      name.display_name.toLowerCase() === channelName.toLowerCase()
  );
  if (streamer === undefined) throw new Error("User not found");

  return streamer;
};

export const getStreamerTitle = async (channelName: string) => {
  const { title } = await fetchStreamerByUsername(channelName);

  return title;
};

export const getStreamerGame = async (channel: string): Promise<string> => {
  const { game_name } = await fetchStreamerByUsername(channel);

  return game_name;
};

export const getStreamerUptime = async (channelName: string) => {
  const { started_at } = await fetchStreamerByUsername(channelName);
  const started_at_date: Date = new Date(started_at);
  const date_now: Date = new Date();
  const time_diff_milliseconds: number =
    date_now.getTime() - started_at_date.getTime();
  const dateDataObject = extractMillisecondsToObject(time_diff_milliseconds);
  const uptime: string = letterFormatedDate(dateDataObject);

  return uptime;
};
