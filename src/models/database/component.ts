import { User } from "@prisma/client";
import { Prisma } from "./database";

export class ComponentPrisma extends Prisma {
  private db = this.prisma.component;
  constructor(private user: User, private name: string) {
    super();
  }

  toggle = async () => {
    let component = await this.getComponent();
    if (component === null) component = await this.createComponent();

    return this.db.update({
      where: {
        id: component.id,
      },
      data: {
        enabled: !component.enabled,
      },
    });
  };

  isEnabled = async () => {
    let component = await this.getComponent();
    if (component === null) component = await this.createComponent();

    return component.enabled;
  };

  createComponent = () => {
    return this.db.create({
      data: {
        userId: this.user.id,
        name: this.name,
        enabled: false,
      },
    });
  };

  getComponent = () => {
    return this.db.findFirst({
      where: {
        userId: this.user.id,
        name: this.name,
      },
    });
  };
}
