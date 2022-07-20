import { Category, CategoryLink, Game, GameLink, GameNames, GamePlatform, } from ".prisma/client";
import { Command, Component, Setting, Timestamp, Trust, User } from "@prisma/client";
// import { Timestamp, Trust } from "../models/commands/Tmi";

// export interface User {
//   name: string;
// }

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

// export interface JoinedUser {
//   user: (User & {
//     commands: Command[],
//     components: Component[],
//     settings: Setting[],
//     timestamps: Timestamp[],
//     trusts: Trust[]
//   });
// }

export interface JoinedUser extends User {
  // id: string;
  // name: string;
  commands: Command[],
  components: Component[],
  settings: Setting[],
  timestamps: Timestamp[],
  trusts: Trust[]
}