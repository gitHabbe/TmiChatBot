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

export class JsonStringArray {
  private strings = new JsonFile<string[]>("tmi_channels");

  add = (newString: string) => {
    if (this.isInJson(newString)) {
      throw new Error("User already in JSON");
    }
    writeFileSync(
      this.strings.jsonFile,
      JSON.stringify([...this.strings.getData, newString])
    );
  };

  remove = (newString: string): void => {
    const newArray = this.strings.getData.filter(
      (curString: string) => curString !== newString
    );
    writeFileSync(this.strings.jsonFile, JSON.stringify(newArray));
  };

  isInJson = (newUser: string) => {
    return this.strings.getData.find((user: string) => user === newUser);
  };
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
