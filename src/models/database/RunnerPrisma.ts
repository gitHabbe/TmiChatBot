import { Prisma } from "./Prisma";
import { Runner } from ".prisma/client";
import { IRunner, IRunnerResponse } from "../../interfaces/speedrun";
import { IAxiosOptions, SpeedrunCom } from "../axiosFetch";

export class RunnerPrisma extends Prisma {
  get = async (query: string): Promise<Runner> => {
    const runner = await this.prisma.runner.findFirst({
      where: {
        OR: [{ id: query }, { name: query }],
      },
    });
    if (!runner) return this.save(query);

    return runner;
  };

  save = async (name: string): Promise<Runner> => {
    const runner = await this.fetch(name);
    return await this.prisma.runner.create({
      data: {
        id: runner.id,
        name: runner.names.international,
      },
    });
  };

  fetch = async (query: string): Promise<IRunner> => {
    const options: IAxiosOptions = {
      type: "Runner",
      name: query,
      url: `/users/${query}`,
    };
    const speedrunCom = new SpeedrunCom<IRunnerResponse>(options);
    const {
      data: { data: runner },
    } = await speedrunCom.fetchAPI();

    return runner;
  };
}
