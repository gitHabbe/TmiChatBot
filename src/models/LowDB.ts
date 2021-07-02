import { join } from "path";
import { chain, PrimitiveChain } from "lodash";
import {
  Adapter,
  JSONFile,
  Low,
  SyncAdapter,
  JSONFileSync,
  LowSync,
} from "lowdb";
import { TSpeedgame } from "../interfaces/lowdb";

// chain([1,2,3])
// chain()

type asdf = {
  names: string[];
  // chain: typeof chain;
};

class LowDBWithChain<T> extends Low<T> {
  chain: PrimitiveChain<T | null>;
  // private data2: T[] = [];
  constructor(adapter: Adapter<T>) {
    super(adapter);
    this.chain = chain(this.data);
    console.log("RAN THIS");
  }

  // createChain = (data: <T>[]) => {
  //   this.chain = chain(data);
  // }
}

// class bbb {
//   bb: string = "ASDF";
// }
// class aaa extends bbb {
//   constructor() {
//     super()
//     this.bb
//   }
// }
export class LowDB<T> {
  // private data: T[] = [];
  private json: string;
  private adapter: JSONFile<T>;
  private lowdb: LowDBWithChain<T>;
  // private asdf: PrimitiveChain<T> = [];
  // private db: typeof chain;

  constructor(dbName: string) {
    this.json = join(__dirname + "/private/", dbName);
    this.adapter = new JSONFile<T>(this.json);
    this.lowdb = new LowDBWithChain<T>(this.adapter);
    this.lowdb.read();
  }

  // init = async () => {
  //   await this.lowdb.read();
  //   // this.lowdb.chain
  //   // this.
  //   const asdf = chain(this.lowdb.data);
  //   return chain(this.lowdb.data);
  // };

  // getById = (id: string) => {
  //   const db = this.init();
  //   this.lowdb;
  //   return db;
  // };

  getData = () => {
    return this.lowdb.chain;
  };
}

// const asdf = new LowDB<asdf>("game_database.json");
// asdf.init();
// asdf.getData();
