import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync, ReadSyncOptions } from "fs";

export class JsonFile<T> {
  private jsonFile: string = "./src/private/tmi_channels.json";
  private data: T[] = JSON.parse(readFileSync(this.jsonFile, "utf8"));

  add = (username: string) => {
    writeFileSync(this.jsonFile, JSON.stringify([...this.data, username]));
  };

  remove = (username: string) => {
    const newData = this.data.filter((username) => username !== username);
    writeFileSync(this.jsonFile, JSON.stringify(newData));
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
