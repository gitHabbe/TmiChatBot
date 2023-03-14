import { IAxiosOptions } from "../../interfaces/Axios"
import { AxiosInstance, AxiosResponse } from "axios"
import { speedrunAPI } from "../../config/speedrunConfig"
import {
  ICategoryResponse,
  ICategoryType,
  ILeaderboard,
  ILeaderboardResponse,
  IRunner,
  IRunnerResponse
} from "../../interfaces/speedrun"
import { ITrack } from "../../interfaces/specificGames"
import { FullSpeedrunGame, SpeedrunGame, SpeedrunGameResponse, SpeedrunResponse } from "../../interfaces/general"

export class SpeedrunApi {
  private options: IAxiosOptions = {
    name: this.name,
    type: "game",
    url: `/games`,
  };

  constructor(private name: string, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetch(): Promise<SpeedrunGame[]> {
    const baseURL = this.options.url;
    this.options.url = `${baseURL}/${this.name}`;
    try {
      const { data: { data } }: AxiosResponse<SpeedrunResponse<SpeedrunGameResponse>> = await this.axiosInstance.get(this.options.url);
      const speedrunGame = SpeedrunApi.convertResponseToSpeedrunGame(data)
      return [ speedrunGame ]
    } catch (e) {
      this.options.url = `${baseURL}?name=${this.name}`;
      const fetchAttempt1 = await this.axiosInstance.get<SpeedrunResponse<SpeedrunGameResponse[]>>(this.options.url);
      if (fetchAttempt1.data.data.length > 0) {
        return fetchAttempt1.data.data.map(SpeedrunApi.convertResponseToSpeedrunGame)
      }
      this.options.url = `${baseURL}?abbreviation=${this.name}`;
      const fetchAttempt2 = await this.axiosInstance.get<SpeedrunResponse<SpeedrunGameResponse[]>>(this.options.url);
      return fetchAttempt2.data.data.map(SpeedrunApi.convertResponseToSpeedrunGame)
    }
  }

  private static convertResponseToSpeedrunGame(axiosResponse: SpeedrunGameResponse) {
    return Object.assign({
      international: axiosResponse.names.international,
      twitch: axiosResponse.names.twitch
    }, axiosResponse)
  }
}

export class SpeedrunCategory {
  private options: IAxiosOptions = {
    name: this.game.international,
    type: "category",
    url: `/games/${this.game.id}/categories`,
  };

  constructor(private game: SpeedrunGame, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetch() {
    const { data } = await this.axiosInstance.get<ICategoryResponse>(this.options.url);
    return data
  }
}

export class SpeedrunLeaderboard {
  private options: IAxiosOptions = {
    name: "World record",
    type: "Leaderboard",
    url: `/leaderboards/${this.game.id}/category/${this.category.id}`,
  };

  constructor(private game: FullSpeedrunGame, private category: ICategoryType, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetchWorldRecord(): Promise<ILeaderboard> {
    this.options.url += "?top=1"
    const axiosResponse = await this.axiosInstance.get<ILeaderboardResponse>(this.options.url);
    return axiosResponse.data.data
  }

  async fetchLeaderboard(): Promise<ILeaderboard> {
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

  constructor(private name: string, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetch(): Promise<IRunner> {
    const axiosResponse = await this.axiosInstance.get<IRunnerResponse>(this.options.url);
    return axiosResponse.data.data
  }
}

export class DiddyKongRacingLeaderboard {

  private gameId = "9dow9e1p"
  private unknown = "ndx0q5dq";
  private baseURL = `/leaderboards/${this.gameId}/level/${this.track.id}/${this.unknown}`;

  constructor(private track: ITrack, private axiosInstance: AxiosInstance = speedrunAPI) {
  }

  async fetchWorldRecord(): Promise<ILeaderboardResponse> {
    const worldRecordURL = this.baseURL + "?top=1";
    const axiosResponse = await this.axiosInstance.get<ILeaderboardResponse>(worldRecordURL);
    return axiosResponse.data;
  }

  async fetchLeaderboard(): Promise<ILeaderboardResponse> {
    const axiosResponse = await this.axiosInstance.get<ILeaderboardResponse>(this.baseURL);
    return axiosResponse.data;
  }
}