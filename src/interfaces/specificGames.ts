export interface ILevels {
  levels: ITrack[];
}

export interface ITrack {
  id: string;
  name: string;
  abbreviation: string;
  vehicle: string;
  default: boolean;
}

export interface ITimeTrialsJson {
  timetrial: ITimeTrialJson[];
}

export interface ITimeTrialJson {
  id: string;
  name: string;
  abbreviation: string;
  vehicle: string;
  default: boolean;
}

export interface ITimeTrialResponse {
  status: number;
  error: string;
  times: ITimeTrial[];
}

export interface ITimeTrial {
  player_name: string;
  username: string;
  country_iso: string;
  country_name: string;
  time_value: string;
  default_time: boolean;
  tstamp: string;
  game_version: string;
  character_name: string;
  proof: string;
  time: string;
  player_profile: string;
}
