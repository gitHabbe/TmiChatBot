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
  id: string;
  abbreviation: string;
  names: GameNames | null;
  links: GameLink[];
  platforms: GamePlatform[];
  categories: {
    links: CategoryLink[];
    name: string;
    id: string;
    gameId: string;
  }[];
}
