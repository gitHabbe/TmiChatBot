import { readFileSync, writeFileSync } from "fs";
import {
  ITrack,
  ILevels,
  ITimeTrialJson,
  ITimeTrialsJson,
} from "../interfaces/specificGames";

export class JsonFile<T> {
  jsonFile: string = `./src/utility/${this.filename}.json`;
  private data = JSON.parse(readFileSync(this.jsonFile, "utf8"));
  constructor(private filename: string) {}

  get getData(): T {
    return this.data;
  }
}

export class JsonLevels {
  private levels = new JsonFile<ILevels>("dkr_data");

  data = (): ITrack[] => {
    return this.levels.getData.levels;
  };

  find = (lvl: ITrack) => {
    return this.data().find((level) => {
      return level.abbreviation === lvl.abbreviation;
    });
  };
}

export class JsonTimeTrials {
  private levels = new JsonFile<ITimeTrialsJson>("dkr_data");

  data = (): ITimeTrialJson[] => {
    return this.levels.getData.timetrial;
  };

  find = (lvl: ITimeTrialJson): ITimeTrialJson | undefined => {
    return this.data().find((level) => {
      return level.abbreviation === lvl.abbreviation;
    });
  };
}
