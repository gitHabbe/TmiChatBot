import { JoinedUser, Model, ModelName } from "../../interfaces/prisma";
import { DatabaseSingleton } from "./Prisma";
import { User } from "@prisma/client";

export class UserModel implements Model {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.user];
  constructor(private name: string) {}

  get = (): Promise<JoinedUser | null> => {
    return this.client.findFirst({
      where: { name: this.name },
      include: {
        commands: true,
        components: true,
        settings: true,
        timestamps: true,
        trusts: true,
      },
    });
  };

  getAll = () => {
    throw new Error(`Uncallable`);
  };

  save = async (): Promise<User> => {
    const oldUser = await this.get()
    if (oldUser) throw new Error("User already exists")
    return await this.client.create({ data: { name: this.name } });
  };

  delete = (): Promise<User> => {
    return this.client.delete({ where: { name: this.name } });
  };
}
