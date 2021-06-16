import { AxiosResponse } from "axios";
import { twitchInstance } from "../config/twitchConfig";
import { ChannelType } from "../interfaces/twitch";

const responseBody = (response: AxiosResponse<ChannelType[]>) => response.data;

export const getStreamerGame = async (
  channel: string
): Promise<ChannelType[]> => {
  // const streamer = await twitchInstance.get(
  //   `/search/channels?query=${channel}`
  // );
  // return streamer;
  return twitchInstance
    .get(`/search/channels?query=${channel}`)
    .then(responseBody);
};
