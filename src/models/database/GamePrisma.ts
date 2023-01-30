import { DatabaseSingleton } from "./Prisma";
import { FullGame, ModelName } from "../../interfaces/prisma";
import {
  ICategoryResponse,
  ICategoryType,
  IGameResponse,
  IGameSearchResponse,
  IGameType,
  Link,
} from "../../interfaces/speedrun";
import { speedrunAPI } from "../../config/speedrunConfig";
import { IAxiosOptions } from "../../interfaces/Axios";
import { AxiosInstance } from "axios";

export class SpeedrunGame {
  private options: IAxiosOptions = {
    name: this.name,
    type: "game",
    url: `/games`,
  };

  constructor(private name: string, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetch(): Promise<IGameType[]> {
    const baseURL = this.options.url;
    this.options.url = `${baseURL}/${this.name}`;
    // try {
    const axiosResponse = await this.axiosInstance.get<IGameResponse>(this.options.url);
    return [ axiosResponse.data.data ]
    // } catch (e) {
    // console.log(e);
      // this.options.url = `${baseURL}?name=${this.name}`;
      // const fetchAttempt1 = await this.axiosInstance.get<IGameSearchResponse>(this.options.url);
      // if (fetchAttempt1.data.data.length > 0) {
      //   return fetchAttempt1.data.data
      // }
      // this.options.url = `${baseURL}?abbreviation=${this.name}`;
      // const fetchAttempt2 = await this.axiosInstance.get<IGameSearchResponse>(this.options.url);
      // return fetchAttempt2.data.data
    }
  // }
}

export class SpeedrunCategory {
  private options: IAxiosOptions = {
    name: this.game.names.international,
    type: "category",
    url: `/games/${this.game.id}/categories`,
  };

  constructor(private game: IGameType, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetch() {
    // try {
    const { data } = await this.axiosInstance.get<ICategoryResponse>(this.options.url);
    return data
    // } catch (e) {
    //   console.log(e);
    //   return []
    // }
  }

}

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

export class GameModel {
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
