import axios, { AxiosError } from "axios";
import { speedrunAPI } from "../config/speedrunConfig";
import { SpeedrunComErrorMessage, StatusCode } from "../interfaces/speedrun";

export interface IAxiosOptions {
  name: string;
  type: string;
  url: string;
}

export class SpeedrunCom<T> {
  constructor(private options: IAxiosOptions) {}

  throwError = (error: Error | AxiosError) => {
    if (!axios.isAxiosError(error))
      throw new Error(SpeedrunComErrorMessage.Generic);
    if (!error.response) throw new Error(SpeedrunComErrorMessage.GenericAxios);
    const { type, name } = this.options;
    const { NotFound, ServerError } = StatusCode;
    switch (error.response.status) {
      case NotFound:
        throw new Error(`${type} ${name} ${SpeedrunComErrorMessage.NotFound}`);
      case ServerError:
        throw new Error(`${SpeedrunComErrorMessage.ServerError}`);
      default:
        throw new Error(`${SpeedrunComErrorMessage.Generic} ${type} ${name}`);
    }
  };

  fetchAPI = async () => {
    try {
      return await speedrunAPI.get<T>(this.options.url);
    } catch (error) {
      return this.throwError(error);
    }
  };
}
