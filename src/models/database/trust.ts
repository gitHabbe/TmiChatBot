import { User } from "@prisma/client";
import { Prisma } from "./database";

export class TrustPrisma extends Prisma {
  private db = this.prisma.trust;
  constructor(private user: User) {
    super();
  }

  isTrusted = async (name: string) => {
    return this.find(name) !== null || name === this.user.name;
    // if (this.find(name) !== null) return true;
    // else if (creator === this.user.name) return true;
    // else return false;
  };

  add = async (newName: string, madeBy: string) => {
    const trustee = await this.find(newName);
    if (trustee) throw new Error(`${newName} is already trusted`);
    if (!this.isTrusted(madeBy)) throw new Error(`${newName} cannot add trust`);
    return this.db.create({
      data: {
        name: newName,
        madeBy: madeBy,
        userId: this.user.id,
      },
    });
  };

  remove = async (name: string) => {
    const trustee = await this.find(name);
    if (!trustee) throw new Error(`${name} is not trusted`);
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
