import { Category, CategoryLink } from ".prisma/client";
import { getGame } from "../commands/speedrun";
import { JoinedGame } from "../interfaces/prisma";
import { ICategoryType, ILeaderboardReponse } from "../interfaces/speedrun";
import { fuseSearch } from "../utility/fusejs";
import { IAxiosOptions, SpeedrunCom } from "./axiosFetch";
import { GamePrisma } from "./database/GamePrisma";

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
    console.log("wasIncluded:", wasIncluded);
    if (wasIncluded) return wasIncluded.name;
    return target;
  };

  private checkAcronym = (target: string): string => {
    const minAcrynymLength = 3;
    const isAcronym = this.game.categories.find((category) => {
      const categoryAsArray = category.name.toLowerCase().split(" ");
      const acronym = categoryAsArray.map((word) => word[0]).join("");
      console.log("acronym:", acronym);
      const hasAcronym = acronym.length >= minAcrynymLength;
      return hasAcronym && target.toLowerCase().includes(acronym);
    });
    if (isAcronym) return isAcronym.name;
    return target;
  };

  private fuzzyCategory = (target: string) => {
    const validCategories = this.sortedCategories();
    let targetCategory = this.checkSubstring(target);
    targetCategory = this.checkAcronym(targetCategory);
    return fuseSearch(validCategories, targetCategory);
  };

  fetchWorldRecord = async (target: string) => {
    const fuzzyCategoryList = this.fuzzyCategory(target);
    const fuzzyCategory = fuzzyCategoryList[0].item;
    const options: IAxiosOptions = {
      type: "Leaderboard",
      name: "World record",
      url: `leaderboards/${this.game.id}/category/${fuzzyCategory.id}?top=1`,
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

  fetchPersonalBest = async (target: string, runnerId: string) => {
    const fuzzyCategoryList = this.fuzzyCategory(target);
    console.log("~ fuzzyCategoryList", fuzzyCategoryList);
    const fuzzyCategory = fuzzyCategoryList[0].item;
    const options: IAxiosOptions = {
      type: "Leaderboard",
      name: "Personal Best",
      url: `leaderboards/${this.game.id}/category/${fuzzyCategory.id}`,
    };
    const speedrunCom = new SpeedrunCom<ILeaderboardReponse>(options);
    const {
      data: { data: runs },
    } = await speedrunCom.fetchAPI();
    const personalRun = runs.runs.find((run) => {
      return run.run.players[0].id === runnerId;
    });
    if (!personalRun) throw new Error(`Cant find PB`);

    return personalRun;
  };
}
