import { Prisma } from "./database";

export class UserPrisma extends Prisma {
  private db = this.prisma.user;
  constructor(private username: string) {
    super();
  }

  addUser = () => {
    return this.db.create({
      data: {
        name: this.username,
      },
    });
  };

  getUser = async () => {
    const user = await this.db.findFirst({
      where: {
        name: this.username,
      },
    });
    if (user === null) throw new Error("User not found");

    return user;
  };

  removeUser = () => {
    return this.db.delete({
      where: {
        name: this.username,
      },
    });
  };
}
