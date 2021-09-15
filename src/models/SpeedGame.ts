import { Game } from ".prisma/client";
import { getStreamerGame } from "../commands/twitch";
import { JoinedGame } from "../interfaces/prisma";
import {
  ICategoryResponse,
  ICategoryType,
  IGameResponse,
  IGameType,
} from "../interfaces/speedrun";
import { IAxiosOptions, SpeedrunCom } from "./axiosFetch";
import { GamePrisma } from "./database/GamePrisma";

export class SpeedGame {
  private game = new GamePrisma();

  twitchGame = async (channel: string): Promise<string> => {
    return await getStreamerGame(channel);
  };

  fetchGame = async (name: string): Promise<IGameType> => {
    const options: IAxiosOptions = {
      type: "Game",
      name: name,
      url: `/games/${name}`,
    };
    const speedrun = new SpeedrunCom<IGameResponse>(options);
    const {
      data: { data: game },
    } = await speedrun.fetchAPI();

    return game;
  };

  fetchCategories = async (gameName: string): Promise<ICategoryType[]> => {
    const game = await this.fetchGame(gameName);
    const options: IAxiosOptions = {
      type: "Categories",
      name: gameName,
      url: `games/${game.id}/categories`,
    };
    const speedrun = new SpeedrunCom<ICategoryResponse>(options);
    const {
      data: { data: categories },
    } = await speedrun.fetchAPI();

    return categories;
  };

  save = async (game: string) => {
    this.game.setGame = await this.fetchGame(game);
    this.game.setCategories = await this.fetchCategories(game);

    return await this.game.save();
  };

  get = async (query: string) => {
    const game = await this.game.get(query);
    if (!game) return this.save(query);

    return game;
  };
}
