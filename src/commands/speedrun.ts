import axios, { AxiosInstance, AxiosResponse, AxiosPromise } from "axios";
import { speedrunInstance } from "../config/speedrunConfig";
import { twitchInstance } from "../config/twitchConfig";
import { GameType } from "../interfaces/speedrun";

const responseBody = (response: AxiosResponse<GameType[]>) => response.data;

export const getStreamerGame = async (channel: string) => {
  const streamer = await twitchInstance.get(
    `/search/channels?query=${channel}`
  );
};

export const searchGameByName = async (
  gameName: string
): Promise<GameType[]> => {
  // const speedRun: AxiosResponse<GameType[]> = await speedrunInstance.get(
  //   `games?name=${gameName}`
  // );
  // return speedRun;
  return speedrunInstance.get(`games?name=${gameName}`).then(responseBody);
};
