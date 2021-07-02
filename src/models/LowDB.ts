import { join } from "path";
import { chain, PrimitiveChain } from "lodash";
import { Adapter, JSONFile, Low, SyncAdapter, JSONFileSync } from "lowdb";
import { TSpeedgame } from "../interfaces/lowdb";

// chain([1,2,3])
// chain()

type asdf = {
  names: string[];
  chain: string[];
};
class LowDB<T> {
  private data: T[] = [];
  private adapter: JSONFile<T>;
  private lowdb: Low<T>;
  private json: string;
  // private asdf: PrimitiveChain<T> = [];
  // private db: typeof chain;

  constructor(dbName: string) {
    this.json = join(__dirname + "/private/", dbName);
    this.adapter = new JSONFile<T>(this.json);
    this.lowdb = new Low<T>(this.adapter);
  }

  init = async () => {
    await this.lowdb.read();
    // this.asdf = chain(this.lowdb.data)
    return chain(this.lowdb.data);
  };

  getById = (id: string) => {
    const db = this.init();
    return db;
  };

  getData = () => {
    return this.data;
  };
}

// const asdf = new LowDB<asdf>("game_database.json");
// const asdf2 = asdf.getById("a");
// asdf2.then(data => data.)
// console.log(asdf);

const aa = async () => {
  const adapter = new JSONFile<asdf>(
    join(__dirname + "/private/", "game_database.json")
  );
  const asdf2 = new Low(adapter);
  await asdf2.adapter.read();
  asdf2.data.chain = chain<asdf>(asdf2.data);
};
