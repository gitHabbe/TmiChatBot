import { Adapter, JSONFile, Low } from "lowdb/lib";
import { join } from "path/posix";
import { StringDecoder } from "string_decoder";
import { TSpeedgame } from "../interfaces/lowdb";

class LowDB<T> {
  private adapter: JSONFile<T>;
  private json: string;
  private db: Low<T>;

  constructor(private dbName: string) {
    this.json = join(__dirname, this.dbName);
    this.adapter = new JSONFile<T>(this.json);
    this.db = new Low<T>(this.adapter);
  }

  getById = (id: string): void => {
    this.db;
  };
}
