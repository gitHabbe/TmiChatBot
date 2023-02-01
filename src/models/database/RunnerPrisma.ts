import { Prisma } from "./Prisma";
import { Runner } from ".prisma/client";
import { IRunner } from "../../interfaces/speedrun";
// import { SpeedrunCom } from "../fetch/SpeedrunCom";
import { SpeedrunRunner } from "../fetch/SpeedrunCom";

export class RunnerPrisma extends Prisma {
  async get(query: string): Promise<Runner> {
    const runner = await this.prisma.runner.findFirst({
      where: {
        OR: [{ id: query }, { name: query }],
      },
    });
    if (!runner) return this.save(query);

    return runner;
  };

  private async save(name: string): Promise<Runner> {
    const runner = await this.fetch(name);
    return await this.prisma.runner.create({
      data: {
        id: runner.id,
        name: runner.names.international,
      },
    });
  };

  private async fetch(query: string): Promise<IRunner> {
    const speedrunRunner = new SpeedrunRunner(query);
    const iRunner = await speedrunRunner.fetch();
    return iRunner;
  };
}
