import { User } from "@prisma/client";
import { IVideo } from "../../interfaces/twitch";
import { Prisma } from "./database";

export class TimestampPrisma extends Prisma {
  private db = this.prisma.timestamp;
  constructor(private user: User) {
    super();
  }

  add = async (video: IVideo, name: string, madeBy: string) => {
    const { url, created_at, id, viewable } = video;
    const started_date = new Date(created_at).getTime();
    const now_date = new Date().getTime();
    const secondsAgo: number = Math.floor((now_date - started_date) / 1000);
    return this.db.create({
      data: {
        name: name,
        url: url,
        madeBy: madeBy,
        timestamp: secondsAgo,
        vodId: parseInt(id),
        userId: this.user.id,
      },
    });
  };

  // remove = async (deleteName: string, madeBy: string) => {
  //   return await this.db.delete({
  //     where: {
  //       id: trustee.id,
  //     },
  //   });
  // };

  find = (name: string) => {
    return this.db.findFirst({
      where: {
        userId: this.user.id,
        name: name,
      },
    });
  };

  // findAll = () => {
  //   return this.db.findMany({
  //     where: {
  //       userId: this.user.id,
  //     },
  //   });
  // };
}
