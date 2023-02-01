import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export abstract class Prisma {
  public prisma: PrismaClient = prisma;
}

export class DatabaseSingleton {
  private static instance: DatabaseSingleton;
  private client: PrismaClient = prisma;

  public static getInstance = (): DatabaseSingleton => {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton();
    }
    return DatabaseSingleton.instance;
  };

  get() {
    return this.client;
  }
}
