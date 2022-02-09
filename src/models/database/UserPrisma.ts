import { Model, ModelName } from "../../interfaces/prisma";
import { DatabaseSingleton } from "./Prisma";

export class UserModel implements Model {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.user];
  constructor(private name: string) {}

  get = () => {
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

  save = (name: string) => {
    return this.client.create({ data: { name: name } });
  };

  delete = () => {
    return this.client.delete({ where: { name: this.name } });
  };
}
