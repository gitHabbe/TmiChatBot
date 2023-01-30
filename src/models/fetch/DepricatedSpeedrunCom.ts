import axios, { AxiosError, AxiosInstance } from "axios";
import { speedrunAPI } from "../../config/speedrunConfig";
import { ITrack } from "../../interfaces/specificGames";
import { IGameType, SpeedrunComErrorMessage, StatusCode, } from "../../interfaces/speedrun";
import { IAPI, IAxiosOptions } from "../../interfaces/Axios";

export class Api<T> implements IAPI<T> {
  constructor(private instance: AxiosInstance) {}

  fetch = async (options: IAxiosOptions) => {
    try {
      return await this.instance.get<T>(options.url);
    } catch (error: any) {
      return this.throw(options, error);
    }
  };

  throw = (options: IAxiosOptions, error: Error | AxiosError) => {
    if (!axios.isAxiosError(error))
      throw new Error(SpeedrunComErrorMessage.Generic);
    if (!error.message) throw new Error(SpeedrunComErrorMessage.GenericAxios);
    const { type, name } = options;
    const { NotFound, ServerError } = StatusCode;
    switch (error.message.status) {
      case NotFound:
        throw new Error(`${type} ${name} ${SpeedrunComErrorMessage.NotFound}`);
      case ServerError:
        throw new Error(`${SpeedrunComErrorMessage.ServerError}`);
      default:
        throw new Error(`${SpeedrunComErrorMessage.Generic} ${type} ${name}`);
    }
  };
}

export class GameApi<T> {
  private options: IAxiosOptions = {
    name: this.name,
    type: "game",
    url: `/games/${this.name}`,
  };

  constructor(private api: IAPI<T>, private name: string) {}

  fetch = async () => {
    const { data } = await this.api.fetch(this.options);
    return data;
  };
}



export class CategoriesApi<T> {
  private options: IAxiosOptions = {
    name: this.game.names.international,
    type: "category",
    url: `games/${this.game.id}/categories`,
  };

  constructor(private api: IAPI<T>, private game: IGameType) {}

  fetch = async () => {
    const { data } = await this.api.fetch(this.options);
    return data;
  };
}

export class WorldRecordApi<T> {
  private categoryId = "ndx0q5dq";
  private options: IAxiosOptions = {
    type: "Leaderboard",
    name: this.track.name,
    url: `leaderboards/9dow9e1p/level/${this.track.id}/${this.categoryId}?top=1`,
  };

  constructor(private api: IAPI<T>, private track: ITrack) {}

  fetch = async () => {
    const { data } = await this.api.fetch(this.options);
    return data;
  };
}

export class TimeTrialWorldRecordApi<T> {
  // &track=fossil-canyon&vehicle=hover&laps=1&type=standard
  private options: IAxiosOptions = {
    type: "Leaderboard",
    name: this.track.name,
    url: `/world_record?api_token=${process.env.DKR64_API_TOKEN}&track=${this.track.name}&vehicle=${this.track.vehicle}&laps=${this.laps}&type=${this.type}`,
  };

  constructor(private api: IAPI<T>, private track: ITrack, private laps: string, private type: string) {}

  fetch = async () => {
    console.log(this.options.url)
    const { data } = await this.api.fetch(this.options);
    return data;
  };
}


export class TimeTrialPersonalBestApi<T> {
  // &track=fossil-canyon&vehicle=hover&laps=1&type=standard
  private options: IAxiosOptions = {
    type: "Leaderboard",
    name: this.track.name,
    url: `/times?api_token=${process.env.DKR64_API_TOKEN}&track=${this.track.name}&vehicle=${this.track.vehicle}&laps=${this.laps}&type=${this.type}&user=${this.username}`,
  };

  constructor(private api: IAPI<T>, private track: ITrack, private laps: string, private type: string, private username: string) {}

  fetch = async () => {
    const { data } = await this.api.fetch(this.options);
    return data;
  };
}

export class LeaderboardApi<T> {
  private categoryId = "ndx0q5dq";
  private options: IAxiosOptions = {
    type: "Leaderboard",
    name: this.track.name,
    url: `leaderboards/9dow9e1p/level/${this.track.id}/${this.categoryId}`,
  };

  constructor(private api: IAPI<T>, private track: ITrack) {}

  fetch = async () => {
    const { data } = await this.api.fetch(this.options);
    return data;
  };
}


