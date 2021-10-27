import axios, { AxiosError, AxiosResponse } from "axios";
import { speedrunAPI } from "../../config/speedrunConfig";
import { SpeedrunComErrorMessage, StatusCode } from "../../interfaces/speedrun";

export interface IAxiosOptions {
  name: string;
  type: string;
  url: string;
}

export interface IAPI<T> {
  fetch(options: IAxiosOptions): Promise<AxiosResponse<T>>;
  throw(options: IAxiosOptions, error: Error | AxiosError): never;
}

export class SpeedrunDotCom<T> implements IAPI<T> {
  fetch = async (options: IAxiosOptions) => {
    try {
      return await speedrunAPI.get<T>(options.url);
    } catch (error: any) {
      return this.throw(options, error);
    }
  };

  throw = (options: IAxiosOptions, error: Error | AxiosError) => {
    if (!axios.isAxiosError(error))
      throw new Error(SpeedrunComErrorMessage.Generic);
    if (!error.response) throw new Error(SpeedrunComErrorMessage.GenericAxios);
    const { type, name } = options;
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
}

export class SpeedrunCom<T> {
  constructor(private options: IAxiosOptions) {}

  fetchAPI = async () => {
    try {
      return await speedrunAPI.get<T>(this.options.url);
    } catch (error: any) {
      return this.throwError(error);
    }
  };

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
}
