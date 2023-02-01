import { User } from "@prisma/client";
import { IVideo } from "../../interfaces/twitch";
import { Prisma } from "./Prisma";

export class TimestampPrisma extends Prisma {
  private db = this.prisma.timestamp;

  constructor(private user: User) {
    super();
  }

  async add(video: IVideo, name: string, madeBy: string) {
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

  async remove(deleteName: string) {
    const timestamp = await this.find(deleteName);
    if (!timestamp) throw new Error(`Timestamp ${deleteName} doesn't exist`);
    return await this.db.delete({
      where: {
        id: timestamp.id,
      },
    });
  };

  async find(name: string) {
    const timestamp = await this.db.findFirst({
      where: {
        userId: this.user.id,
        name: name,
      },
    });
    if (timestamp === null) throw new Error(`Timestamp: ${name} not found`);

    return timestamp;
  };

  async findAll() {
    const allTimestamps = await this.db.findMany({
      where: {
        userId: this.user.id,
      },
    });
    if (allTimestamps.length === 0)
      throw new Error(
        `You have no timestamps. Use !ts NameHere to create one.`
      );

    return allTimestamps;
  };
}
