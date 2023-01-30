import { IAxiosOptions } from "../../interfaces/Axios";
import { AxiosInstance } from "axios";
import { speedrunAPI } from "../../config/speedrunConfig";
import {
  ICategoryResponse,
  ICategoryType,
  IGameResponse,
  IGameSearchResponse,
  IGameType,
  ILeaderboard,
  ILeaderboardResponse,
  IRunner,
  IRunnerResponse
} from "../../interfaces/speedrun";
import { FullGame } from "../../interfaces/prisma";

export class SpeedrunGame {
  private options: IAxiosOptions = {
    name: this.name,
    type: "game",
    url: `/games`,
  };

  constructor(private name: string, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetch(): Promise<IGameType[]> {
    const baseURL = this.options.url;
    this.options.url = `${baseURL}/${this.name}`;
    try {
      const axiosResponse = await this.axiosInstance.get<IGameResponse>(this.options.url);
      return [ axiosResponse.data.data ]
    } catch (e) {
      console.log(e);
      this.options.url = `${baseURL}?name=${this.name}`;
      const fetchAttempt1 = await this.axiosInstance.get<IGameSearchResponse>(this.options.url);
      if (fetchAttempt1.data.data.length > 0) {
        return fetchAttempt1.data.data
      }
      this.options.url = `${baseURL}?abbreviation=${this.name}`;
      const fetchAttempt2 = await this.axiosInstance.get<IGameSearchResponse>(this.options.url);
      return fetchAttempt2.data.data
    }
  }
}

export class SpeedrunCategory {
  private options: IAxiosOptions = {
    name: this.game.names.international,
    type: "category",
    url: `/games/${this.game.id}/categories`,
  };

  constructor(private game: IGameType, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetch() {
    const { data } = await this.axiosInstance.get<ICategoryResponse>(this.options.url);
    return data
  }
}

export class SpeedrunLeaderboard {
  private options: IAxiosOptions = {
    name: "World record",
    type: "Leaderboard",
    url: `/leaderboards/${this.game.id}/category/${this.category.id}?top=1`,
  };

  constructor(private game: FullGame, private category: ICategoryType, private axiosInstance: AxiosInstance = speedrunAPI) {
  }

  async fetch(): Promise<ILeaderboard> {
    const axiosResponse = await this.axiosInstance.get<ILeaderboardResponse>(this.options.url);
    return axiosResponse.data.data
  }
}

export class SpeedrunRunner {
  private options: IAxiosOptions = {
    type: "Runner",
    name: this.name,
    url: `/users/${this.name}`,
  };

  constructor(private name: string, private axiosInstance: AxiosInstance = speedrunAPI) {
  }

  async fetch(): Promise<IRunner> {
    const axiosResponse = await this.axiosInstance.get<IRunnerResponse>(this.options.url);
    return axiosResponse.data.data
  }
}