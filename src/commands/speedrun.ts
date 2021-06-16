import { AxiosResponse } from "axios";
import { speedrunAPI } from "../config/speedrunConfig";
import { GameType } from "../interfaces/speedrun";

const responseBody = (response: AxiosResponse<GameType[]>) => response.data;

export const searchSpeedgameByName = async (
  gameName: string
): Promise<GameType[]> => {
  // const speedRun: AxiosResponse<GameType[]> = await speedrunAPI.get(
  //   `games?name=${gameName}`
  // );
  // return speedRun;
  return speedrunAPI.get(`/games?name=${gameName}`).then(responseBody);
};
