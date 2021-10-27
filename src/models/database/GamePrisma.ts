import { DatabaseSingleton } from "./Prisma";
import { FullGame, ModelName } from "../../interfaces/prisma";
import {
  IGameType,
  ICategoryType,
  IGameResponse,
  ICategoryResponse,
  Link,
} from "../../interfaces/speedrun";
import { SpeedrunDotCom } from "../fetch/SpeedrunCom";
import { FetchCategories, FetchGame } from "../fetch/SpeedGame";

export class GameModel {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.game];
  constructor(private name: string) {}

  get = async (): Promise<FullGame> => {
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
        categories: true,
        links: true,
        names: true,
        platforms: true,
      },
    });
  };

  getAll = () => {
    throw new Error(`Uncallable`);
  };

  save = async () => {
    const speedrunGameApi = new SpeedrunDotCom<IGameResponse>();
    const fetchGame = new FetchGame(speedrunGameApi, this.name);
    const game: IGameType = await fetchGame.get();

    const categoriesApi = new SpeedrunDotCom<ICategoryResponse>();
    const fetchCategories = new FetchCategories(categoriesApi, game);
    const categories: ICategoryType[] = await fetchCategories.get();

    return this.client.create({
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
