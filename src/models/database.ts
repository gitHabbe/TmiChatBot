import { PrismaClient } from "@prisma/client";
import { GameQuery, JoinedGame, UserQuery } from "../interfaces/prisma";
import { GameType, CategoryType, IRunner } from "../interfaces/speedrun";

class Prisma {
  public prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient({
      // log: ["query", "info", `warn`, `error`],
    });
  }
}
export class User extends Prisma {
  constructor(private username: string) {
    super();
  }

  addUser = () => {
    return this.prisma.user.create({
      data: {
        name: this.username,
      },
    });
  };

  getUser = () => {
    return this.prisma.user.findFirst({
      where: {
        name: this.username,
      },
    });
  };
}

export class Runner extends Prisma {
  constructor() {
    super();
  }

  getRunnerWhere = async (query: UserQuery) => {
    const runner = await this.prisma.runner.findFirst({
      where: query,
    });

    if (runner === null) throw new Error("Runner not in database");

    return runner;
  };

  saveRunner = async (runner: IRunner) => {
    const newRunner = await this.prisma.runner.create({
      data: {
        id: runner.id,
        name: runner.names.international,
      },
    });
    if (newRunner === null) throw new Error("Runner could not be created");

    return newRunner;
  };
}

export class GameDatabase extends Prisma {
  private _game: GameType | undefined = undefined;
  private _categories: CategoryType[] | undefined;
  constructor() {
    super();
  }

  getGameWhere = async (gameQuery: GameQuery): Promise<JoinedGame> => {
    const game = await this.prisma.game.findFirst({
      where: gameQuery,
      select: {
        id: true,
        abbreviation: true,
        platforms: true,
        names: true,
        links: true,
        categories: {
          select: {
            id: true,
            gameId: true,
            name: true,
            links: true,
          },
        },
      },
    });
    if (game === null) throw new Error("Game not in database");

    return game;
  };

  set setGame(game: GameType | undefined) {
    this._game = game;
  }

  get game() {
    if (this._game === undefined) throw new Error("GAME NOT SET");
    return this._game;
  }

  set setCategories(categories: CategoryType[] | undefined) {
    this._categories = categories;
  }

  get categories() {
    if (this._categories === undefined) throw new Error("CATEGORIES NOT SET");
    return this._categories;
  }

  saveGame = async () => {
    // console.log(this.game.abbreviation); // this is ok
    // this.sgame = game;
    // console.log(this.game.abbreviation); // this is ok

    const newGame = await this.prisma.game.create({
      data: {
        id: this.game.id,
        abbreviation: this.game.abbreviation,
        names: {
          create: this.names(),
        },
        links: {
          create: this.links(),
        },
        platforms: {
          create: this.platforms(),
        },
        categories: {
          create: this.gameCategories(),
        },
      },
    });
    if (newGame === null) throw new Error("Game could not be created");

    return newGame;
  };

  private names = () => {
    return {
      twitch: this.game.names.twitch, // not ok
      international: this.game.names.international,
    };
  };

  private links = () => {
    return this.game.links.map((link) => {
      return {
        rel: link.rel,
        uri: link.uri,
      };
    });
  };

  private platforms = () => {
    return this.game.platforms.map((platform) => {
      return {
        platformId: platform,
      };
    });
  };

  private gameCategories = () => {
    return this.categories.map((category) => {
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
}

// export class CreateGameDatabase extends Prisma {
//   constructor(private game: GameType, private categories: CategoryType[]) {
//     super();
//   }

//   saveGame = async () => {
//     const asdf = await this.prisma.game.create({
//       data: {
//         id: this.game.id,
//         abbreviation: this.game.abbreviation,
//         names: {
//           create: this.names(),
//         },
//         links: {
//           create: this.links(),
//         },
//         platforms: {
//           create: this.platforms(),
//         },
//         categories: {
//           create: this.gameCategories(),
//         },
//       },
//     });
//     return asdf;
//   };

//   private names = () => {
//     return {
//       twitch: this.game.names.twitch,
//       international: this.game.names.international,
//       japanese: this.game.names.japanese,
//     };
//   };

//   private links = () => {
//     return this.game.links.map((link) => {
//       return {
//         rel: link.rel,
//         uri: link.uri,
//       };
//     });
//   };

//   private platforms = () => {
//     return this.game.platforms.map((platform) => {
//       return {
//         platformId: platform,
//       };
//     });
//   };

//   private gameCategories = () => {
//     return this.categories.map((category) => {
//       return {
//         id: category.id,
//         name: category.name,
//         links: {
//           create: category.links.map((link) => {
//             return {
//               rel: link.rel,
//               uri: link.uri,
//             };
//           }),
//         },
//       };
//     });
//   };
// }
