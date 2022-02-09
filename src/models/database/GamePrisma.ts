import { DatabaseSingleton } from "./Prisma";
import { FullGame, ModelName } from "../../interfaces/prisma";
import {
  IGameType,
  ICategoryType,
  IGameResponse,
  ICategoryResponse,
  Link,
} from "../../interfaces/speedrun";
import { speedrunAPI } from "../../config/speedrunConfig";
import { Api, CategoryApi, GameApi } from "../fetch/SpeedrunCom";

export class GameModel {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.game];
  constructor(private name: string) {}

  pull = async (): Promise<FullGame | null> => {
    const game: FullGame | null = await this.get();
    if (game === null) {
      const savedGame = await this.save();
      this.name = savedGame.abbreviation;
      return await this.get();
    }
    return game;
  };

  get = async () => {
    return this.client.findFirst({
      where: {
        OR: [
          {
            abbreviation: this.name,
          },
          {
            names: {
              international: this.name,
            },
          },
        ],
      },
      include: {
        categories: {
          include: {
            links: true,
          },
        },
        names: true,
        platforms: true,
      },
    });
  };

  getAll = () => {
    throw new Error(`Uncallable`);
  };

  save = async () => {
    const apiGame = new Api<IGameResponse>(speedrunAPI);
    const gameApi = new GameApi(apiGame, this.name);
    const { data: game }: IGameResponse = await gameApi.fetch();

    const apiCategories = new Api<ICategoryResponse>(speedrunAPI);
    const categoriesApi = new CategoryApi(apiCategories, game);
    const { data: categories }: ICategoryResponse = await categoriesApi.fetch();

    return await this.client.create({
      data: {
        id: game.id,
        abbreviation: game.abbreviation,
        categories: {
          create: this.categories(categories),
        },
        links: {
          create: this.links(game),
        },
        names: {
          create: this.names(game),
        },
        platforms: {
          create: this.platforms(game),
        },
      },
    });
  };

  private categories = (categories: ICategoryType[]) => {
    return categories.map((category: ICategoryType) => {
      return {
        id: category.id,
        name: category.name,
        links: {
          create: category.links.map((link) => {
            return {
              rel: link.rel,
              uri: link.uri,
            };
          }),
        },
      };
    });
  };

  private links = (game: IGameType) => {
    return game.links.map((link: Link) => {
      return {
        rel: link.rel,
        uri: link.uri,
      };
    });
  };

  private names = (game: IGameType) => {
    return {
      twitch: game.names.twitch,
      international: game.names.international,
    };
  };

  private platforms = (game: IGameType) => {
    return game.platforms.map((platform) => {
      return {
        platformId: platform,
      };
    });
  };

  delete = () => {
    throw new Error(`Uncallable`);
  };
}
