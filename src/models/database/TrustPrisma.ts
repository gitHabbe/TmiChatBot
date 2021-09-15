import { User } from "@prisma/client";
import { ChatUserstate } from "tmi.js";
import { Prisma } from "./Prisma";

export class TrustPrisma extends Prisma {
  private db = this.prisma.trust;
  constructor(private user: User) {
    super();
  }

  isTrusted = async (name: ChatUserstate): Promise<boolean> => {
    const { username, mod } = name;
    if (!username) throw new Error(`User not found`);
    const isStreamer: boolean = this.user.name === username;
    const isMod: boolean = mod === true;
    const trustee = await this.find(username);
    let isTrusted = false;
    console.log("~ username", username);
    if (trustee) {
      isTrusted = trustee.name.toLowerCase() === username.toLowerCase();
    }

    return isStreamer || isMod || isTrusted;
  };

  add = async (newName: string, madeBy: ChatUserstate) => {
    const { username } = madeBy;
    if (!username) throw new Error(`User not found`);
    const trustee = await this.find(newName);
    if (trustee) throw new Error(`${newName} is already trusted`);
    if (!this.isTrusted(madeBy)) throw new Error(`${madeBy} cannot add trust`);
    return this.db.create({
      data: {
        name: newName,
        madeBy: username,
        userId: this.user.id,
      },
    });
  };

  remove = async (deleteName: string, madeBy: ChatUserstate) => {
    const trustee = await this.find(deleteName);
    if (!trustee) throw new Error(`${deleteName} is not trusted`);
    if (!this.isTrusted(madeBy)) throw new Error(`${madeBy} cannot add trust`);
    return await this.db.delete({
      where: {
        id: trustee.id,
      },
    });
  };

  find = (name: string) => {
    return this.db.findFirst({
      where: {
        userId: this.user.id,
        name: name,
      },
    });
  };

  findAll = () => {
    return this.db.findMany({
      where: {
        userId: this.user.id,
      },
    });
  };
}
