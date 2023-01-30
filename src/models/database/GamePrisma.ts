import { DatabaseSingleton } from "./Prisma";
import { FullGame, ModelName } from "../../interfaces/prisma";
import { ICategoryType, IGameType, Link, } from "../../interfaces/speedrun";

// export class SpeedrunFetch {
//
//   async getLeaderboard(gameName: string) {
//     const game: IGameResponse | IGameSearchResponse = await this.fetchGame(gameName);
//     const categories: ICategoryType[] = await this.fetchCategories(game);
//
//     return { game, categories }
//   }
//
//   private async fetchCategories(game: IGameResponse | IGameSearchResponse): Promise<ICategoryType[]> {
//     const speedrunCategory = new SpeedrunCategory(game);
//     return await speedrunCategory.fetch()
//   }
//
//   async fetchGame(gameName: string): Promise<IGameResponse | IGameSearchResponse> {
//     const gameFetch = new SpeedrunGame(gameName);
//     return await gameFetch.fetch()
//   }
// }

export class GamePrisma {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.game];

  constructor(private name: string) {}

  // pull = async (): Promise<FullGame | null> => {
  //   const fullGame: FullGame | null = await this.get();
  //   const speedrunFetch = new SpeedrunFetch();
  //   const { game, categories } = await speedrunFetch.getLeaderboard(this.name);
  //   if (fullGame === null) {
  //     const savedGame = await this.save(game, categories);
  //     this.name = savedGame.abbreviation;
  //     return await this.get();
  //   }
  //   return fullGame;
  // };

  get = async (): Promise<FullGame | null> => {
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

  async save(game: IGameType, categories: ICategoryType[]) {
    // const speedrunFetch = new SpeedrunFetch();
    // const { game, categories } = await speedrunFetch.getLeaderboard(this.name);

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
