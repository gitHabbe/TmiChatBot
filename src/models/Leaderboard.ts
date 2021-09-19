import { Category, CategoryLink } from ".prisma/client";
import { JoinedGame } from "../interfaces/prisma";
import {
  ICategoryType,
  ILeaderboardReponse,
  IRun,
} from "../interfaces/speedrun";
import { IAxiosOptions, SpeedrunCom } from "./axiosFetch";
import { fuseSearch } from "../utility/fusejs";

export class Leaderboard {
  constructor(private game: JoinedGame) {}

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
    const wasIncluded = this.game.categories.find((category) => {
      return target.toLowerCase().includes(category.name.toLowerCase());
    });
    if (wasIncluded) return wasIncluded.name;
    return target;
  };

  private checkAcronym = (target: string): string => {
    const minAcrynymLength = 3;
    const isAcronym = this.game.categories.find((category) => {
      const categoryAsArray = category.name.toLowerCase().split(" ");
      const acronym = categoryAsArray.map((word) => word[0]).join("");
      const hasAcronym = acronym.length >= minAcrynymLength;
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
    const options: IAxiosOptions = {
      type: "Leaderboard",
      name: "World record",
      url: `leaderboards/${this.game.id}/category/${category.id}?top=1`,
    };
    const speedrunCom = new SpeedrunCom<ILeaderboardReponse>(options);
    const {
      data: {
        data: {
          runs: [worldRecord],
        },
      },
    } = await speedrunCom.fetchAPI();

    return worldRecord;
  };

  fetchPersonalBest = async (
    category: ICategoryType,
    runnerId: string
  ): Promise<IRun> => {
    const options: IAxiosOptions = {
      type: "Leaderboard",
      name: "Personal Best",
      url: `leaderboards/${this.game.id}/category/${category.id}`,
    };
    const speedrunCom = new SpeedrunCom<ILeaderboardReponse>(options);
    const {
      data: { data: runs },
    } = await speedrunCom.fetchAPI();
    const personalRun: IRun | undefined = runs.runs.find((run) => {
      return run.run.players[0].id === runnerId;
    });
    if (!personalRun) throw new Error(`Cant find PB`);

    return personalRun;
  };
}
