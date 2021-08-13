export interface IGameType {
  id: string;
  abbreviation: string;
  platforms: string[];
  names: Names;
  links: Link[];
}

interface Names {
  international: string;
  twitch: string;
}

interface Link {
  rel: string;
  uri: string;
}
export interface ILeaderboardReponse {
  data: ILeaderboard;
}

interface ILeaderboard {
  game: string;
  category: string;
  runs: {
    place: number;
    run: IRun;
  }[];
}

interface IRun {
  id: string;
  players: RunPlayer[];
  date: string;
  times: {
    primary: string;
    primary_t: number;
    realtime: string;
    realtime_t: number;
    ingame: string;
    ingame_t: number;
  };
}

interface RunPlayer {
  id: string;
  uri: string;
}

export interface IRunner {
  id: string;
  names: {
    international: string;
  };
}

export interface RunnerResponse {
  data: IRunner;
}

export interface SpeedrunResponse {
  data: IGameType;
}

export interface ICategoryType {
  id: string;
  name: string;
  links: Link[];
  // leaderboard: Leaderboard;
}

export interface ICategoryResponse {
  data: ICategoryType[];
}

export enum StatusCode {
  NotFound = 404,
  ServerError = 420,
}

export enum ErrorMessage {
  NotFound = "not found on SpeedrunCom",
  ServerError = "SpeedrunCom is having network problems",
  GenericAxios = "Problem getting data from SpeedrunCom",
  Generic = "Problem getting data from",
}
