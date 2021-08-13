import axios, { AxiosError } from "axios";
import { speedrunAPI } from "../config/speedrunConfig";
import { ErrorMessage, StatusCode } from "../interfaces/speedrun";

export interface IAxiosOptions {
  name: string;
  type: string;
  url: string;
}

export class Speedrun<T> {
  constructor(private options: IAxiosOptions) {}

  throwError = (error: Error | AxiosError) => {
    if (!axios.isAxiosError(error)) throw new Error(ErrorMessage.Generic);
    if (!error.response) throw new Error(ErrorMessage.GenericAxios);
    const { type, name } = this.options;
    const { NotFound, ServerError } = StatusCode;
    switch (error.response.status) {
      case NotFound:
        throw new Error(`${type} ${name} ${ErrorMessage.NotFound}`);
      case ServerError:
        throw new Error(`${ErrorMessage.ServerError}`);
      default:
        throw new Error(`${ErrorMessage.Generic} ${type} ${name}`);
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
