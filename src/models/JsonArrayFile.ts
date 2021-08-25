import { readFileSync, writeFileSync } from "fs";

export class JsonUserArrayFile<T> {
  private jsonFile: string = "./src/private/tmi_channels.json";
  private data: T[] = JSON.parse(readFileSync(this.jsonFile, "utf8"));

  constructor(private username: T) {}

  add = (): void => {
    if (this.isInJson()) {
      throw new Error("User already in JSON");
    }
    writeFileSync(this.jsonFile, JSON.stringify([...this.data, this.username]));
  };

  remove = (): void => {
    const newData = this.data.filter((name: T) => name !== this.username);
    writeFileSync(this.jsonFile, JSON.stringify(newData));
  };

  isInJson = (): T | undefined => {
    return this.data.find((user: T) => user === this.username);
  };
}

// interface hasId {
//   id: string;
// }

export class JsonArrayFile<T> {
  private jsonFile: string = `./src/private/${this.filename}.json`;
  private data: T[] = JSON.parse(readFileSync(this.jsonFile, "utf8"));
  constructor(private filename: string) {}

  get getData() {
    return this.data;
  }

  add = (newData: T) => {
    writeFileSync(this.jsonFile, JSON.stringify([...this.data, newData]));
  };
}

export interface level {
  id: string;
  name: string;
  abbreviation: string;
  vehicle: string;
  default: boolean;
}

export class JsonLevels {
  levels = new JsonArrayFile<level>("dkr_data");
  constructor() {}

  find = (lvl: level) => {
    return this.levels.getData.find((level) => {
      return level.abbreviation === lvl.abbreviation;
    });
  };
}
