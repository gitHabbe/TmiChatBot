import {
  ICategoryResponse,
  ICategoryType,
  IGameResponse,
  IGameType,
} from "../../interfaces/speedrun";
import { IAPI, IAxiosOptions } from "./SpeedrunCom";

export class FetchGame {
  private options: IAxiosOptions = {
    type: "Game",
    name: this.name,
    url: `/games/${this.name}`,
  };
  constructor(private api: IAPI<IGameResponse>, private name: string) {}

  get = async (): Promise<IGameType> => {
    const { data } = await this.api.fetch(this.options);
    const game = data.data;

    return game;
  };
}

export class FetchCategories {
  private options: IAxiosOptions = {
    type: "Categories",
    name: this.game.names.international,
    url: `games/${this.game.id}/categories`,
  };
  constructor(private api: IAPI<ICategoryResponse>, private game: IGameType) {}

  get = async (): Promise<ICategoryType[]> => {
    const { data } = await this.api.fetch(this.options);
    const categories = data.data;

    return categories;
  };
}
