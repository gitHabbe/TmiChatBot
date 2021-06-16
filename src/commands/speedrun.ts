import axios, { AxiosInstance, AxiosResponse, AxiosPromise } from "axios";
import { speedrunConfig } from "../config/speedrunConfig";
import { GameType } from "../interfaces/speedrun";

const responseBody = (response: AxiosResponse<GameType[]>) => response.data;
const speedrunInstance: AxiosInstance = axios.create(speedrunConfig);

export const searchGameByName = async (
  gameName: string
): Promise<GameType[]> => {
  // const speedRun: AxiosResponse<GameType[]> = await speedrunInstance.get(
  //   `games?name=${gameName}`
  // );
  // return speedRun;
  return speedrunInstance.get(`games?name=${gameName}`).then(responseBody);
};
