import { Category, CategoryLink, Game, GameLink, GamePlatform, } from ".prisma/client";
import { Command, Component, Setting, Timestamp, Trust, User } from "@prisma/client";
import { Names } from "./speedrun"

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

export interface Model {
  get(): Promise<any>;
  getAll(): Promise<any[]>;
  save(data: any): Promise<any>;
  delete(): Promise<any>;
}

export interface JoinedUser extends User {
  // id: string;
  // name: string;
  commands: Command[],
  components: Component[],
  settings: Setting[],
  timestamps: Timestamp[],
  trusts: Trust[]
}

export interface JoinedGame extends Game {
  // id: string;
  // abbreviation: string;
  links: GameLink[];
  platforms: GamePlatform[];
  categories: GameCategory[]
}

interface GameCategory extends Category {
  links: CategoryLink[]
}

export type FullGame = Game & {
  platforms: GamePlatform[];
  categories: (Category & {
    links: CategoryLink[];
  })[];
};
