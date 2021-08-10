import axios, { AxiosError, AxiosResponse } from "axios";
import { Interface } from "readline";
import { speedrunAPI } from "../config/speedrunConfig";
import { IGameType } from "../interfaces/speedrun";
import { SpeedrunResponse, RunnerResponse } from "../interfaces/speedrun";

interface IAxiosOptions {
  name: string;
  type: string;
  url: string;
}

enum StatusCode {
  NotFound = 404,
  ServerError = 420,
}

enum ErrorMessage {
  NotFound = "not found on SpeedrunCom",
  ServerError = "SpeedrunCom is having network problems",
  GenericAxios = "Problem getting data from SpeedrunCom",
  Generic = "Problem getting data from",
}

export class Speedrun<T> {
  constructor(private options: IAxiosOptions) {}

  throwError = (error: AxiosError) => {
    if (!error.response) throw new Error(ErrorMessage.GenericAxios);
    console.log("ERROR1");
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
      const { data } = await speedrunAPI.get<T>(this.options.url);
      return data;
    } catch (error) {
      this.throwError(error);
    }
  };
}

const asdf = async () => {
  const aa = new Speedrun<RunnerResponse>({
    name: "dkr",
    type: "User",
    url: "users/habbeee",
  });
  console.log("ASDF");
  try {
    const res = await aa.fetchAPI();
    console.log("res:", res);
  } catch (error) {
    console.log(error.message);
  }
};
