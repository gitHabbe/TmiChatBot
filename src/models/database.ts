import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync, ReadSyncOptions } from "fs";

export class JsonUserFile<T> {
  private jsonFile: string = "./src/private/tmi_channels.json";
  private data: T[] = JSON.parse(readFileSync(this.jsonFile, "utf8"));

  constructor(private username: T) {}

  add = () => {
    if (this.isInJson()) {
      throw new Error("User already in JSON");
    }
    writeFileSync(this.jsonFile, JSON.stringify([...this.data, this.username]));
  };

  remove = () => {
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
    this.prisma = new PrismaClient();
  }
}

class User extends Database {
  constructor() {
    super();
  }
}
