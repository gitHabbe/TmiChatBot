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
  constructor(private game: GameType) {
    super();
  }

  saveGame = async () => {
    try {
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
        },
      });
    } catch (error) {
      console.log("ERROR:", error);
    }
  };

  private names = () => {
    return {
      // gameId: this.game.id,
      twitch: this.game.names.twitch,
      international: this.game.names.international,
      japanese: this.game.names.japanese,
    };
  };

  private links = () => {
    return this.game.links.map((link) => {
      return {
        // gameId: this.game.id,
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

  // private catefories = () => {
  //   return this.game.
  // };
}

export class GetGameDatabase extends Database {
  constructor(private abbreviation: string) {
    super();
  }

  getGame = async (): Promise<GameType> => {
    const foundGame = await this.prisma.game.findFirst({
      where: {
        abbreviation: this.abbreviation,
      },
      select: {
        id: true,
        abbreviation: true,
        platforms: true,
        names: true,
        links: true,
      },
    });

    // @ts-ignore - Falsely optional SQL field "names"
    return foundGame;
  };
}
