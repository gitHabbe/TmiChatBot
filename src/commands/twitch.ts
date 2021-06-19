import { AxiosResponse, AxiosPromise } from "axios";
import { exit } from "process";
import { twitchAPI } from "../config/twitchConfig";
import { ChannelType, StreamerResponse } from "../interfaces/twitch";
import { letterFormatedDate } from "../utility/dateFormat";

export const fetchStreamerByUsername = async (
  channelName: string
): Promise<ChannelType> => {
  const {
    data: { data: streamers },
  } = await twitchAPI.get<StreamerResponse>(
    `/search/channels?query=${channelName}`
  );
  // console.log(streamers);
  // process.exit();
  console.log("~ streamers", streamers);

  const streamer = streamers.find(
    (name: ChannelType) =>
      name.display_name.toLowerCase() === channelName.toLowerCase()
  );
  console.log("~ streamer", streamer);
  if (streamer === undefined) throw new Error("User not found");

  return streamer;
};

export const getStreamerTitle = async (channelName: string) => {
  const { title } = await fetchStreamerByUsername(channelName);

  return title;
};

export const getStreamerUptime = async (channelName: string) => {
  const { started_at } = await fetchStreamerByUsername(channelName);
  const started_at_date: Date = new Date(started_at);
  const date_now: Date = new Date();
  const time_diff_milliseconds: number =
    date_now.getTime() - started_at_date.getTime();

  const uptime = letterFormatedDate(time_diff_milliseconds);
  console.log(uptime);

  // console.log("~ seconds_ago", seconds_ago);

  // const seconds_ago = Math.floor((new Date() - started_at) / 1000);
  // const time_string = util.secondsToString(seconds_ago);
  // return streamer.started_at;
};
