import { AxiosResponse } from "axios";
import { twitchAPI } from "../config/twitchConfig";
import { ChannelType } from "../interfaces/twitch";

// interface Response {
//   data: ChannelType;
// }

// const responseBody = (response: AxiosResponse<ChannelType[]>) => response.data;

export const getStreamerGame = async (channelName: string) => {
  const streamers = await twitchAPI.get<AxiosResponse<ChannelType[]>>(
    `/search/channels?query=${channelName}`
  );
  console.log(streamers.data.data);
  // return streamers;
  const asdf = streamers.data.data.find(
    (channel: ChannelType) => channel.display_name === channelName
  );
  console.log(asdf);

  // return streamer;
  // return twitchAPI.get(`/search/channels?query=${channel}`).then(responseBody);
};
