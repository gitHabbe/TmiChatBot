import { User } from ".prisma/client";
import { Prisma } from "./Prisma";

export class UserPrisma extends Prisma {
  private db = this.prisma.user;
  constructor(private username: string) {
    super();
  }

  add = (): Promise<User> => {
    return this.db.create({
      data: {
        name: this.username,
      },
    });
  };

  find = async (): Promise<User> => {
    const user = await this.db.findFirst({
      where: {
        name: this.username,
      },
    });
    if (user === null) throw new Error("User not found");

    return user;
  };

  remove = (): Promise<User> => {
    return this.db.delete({
      where: {
        name: this.username,
      },
    });
  };
}