// export class GameAPI<T> implements API2<T> {
//   public options: IAxiosOptions = {
//     name: this.name,
//     type: this.type,
//     url: `/games/${this.name}`,
//   };

//   constructor(
//     public api: AxiosInstance,
//     private name: string,
//     private type: string
//   ) {}

//   fetch = async () => {
//     try {
//       return await this.api.get<T>(this.options.url);
//     } catch (error: any) {
//       return this.throw(error);
//     }
//   };

//   throw = (error: Error | AxiosError) => {
//     if (!axios.isAxiosError(error))
//       throw new Error(SpeedrunComErrorMessage.Generic);
//     if (!error.response) throw new Error(SpeedrunComErrorMessage.GenericAxios);
//     const { type, name } = this.options;
//     const { NotFound, ServerError } = StatusCode;
//     switch (error.response.status) {
//       case NotFound:
//         throw new Error(`${type} ${name} ${SpeedrunComErrorMessage.NotFound}`);
//       case ServerError:
//         throw new Error(`${SpeedrunComErrorMessage.ServerError}`);
//       default:
//         throw new Error(`${SpeedrunComErrorMessage.Generic} ${type} ${name}`);
//     }
//   };
// }

// const asdf = new GameAPI<IGameResponse>(speedrunAPI, "dkr", "game");
// const aaa = asdf.fetch().then((data) => {
//   console.log("data:", data);
// });

// export class SpeedrunDotCom<T> implements IAPI<T> {
//   fetch = async (options: IAxiosOptions) => {
//     try {
//       return await speedrunAPI.get<T>(options.url);
//     } catch (error: any) {
//       return this.throw(options, error);
//     }
//   };
//
//   throw = (options: IAxiosOptions, error: Error | AxiosError) => {
//     if (!axios.isAxiosError(error))
//       throw new Error(SpeedrunComErrorMessage.Generic);
//     if (!error.message) throw new Error(SpeedrunComErrorMessage.GenericAxios);
//     const { type, name } = options;
//     const { NotFound, ServerError } = StatusCode;
//     switch (error.message.status) {
//       case NotFound:
//         throw new Error(`${type} ${name} ${SpeedrunComErrorMessage.NotFound}`);
//       case ServerError:
//         throw new Error(`${SpeedrunComErrorMessage.ServerError}`);
//       default:
//         throw new Error(`${SpeedrunComErrorMessage.Generic} ${type} ${name}`);
//     }
//   };
// }

// export class TwitchDotTv<T> implements IAPI<T> {
//   fetch = async (options: IAxiosOptions) => {
//     try {
//       return await twitchAPI.get<T>(options.url);
//     } catch (error: any) {
//       return this.throw(options, error);
//     }
//   };

//   throw = (options: IAxiosOptions, error: Error | AxiosError) => {
//     if (!axios.isAxiosError(error))
//       throw new Error(TwitchTvErrorMessage.Generic);
//     if (!error.response) throw new Error(TwitchTvErrorMessage.GenericAxios);
//     const { type, name } = options;
//     const { NotFound, ServerError } = StatusCode;
//     switch (error.response.status) {
//       case NotFound:
//         throw new Error(`${type} ${name} ${TwitchTvErrorMessage.NotFound}`);
//       case ServerError:
//         throw new Error(`${TwitchTvErrorMessage.ServerError}`);
//       default:
//         throw new Error(`${TwitchTvErrorMessage.Generic} ${type} ${name}`);
//     }
//   };
// }
// export class SpeedrunCom<T> {
//   constructor(private options: IAxiosOptions) {}
//
//   fetchAPI = async () => {
//     try {
//       return await speedrunAPI.get<T>(this.options.url);
//     } catch (error: any) {
//       return this.throwError(error);
//     }
//   };
//
//   throwError = (error: Error | AxiosError) => {
//     if (!axios.isAxiosError(error))
//       throw new Error(SpeedrunComErrorMessage.Generic);
//     if (!error.message) throw new Error(SpeedrunComErrorMessage.GenericAxios);
//     const { type, name } = this.options;
//     const { NotFound, ServerError } = StatusCode;
//     switch (error.message.status) {
//       case NotFound:
//         throw new Error(`${type} ${name} ${SpeedrunComErrorMessage.NotFound}`);
//       case ServerError:
//         throw new Error(`${SpeedrunComErrorMessage.ServerError}`);
//       default:
//         throw new Error(`${SpeedrunComErrorMessage.Generic} ${type} ${name}`);
//     }
//   };
// }

