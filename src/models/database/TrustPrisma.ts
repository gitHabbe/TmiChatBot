import { Trust } from "@prisma/client";
import { JoinedUser, Model, ModelName } from "../../interfaces/prisma";
import { DatabaseSingleton } from "./Prisma";
import { Userstate } from "tmi.js";

export class TrustModel {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.trust];

  constructor(private user: JoinedUser, private trustee: Userstate) {}

  get = (): Promise<Trust | null> => {
    return this.client.findFirst({
      where: {
        userId: this.user.id,
        name: this.trustee.username,
      },
    });
  };

  getAll = (): Promise<Trust[]> => {
    return this.client.findMany({
      where: {
        userId: this.user.id,
      },
    });
  };

  delete = async (deleter: string) => {
    const isStreamer: boolean = this.user.name.toUpperCase() === deleter.toUpperCase()
    if (isStreamer === false) throw new Error(`Only streamer can remove trust`)
    const hasTrust: Trust | null = await this.get()
    if (hasTrust === null) throw new Error(`${this.trustee} is not trusted.`)
    return this.client.deleteMany({
      where: {
        userId: this.user.id,
        name: this.trustee.username,
      },
    });
  };

  save = async (madeBy: string): Promise<Trust> => {
    const oldTrustee = await this.get()
    if (oldTrustee) throw new Error("Chatter already trusted")
    return this.client.create({
      data: {
        userId: this.user.id,
        name: this.trustee.username,
        madeBy: madeBy,
      },
    });
  };
}



// export class TrustPrisma extends Prisma {
//   private db = this.prisma.trust;
//   constructor(private user: JoinedUser) {
//     super();
//   }
//
//   isTrusted = async (name: ChatUserstate): Promise<boolean> => {
//     const { username, mod } = name;
//     if (!username) throw new Error(`User not found`);
//     const isStreamer: boolean = this.user.name === username;
//     const isMod: boolean = mod === true;
//     const trustee = await this.find(username);
//     let isTrusted = false;
//     console.log("~ username", username);
//     if (trustee) {
//       isTrusted = trustee.name.toLowerCase() === username.toLowerCase();
//     }
//
//     return isStreamer || isMod || isTrusted;
//   };
//
//   add = async (newName: string, madeBy: ChatUserstate) => {
//     const { username } = madeBy;
//     if (!username) throw new Error(`User not found`);
//     const trustee = await this.find(newName);
//     if (trustee) throw new Error(`${newName} is already trusted`);
//     if (!this.isTrusted(madeBy)) throw new Error(`${madeBy} cannot add trust`);
//     return this.db.create({
//       data: {
//         name: newName,
//         madeBy: username,
//         userId: this.user.id,
//       },
//     });
//   };
//
//   remove = async (deleteName: string, madeBy: ChatUserstate) => {
//     const trustee = await this.find(deleteName);
//     if (!trustee) throw new Error(`${deleteName} is not trusted`);
//     if (!this.isTrusted(madeBy)) throw new Error(`${madeBy} cannot add trust`);
//     return await this.db.delete({
//       where: {
//         id: trustee.id,
//       },
//     });
//   };
//
//   find = (name: string) => {
//     return this.db.findFirst({
//       where: {
//         userId: this.user.id,
//         name: name,
//       },
//     });
//   };
//
//   findAll = () => {
//     return this.db.findMany({
//       where: {
//         userId: this.user.id,
//       },
//     });
//   };
// }
