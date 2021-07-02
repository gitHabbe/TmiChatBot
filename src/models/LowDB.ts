import { join } from "path";
import { chain, PrimitiveChain } from "lodash";
import { Adapter, JSONFile, Low, SyncAdapter, JSONFileSync, LowSync, lowdb } from "lowdb";
import { TSpeedgame } from "../interfaces/lowdb";

// chain([1,2,3])
// chain()

// type asdf = {
//   names: string[];
//   chain: typeof chain;
// };

class LowDBWithChain<T> extends Low<T> {
  chain: PrimitiveChain<T | null>;
  // private data2: T[] = [];
  constructor(adapter: Adapter<T>) {
    super(adapter)
    this.chain = chain(this.data);
  }

  // createChain = (data: <T>[]) => {
  //   this.chain = chain(data);
  // }
}
class LowDB<T> {
  // private data: T[] = [];
  private json: string;
  private adapter: JSONFile<T>;
  private lowdb: Low<T>;
  // private asdf: PrimitiveChain<T> = [];
  // private db: typeof chain;

  constructor(dbName: string) {
    this.json = join(__dirname + "/private/", dbName);
    this.adapter = new JSONFile<T>(this.json);
    this.lowdb = new LowDBWithChain<T>(this.adapter);
  }

  init = async () => {
    await this.lowdb.read();
    this.lowdb.
    // this. 
    const asdf = chain(this.lowdb.data);
    return chain(this.lowdb.data);
  };

  getById = (id: string) => {
    const db = this.init();
    this.lowdb
    return db;
  };

  // getData = () => {
  //   return this.data;
  // };
}