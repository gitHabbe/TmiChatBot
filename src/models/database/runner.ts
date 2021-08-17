import { Prisma } from "./database";
import { UserQuery } from "../../interfaces/prisma";
import { IRunner } from "../../interfaces/speedrun";

export class RunnerPrisma extends Prisma {
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
