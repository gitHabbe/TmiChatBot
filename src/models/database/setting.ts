import { User } from "@prisma/client";
import { Prisma } from "./database";

export class SettingPrisma extends Prisma {
  private db = this.prisma.setting;
  constructor(private user: User) {
    super();
  }
  add = async (type: string, name: string) => {
    return this.db.create({
      data: {
        userId: this.user.id,
        type: type,
        value: name,
      },
    });
  };

  delete = async (id: number) => {
    return this.db.delete({
      where: {
        id: id,
      },
    });
  };

  apply = async (type: string, name: string) => {
    let setting = await this.find(type);
    if (setting === null) {
      return this.add(type, name);
    }
    if (name === undefined) {
      return this.delete(setting.id);
    }

    return this.db.update({
      where: {
        id: setting.id,
      },
      data: {
        value: name,
      },
    });
  };

  find = async (type: string) => {
    const setting = await this.db.findFirst({
      where: {
        userId: this.user.id,
        type: type,
      },
    });

    return setting;
  };
}
