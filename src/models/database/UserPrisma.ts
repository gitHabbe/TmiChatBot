import { JoinedUser, Model, ModelName } from "../../interfaces/prisma";
import { DatabaseSingleton } from "./Prisma";
import { Component, User } from "@prisma/client";
import { ModuleFamily } from "../../interfaces/tmi";

export class UserModel implements Model {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.user];
  constructor(private name: string) {}

  get = async (): Promise<JoinedUser> => {
    let findFirst: JoinedUser | null = await this.getFirst();
    if (findFirst === null) {
      await this.create();
      findFirst = await this.getFirst();
    }
    if (findFirst === null) {
      throw new Error("Database error")
    }
    return findFirst
  };

  private async getFirst(): Promise<JoinedUser | null> {
    return await this.client.findFirst({
      where: { name: this.name },
      include: {
        commands: true,
        components: true,
        settings: true,
        timestamps: true,
        trusts: true,
      },
    });
  }

  getAll = () => {
    throw new Error(`Uncallable`);
  };

  save = async (): Promise<User> => {
    const oldUser = await this.get()
    if (oldUser) throw new Error("User already exists")
    return await this.create();
  };

  delete = (): Promise<User> => {
    return this.client.delete({ where: { name: this.name } });
  };

  private async create() {
    return await this.client.create({
      data: {
        name: this.name,
        components: {
          create: [
            { name: ModuleFamily.TITLE, enabled: true },
            { name: ModuleFamily.UPTIME, enabled: true },
            { name: ModuleFamily.FOLLOWAGE, enabled: false },
            { name: ModuleFamily.SPEEDRUN, enabled: false },
          ]
        }
      }
    })
  }
}
