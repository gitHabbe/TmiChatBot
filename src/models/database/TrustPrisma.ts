import { Trust } from "@prisma/client";
import { JoinedUser, ModelName } from "../../interfaces/prisma";
import { DatabaseSingleton } from "./Prisma";
import { ChatUserstate } from "tmi.js"

export class TrustPrisma {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.trust];

  constructor(private user: JoinedUser, private chatter: ChatUserstate) {}

  get(trustee: string) {
    return this.client.findFirst({
      where: {
        userId: this.user.id,
        name: trustee,
      },
    });
  };

  getAll(): Promise<Trust[]> {
    return this.client.findMany({
      where: {
        userId: this.user.id,
      },
    });
  };

  async delete(streamer: string, trustee: string, chatter: string) {
    const isStreamer: boolean = chatter.toUpperCase() === streamer.toUpperCase()
    if (!isStreamer) throw new Error(`Only streamer can remove trust`)
    const hasTrust: Trust | null = await this.get(trustee)
    if (hasTrust === null) throw new Error(`${trustee} is not trusted.`)
    return this.client.deleteMany({
      where: {
        userId: this.user.id,
        name: hasTrust.name,
      },
    });
  };

  async save(madeBy: string, newTrust: string): Promise<Trust> {
    const oldTrustee = await this.get(newTrust)
    if (oldTrustee) throw new Error("Chatter already trusted")
    if (!this.chatter.username) throw new Error("No chatter")
    return this.client.create({
      data: {
        userId: this.user.id,
        name: newTrust,
        madeBy: this.chatter.username,
      },
    });
  };
}
