import { Prisma } from "./Prisma";
import { Command } from ".prisma/client";
import { JoinedUser } from "../../interfaces/prisma";

export class CommandPrisma extends Prisma {
  private db = this.prisma.command;

  constructor(private user: JoinedUser) {
    super();
  }

  async add(name: string, content: string, creator: string): Promise<Command> {
    return this.db.create({
      data: {
        name: name,
        content: content,
        madeBy: creator,
        userId: this.user.id,
      },
    });
  };

  async remove(name: string): Promise<Command> {
    const command = await this.find(name);
    if (!command) throw new Error("Command not found");
    return await this.db.delete({
      where: {
        id: command.id,
      },
    });
  };

  async find(name: string): Promise<Command | null> {
    const command = await this.db.findFirst({
      where: {
        userId: this.user.id,
        name: name,
      },
    });

    return command;
  };

  async findAll(): Promise<Command[]> {
    return await this.db.findMany({
      where: {
        userId: this.user.id,
      },
    });
  };

}
