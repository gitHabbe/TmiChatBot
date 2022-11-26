import { User } from "@prisma/client";
import { Prisma } from "./Prisma";

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
  // delete = async (setting: SettingPrisma) => {
    return this.db.delete({
      where: {
        id: id,
      },
    });
  };

  update = async (id: number, type: string, value: string | undefined) => {
    // let setting = await this.find(type);
    // if (setting === null) {
    //   return this.add(type, value);
    // }
    // if (value === undefined) {
    //   return this.delete(id);
    // }

    return this.db.update({
      where: {
        id: id,
      },
      data: {
        value: value,
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
