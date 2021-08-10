import { Prisma } from "./database";
import { GameQuery, JoinedGame } from "../../interfaces/prisma";
import { IGameType, ICategoryType } from "../../interfaces/speedrun";

export class GameDatabase extends Prisma {
  private _game: IGameType | undefined = undefined;
  private _categories: ICategoryType[] | undefined;
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

  set setGame(game: IGameType | undefined) {
    this._game = game;
  }

  get game() {
    if (this._game === undefined) throw new Error("GAME NOT SET");
    return this._game;
  }

  set setCategories(categories: ICategoryType[] | undefined) {
    this._categories = categories;
  }

  get categories() {
    if (this._categories === undefined) throw new Error("CATEGORIES NOT SET");
    return this._categories;
  }

  saveGame = async () => {
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
      twitch: this.game.names.twitch,
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
