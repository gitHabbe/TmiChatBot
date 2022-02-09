import { User } from "@prisma/client";
import { Prisma } from "./Prisma";
import { Command } from ".prisma/client";

export class CommandPrisma extends Prisma {
  private db = this.prisma.command;
  constructor(private user: User) {
    super();
  }

  add = async (
    name: string,
    content: string,
    creator: string
  ): Promise<Command> => {
    const command = await this.find(name);
    if (command) throw new Error("Command already exists");
    return this.db.create({
      data: {
        name: name,
        content: content,
        madeBy: creator,
        userId: this.user.id,
      },
    });
  };

  remove = async (name: string): Promise<Command> => {
    const command = await this.find(name);
    if (!command) throw new Error("Command not found");
    return await this.db.delete({
      where: {
        id: command.id,
      },
    });
  };

  find = async (name: string): Promise<Command | null> => {
    const command = await this.db.findFirst({
      where: {
        userId: this.user.id,
        name: name,
      },
    });

    return command;
  };

  findAll = async (): Promise<Command[]> => {
    return await this.db.findMany({
      where: {
        userId: this.user.id,
      },
    });
  };
}
