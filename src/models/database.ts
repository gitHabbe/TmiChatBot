import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "fs";
import { GameType, CategoryType } from "../interfaces/speedrun";

export class JsonArrayFile<T> {
  private jsonFile: string = "./src/private/tmi_channels.json";
  private data: T[] = JSON.parse(readFileSync(this.jsonFile, "utf8"));

  constructor(private username: T) {}

  add = (): void => {
    if (this.isInJson()) {
      throw new Error("User already in JSON");
    }
    writeFileSync(this.jsonFile, JSON.stringify([...this.data, this.username]));
  };

  remove = (): void => {
    const newData = this.data.filter((name: T) => name !== this.username);
    writeFileSync(this.jsonFile, JSON.stringify(newData));
  };

  isInJson = (): T | undefined => {
    return this.data.find((user: T) => user === this.username);
  };
}

class Database {
  public prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient({
      log: ["query", "info", `warn`, `error`],
    });
  }
}

export class UserDatabase extends Database {
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

export class CreateGameDatabase extends Database {
  constructor(private game: GameType, private categories: CategoryType[]) {
    super();
  }

  saveGame = async () => {
    const asdf = await this.prisma.game.create({
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
          create: this.categories.map((category) => {
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
          }),
        },
      },
    });
    return asdf;
  };

  // saveCategories = async () => {
  //   await this.prisma.category.create({
  //     data: this.categories.map(category => {
  //       return {
  //         name: category.name,

  //       }
  //     })
  //   })
  // };

  private names = () => {
    return {
      twitch: this.game.names.twitch,
      international: this.game.names.international,
      japanese: this.game.names.japanese,
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
        links: category.links.map((link) => {
          return {
            rel: link.rel,
            uri: link.uri,
          };
        }),
      };
    });
  };
}

class GetCategory extends Database {
  constructor(private searchTerm: string) {
    super();
  }
}

export class GetGameDatabase extends Database {
  constructor(private searchTerm: string) {
    super();
  }

  getGameByAbbreviation = async () => {
    const foundGame = await this.prisma.game.findFirst({
      where: {
        abbreviation: this.searchTerm,
      },
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

    // @ts-ignore - Falsely optional SQL field "names"
    return foundGame;
  };
  getGameByName = async () => {
    const foundGame = await this.prisma.game.findFirst({
      where: {
        names: {
          international: this.searchTerm,
        },
      },
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

    // @ts-ignore - Falsely optional SQL field "names"
    return foundGame;
  };
}
