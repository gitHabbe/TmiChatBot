import { ICategoryResponse, ICategoryType, IGameType, } from "../../interfaces/speedrun";
import { IAPI, IAxiosOptions } from "../../interfaces/Axios";

export class SpeedrunCategories {
  private options: IAxiosOptions = {
    type: "Categories",
    name: this.game.names.international,
    url: `games/${this.game.id}/categories`,
  };
  constructor(private instance: IAPI<ICategoryResponse>, private game: IGameType) {}

  async fetch(): Promise<ICategoryType[]> {
    const { data } = await this.instance.fetch(this.options);
    return data.data;
  }
}
