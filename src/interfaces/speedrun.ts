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

export interface Link {
  rel: string;
  uri: string;
}
export interface ILeaderboardResponse {
  data: ILeaderboard;
}

export interface ILeaderboard {
  game: string;
  category: string;
  runs: IRun[];
}

export interface IRun {
  place: number;
  run: IRunData;
}

export interface IRunData {
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

export interface IRunnerResponse {
  data: IRunner;
}

export interface IGameResponse {
  data: IGameType;
}
export interface IGameSearchResponse {
  data: IGameType[];
}

export interface ICategoryType {
  id: string;
  name: string;
  links: Link[];
}

export interface ICategoryResponse {
  data: ICategoryType[];
}

export enum StatusCode {
  Unauthorized = 401,
  NotFound = 404,
  ServerError = 420,
}

export enum SpeedrunComErrorMessage {
  NotFound = "not found on SpeedrunCom",
  ServerError = "SpeedrunCom is having network problems",
  GenericAxios = "Problem getting data from SpeedrunCom",
  Generic = "Problem getting data from",
}

export enum TwitchTvErrorMessage {
  NotFound = "not found on TwitchTv",
  ServerError = "Twitch is having network problems",
  GenericAxios = "Problem getting data from TwitchTv",
  Generic = "Problem getting data from",
}

export enum InduvidualLevelSupport {
  DKR = "DKR",
}

export enum TimeTrialSupport {
  DKR = "DKR",
}

export interface IInduvidualLevel {
  id: string;
  name: string;
  links: {
    rel: string;
    uri: string;
  }[];
}

export interface IInduvidualLevelResponse {
  data: IInduvidualLevel[];
}

export interface IInduvidualLevelWithVehicle extends IInduvidualLevel {
  vehicle: string;
}
