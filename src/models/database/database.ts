import { PrismaClient } from "@prisma/client";

export abstract class Prisma {
  public prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient({
      // log: ["query", "info", `warn`, `error`],
    });
  }
}
