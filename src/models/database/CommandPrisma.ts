import { User } from "@prisma/client";
import { Prisma } from "./Prisma";

export class CommandPrisma extends Prisma {
  private db = this.prisma.command;
  constructor(private user: User) {
    super();
  }

  add = async (name: string, content: string, creator: string) => {
    const comment = await this.find(name);
    if (comment) throw new Error("Command already exists");
    return this.db.create({
      data: {
        name: name,
        content: content,
        madeBy: creator,
        userId: this.user.id,
      },
    });
  };

  remove = async (name: string) => {
    const comment = await this.find(name);
    if (!comment) throw new Error("Comment not found");
    return await this.db.delete({
      where: {
        id: comment.id,
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
