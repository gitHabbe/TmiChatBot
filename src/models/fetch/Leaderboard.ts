import { Category, CategoryLink } from ".prisma/client";
import { FullGame, JoinedGame } from "../../interfaces/prisma";
import {
  ICategoryType, IGameResponse, ILeaderboard,
  ILeaderboardResponse,
  IRun,
} from "../../interfaces/speedrun";
// import { SpeedrunCom } from "./SpeedrunCom";
import { fuseSearch } from "../../utility/fusejs";
import { IAxiosOptions } from "../../interfaces/Axios";
import { AxiosInstance } from "axios";
import { speedrunAPI } from "../../config/speedrunConfig";

export class SpeedrunLeaderboard {
  private options: IAxiosOptions = {
    name: "World record",
    type: "Leaderboard",
    url: `/leaderboards/${this.game.id}/category/${this.category.id}?top=1`,
  };

  constructor(private game: FullGame, private category: ICategoryType, private axiosInstance: AxiosInstance = speedrunAPI) {}

  async fetch(): Promise<ILeaderboard> {
    const axiosResponse = await this.axiosInstance.get<ILeaderboardResponse>(this.options.url);
    return axiosResponse.data.data
  }
}

export class Leaderboard {
  constructor(private game: FullGame) {}

  private validCategories = () => {
    const hasLeaderboard = ({ rel }: CategoryLink) => rel === "leaderboard";
    return this.game.categories.filter(({ links }) => {
      return links.findIndex(hasLeaderboard) >= 0;
    });
  };

  private sortedCategories = () => {
    const categories = this.validCategories();
    return categories.sort((a, b) => a.name.length - b.name.length);
  };

  private checkSubstring = (targetCategory: string): string => {
    let target = targetCategory;
    target = target.replace("hundo", "100%");
    target = target.replace("★", "star");
    target = target.replace("Adv", "Adventure");
    const wasIncluded = this.game.categories.find((category) => {
      return target.toLowerCase().includes(category.name.toLowerCase());
    });
    if (wasIncluded) return wasIncluded.name;
    return target;
  };

  private checkAcronym = (target: string): string => {
    const minAcronymLength = 3;
    const isAcronym = this.game.categories.find((category) => {
      const categoryAsArray = category.name.toLowerCase().split(" ");
      const acronym = categoryAsArray.map((word) => word[0]).join("");
      const hasAcronym = acronym.length >= minAcronymLength;
      return hasAcronym && target.toLowerCase().includes(acronym);
    });
    if (isAcronym) return isAcronym.name;
    return target;
  };

  fuzzyCategory = (target: string) => {
    const validCategories = this.sortedCategories();
    let targetCategory = this.checkSubstring(target);
    targetCategory = this.checkAcronym(targetCategory);
    return fuseSearch<ICategoryType>(validCategories, targetCategory);
  };

  fetchWorldRecord = async (category: ICategoryType): Promise<IRun> => {

    const speedrunLeaderboard = new SpeedrunLeaderboard(this.game, category);
    const leaderboard = await speedrunLeaderboard.fetch();
    const { runs: [ worldRecord ] } = leaderboard;

    return worldRecord;
  };

  fetchPersonalBest = async (
    category: ICategoryType,
    runnerId: string
  ): Promise<IRun> => {
    const speedrunLeaderboard = new SpeedrunLeaderboard(this.game, category);
    const leaderboard = await speedrunLeaderboard.fetch();
    const { runs } = leaderboard
    const personalRun: IRun | undefined = runs.find((run) => {
      return run.run.players[0].id === runnerId;
    });
    if (!personalRun) throw new Error(`Cant find PB`);

    return personalRun;
  };
}
