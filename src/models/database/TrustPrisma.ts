import { Trust } from "@prisma/client";
import { JoinedUser, Model, ModelName } from "../../interfaces/prisma";
import { DatabaseSingleton } from "./Prisma";
import { Userstate } from "tmi.js";

export class TrustModel {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.trust];

  constructor(private user: JoinedUser, private chatter: Userstate) {}

  get = (): Promise<Trust | null> => {
    return this.client.findFirst({
      where: {
        userId: this.user.id,
        name: this.chatter.username,
      },
    });
  };

  getAll = (): Promise<Trust[]> => {
    return this.client.findMany({
      where: {
        userId: this.user.id,
      },
    });
  };

  delete = async (deleter: string) => {
    const isStreamer: boolean = this.user.name.toUpperCase() === deleter.toUpperCase()
    if (isStreamer === false) throw new Error(`Only streamer can remove trust`)
    const hasTrust: Trust | null = await this.get()
    if (hasTrust === null) throw new Error(`${this.chatter} is not trusted.`)
    return this.client.deleteMany({
      where: {
        userId: this.user.id,
        name: this.chatter.username,
      },
    });
  };

  save = async (madeBy: string, newTrust: string): Promise<Trust> => {
    const oldTrustee = await this.get()
    if (oldTrustee) throw new Error("Chatter already trusted")
    return this.client.create({
      data: {
        userId: this.user.id,
        name: newTrust,
        madeBy: this.chatter.username,
      },
    });
  };
}
