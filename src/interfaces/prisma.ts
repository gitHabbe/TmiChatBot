import {
  Game,
  Category,
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

export enum ModelName {
  game = "game",
  gameNames = "gameNames",
  gamePlatform = "gamePlatform",
  gameLink = "gameLink",
  category = "category",
  categoryLink = "categoryLink",
  runner = "runner",
  user = "user",
  command = "command",
  timestamp = "timestamp",
  component = "component",
  trust = "trust",
  setting = "setting",
}

export type FullGame = Game & {
  names: GameNames | null;
  platforms: GamePlatform[];
  categories: (Category & {
    links: CategoryLink[];
  })[];
};

export interface Model {
  get(): Promise<any>;
  getAll(): Promise<any[]>;
  save(data: any): Promise<any>;
  delete(): Promise<any>;
}
