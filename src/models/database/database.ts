import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export abstract class Prisma {
  public prisma: PrismaClient;
  constructor() {
    this.prisma = prisma;
  }
}
