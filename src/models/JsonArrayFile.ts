import { readFileSync } from "fs"
import { ILevels, ITimeTrialJson, ITimeTrialsJson, ITrack, } from "../interfaces/specificGames"
import * as fs from "fs"

export class JsonFile<T> {
  jsonFile: string = `./src/${this.path}${this.filename}.json`;
  private data = JSON.parse(readFileSync(this.jsonFile, "utf8"));

  constructor(private path: string, private filename: string) {}

  get getData(): T {
    return this.data;
  }

  set setData(data: T) {
    this.data = data;
  }
}

export class JsonLevels {
  private levels = new JsonFile<ILevels>("utility/", "dkr_data");

  data(): ITrack[] {
    return this.levels.getData.levels;
  };

  find(lvl: ITrack) {
    return this.data().find((level) => {
      return level.abbreviation === lvl.abbreviation;
    });
  };
}

export class JsonTimeTrials {
  private levels = new JsonFile<ITimeTrialsJson>("utility/", "dkr_data");

  data(): ITimeTrialJson[] {
    return this.levels.getData.timetrial;
  };

  find(lvl: ITimeTrialJson): ITimeTrialJson | undefined {
    return this.data().find((level) => {
      return level.abbreviation === lvl.abbreviation;
    });
  };
}

export class JsonChannels {
  private channels = new JsonFile<string[]>(this.path, this.filename);
  constructor(private path: string, private filename: string) {}

  data(): string[] {
    return this.channels.getData
  }

  add(name: string) {
    this.channels.getData.push(name.toLowerCase());
    fs.writeFileSync(this.channels.jsonFile, JSON.stringify(this.channels.getData));
  }

  remove(name: string) {
    this.channels.setData = this.channels.getData.filter((channel: string) => channel.toLowerCase() !== name.toLowerCase());
    fs.writeFileSync(this.channels.jsonFile, JSON.stringify(this.channels.getData));
  }
}