import { JoinedUser, ModelName } from "../../interfaces/prisma"
import { DatabaseSingleton } from "./Prisma"
import { ModuleFamily } from "../../interfaces/tmi"

class DeletePrisma {
  private db = DatabaseSingleton.getInstance().get();
  private user = this.db[ModelName.user];
  private component = this.db[ModelName.component];
  private trust = this.db[ModelName.trust];
  private timestamp = this.db[ModelName.timestamp];
  private command = this.db[ModelName.command];
  private setting = this.db[ModelName.setting];

  constructor(private name: string) {}


  async deleteAll() {
    const findFirst = await this.user.findFirst({ where: { name: this.name } })
    if (!findFirst) throw new Error("User not found")
    await this.component.deleteMany({ where: { userId: findFirst.id } })
    await this.command.deleteMany({ where: { userId: findFirst.id } })
    await this.timestamp.deleteMany({ where: { userId: findFirst.id } })
    await this.trust.deleteMany({ where: { userId: findFirst.id } })
    await this.setting.deleteMany({ where: { userId: findFirst.id } })
    await this.user.delete({ where: { id: findFirst.id } })
  }
}

export class UserPrisma {
  private db = DatabaseSingleton.getInstance().get();
  private client = this.db[ModelName.user];

  constructor(private name: string) {}

  async get(): Promise<JoinedUser> {
    let findFirst: JoinedUser | null = await this.getFirst();
    if (findFirst === null) {
      await this.create();
      findFirst = await this.getFirst();
    }
    if (findFirst === null) {
      throw new Error("Database error")
    }
    return findFirst
  };

  private async getFirst(): Promise<JoinedUser | null> {
    return await this.client.findFirst({
      where: { name: this.name },
      include: {
        commands: true,
        components: true,
        settings: true,
        timestamps: true,
        trusts: true,
      },
    });
  }

  async delete() {
    const deletePrisma = new DeletePrisma(this.name)
    await deletePrisma.deleteAll()
  };

  private async create() {
    return await this.client.create({
      data: {
        name: this.name,
        components: {
          create: [
            { name: ModuleFamily.TITLE, enabled: true },
            { name: ModuleFamily.UPTIME, enabled: true },
            { name: ModuleFamily.FOLLOWAGE, enabled: false },
            { name: ModuleFamily.SPEEDRUN, enabled: false },
            { name: ModuleFamily.TIMESTAMP, enabled: false },
            { name: ModuleFamily.POKEMON, enabled: false },
            { name: ModuleFamily.SLOTS, enabled: false },
          ]
        }
      }
    })
  }
}
