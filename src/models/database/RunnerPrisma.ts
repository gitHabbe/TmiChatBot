import { Prisma } from "./Prisma";
import { Runner } from ".prisma/client";
import { IGameResponse, IRunner, IRunnerResponse } from "../../interfaces/speedrun";
// import { SpeedrunCom } from "../fetch/SpeedrunCom";
import { IAxiosOptions } from "../../interfaces/Axios";
import { AxiosInstance } from "axios";
import { speedrunAPI } from "../../config/speedrunConfig";
import { SpeedrunLeaderboard } from "../fetch/Leaderboard";

class SpeedrunRunner {
  private options: IAxiosOptions = {
    type: "Runner",
    name: this.name,
    url: `/users/${this.name}`,
  };

  constructor(private name: string, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetch(): Promise<IRunner> {
    const axiosResponse = await this.axiosInstance.get<IRunnerResponse>(this.options.url);
    return axiosResponse.data.data
  }
}

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

  private save = async (name: string): Promise<Runner> => {
    const runner = await this.fetch(name);
    return await this.prisma.runner.create({
      data: {
        id: runner.id,
        name: runner.names.international,
      },
    });
  };

  private fetch = async (query: string): Promise<IRunner> => {
    const speedrunRunner = new SpeedrunRunner(query);
    const iRunner = await speedrunRunner.fetch();
    return iRunner;
  };
}
