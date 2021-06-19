import { AxiosResponse } from "axios";
import { twitchAPI } from "../config/twitchConfig";
import { ChannelType } from "../interfaces/twitch";

export const fetchStreamerByUsername = async (channelName: string) => {
  const streamers = await twitchAPI.get<AxiosResponse<ChannelType[]>>(
    `/search/channels?query=${channelName}`
  );
  const streamer = streamers.data.data.find(
    (name: ChannelType) =>
      name.display_name.toLowerCase() === channelName.toLowerCase()
  );
  if (streamer === undefined) throw new Error("User not found");

  console.log(streamer);

  return streamer;
};

export const getStreamerTitle = async (channelName: string) => {
  const streamer = await fetchStreamerByUsername(channelName);

  return streamer.title;
};
