export interface GameType {
  id: string;
  abbreviation: string;
  platforms: string[];
  names: Names;
  links: Link[];
}

interface Names {
  international: string;
  japanese: string;
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
  players: Player[];
  times: {
    primary: string;
    primary_t: number;
    realtime: string;
    realtime_t: number;
    ingame: string;
    ingame_t: number;
  };
}

interface Player {
  id: string;
  uri: string;
}

export interface SpeedrunResponse {
  data: GameType[];
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
