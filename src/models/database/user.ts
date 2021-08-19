import { Prisma } from "./database";

export class UserPrisma extends Prisma {
  private db = this.prisma.user;
  constructor(private username: string) {
    super();
  }

  add = () => {
    return this.db.create({
      data: {
        name: this.username,
      },
    });
  };

  find = async () => {
    const user = await this.db.findFirst({
      where: {
        name: this.username,
      },
    });
    if (user === null) throw new Error("User not found");

    return user;
  };

  remove = () => {
    return this.db.delete({
      where: {
        name: this.username,
      },
    });
  };
}
