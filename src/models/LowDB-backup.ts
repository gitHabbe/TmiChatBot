// import { join } from "path";
// import { chain, PrimitiveChain } from "lodash";
// import { Adapter, JSONFile, Low, SyncAdapter, JSONFileSync, LowSync, lowdb } from "lowdb";
// import { TSpeedgame } from "../interfaces/lowdb";

// // chain([1,2,3])
// // chain()

// type asdf = {
//   names: string[];
//   chain: typeof chain;
// };
// class LowDB<T> {
//   private data: T[] = [];
//   private adapter: JSONFile<T>;
//   private lowdb: LowSync<T>;
//   private json: string;
//   // private asdf: PrimitiveChain<T> = [];
//   // private db: typeof chain;

//   constructor(dbName: string) {
//     this.json = join(__dirname + "/private/", dbName);
//     this.adapter = new JSONFile<T>(this.json);
//     this.lowdb = new Low<T>(this.adapter);
//   }

//   init = async () => {
//     await this.lowdb.read();
//     const asdf = chain(this.lowdb.data);
//     return chain(this.lowdb.data);
//   };

//   getById = (id: string) => {
//     const db = this.init();
//     this.lowdb.data.
//     return db;
//   };

//   getData = () => {
//     return this.data;
//   };
// }

// // const asdf = new LowDB<asdf>("game_database.json");
// // const asdf2 = asdf.getById("a");
// // asdf2.then(data => data.)
// // console.log(asdf);

// const aa = async () => {
//   const adapter = new JSONFile<asdf>(
//     join(__dirname + "/private/", "game_database.json")
//   );
//   const asdf2 = new Low<asdf>(adapter);
//   await asdf2.read();
//   asdf2._.mix
//   asdf2.data.chain = chain(asdf2.data)
//   // asdf2.data.chain = chain<asdf>(asdf2.data.chain);
// };

import { join, resolve, dirname } from "path";
import { LowSync, JSONFileSync } from "lowdb";
import lodash from "lodash";

const dbf = join(resolve(dirname("")), "db.json");
const adapter = new JSONFileSync(dbf);
const db = new LowSync(adapter);

db.read();

db.chain = lodash.chain(db.data);

console.log(db.chain.get("bleh").find({ id: 0 }).value());

db.chain.get("bleh").find({ id: 0 }).assign({ new: "value" });

console.log(db.chain.get("bleh").find({ id: 0 }).value());
