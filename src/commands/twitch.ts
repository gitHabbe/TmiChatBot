import { AxiosResponse } from "axios";
import { twitchAPI } from "../config/twitchConfig";
import { ChannelType } from "../interfaces/twitch";

const responseBody = (response: AxiosResponse<ChannelType[]>) => response.data;

export const getStreamerGame = async (
  channel: string
): Promise<ChannelType[]> => {
  // const streamer = await twitchAPI.get(
  //   `/search/channels?query=${channel}`
  // );
  // return streamer;
  return twitchAPI.get(`/search/channels?query=${channel}`).then(responseBody);
};
