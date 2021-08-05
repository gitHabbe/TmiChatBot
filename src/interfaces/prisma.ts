import {
  CategoryLink,
  GameLink,
  GameNames,
  GamePlatform,
} from ".prisma/client";
export interface User {
  name: string;
}

export interface GameQuery {
  abbreviation?: string;
  names?: {
    international: string;
  };
}

export interface UserQuery {
  id?: string;
  name?: string;
}
export interface JoinedGame {
  names: GameNames | null;
  links: GameLink[];
  id: string;
  abbreviation: string;
  platforms: GamePlatform[];
  categories: {
    links: CategoryLink[];
    name: string;
    id: string;
    gameId: string;
  }[];
}
