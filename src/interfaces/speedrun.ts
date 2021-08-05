export interface GameType {
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

// interface Platform {
//   platformId: string;
// }

// interface Category {
//   id: string;
//   name: string;
//   links: Link[];
//   leaderboard: Leaderboard;
// }

export interface LeaderboardReponse {
  data: Leaderboard;
}

interface Leaderboard {
  game: string;
  category: string;
  runs: {
    place: number;
    run: Run;
  }[];
}

interface Run {
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
  data: GameType;
}

export interface CategoryType {
  id: string;
  name: string;
  links: Link[];
  // leaderboard: Leaderboard;
}

export interface CategoryResponse {
  data: CategoryType[];
}
