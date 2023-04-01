import { CategoryLink } from ".prisma/client";
import { FullGame } from "../../interfaces/prisma";
import { ICategoryType, IRun } from "../../interfaces/speedrun"
// import { SpeedrunCom } from "./SpeedrunCom";
import { fuseSearch } from "../../utility/fusejs";
import { SpeedrunLeaderboard } from "./SpeedrunCom";
import { FullSpeedrunGame, Link } from "../../interfaces/general"

export class Leaderboard {
  constructor(private game: FullSpeedrunGame) {}

  private validCategories = () => {
    this.game.categories[0].links[0].rel
    const hasLeaderboard = ({ rel }: Link) => rel === "leaderboard";
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

  fuzzyCategory(target: string) {
    const validCategories = this.sortedCategories();
    let targetCategory = this.checkSubstring(target);
    targetCategory = this.checkAcronym(targetCategory);
    return fuseSearch<ICategoryType>(validCategories, targetCategory);
  };

  async fetchWorldRecord(category: ICategoryType): Promise<IRun> {
    const speedrunLeaderboard = new SpeedrunLeaderboard(this.game, category);
    const leaderboard = await speedrunLeaderboard.fetchWorldRecord();
    const { runs: [ worldRecord ] } = leaderboard;

    return worldRecord;
  };

  async fetchPersonalBest(category: ICategoryType, runnerId: string): Promise<IRun> {
    const speedrunLeaderboard = new SpeedrunLeaderboard(this.game, category);
    const leaderboard = await speedrunLeaderboard.fetchLeaderboard();
    const { runs } = leaderboard
    const personalRun: IRun | undefined = runs.find((run) => {
      return run.run.players[0].id === runnerId;
    });
    if (!personalRun) throw new Error(`Cant find PB`);

    return personalRun;
  };
}
