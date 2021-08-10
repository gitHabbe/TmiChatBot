import { Prisma } from "./database";

export class User extends Prisma {
  constructor(private username: string) {
    super();
  }

  addUser = () => {
    return this.prisma.user.create({
      data: {
        name: this.username,
      },
    });
  };

  getUser = () => {
    return this.prisma.user.findFirst({
      where: {
        name: this.username,
      },
    });
  };
}
