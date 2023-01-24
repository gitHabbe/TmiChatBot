import { User } from "@prisma/client";
import { ModuleFamily, ComponentsSupport } from "../../interfaces/tmi";
import { Prisma } from "./Prisma";

export class ComponentPrisma extends Prisma {
  private db = this.prisma.component;
  constructor(private user: User, private name: string) {
    super();
    if (name[0] === "!") this.name = name.slice(1);
    this.name = this.name.toUpperCase();
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
    const isSupported = this.name in ModuleFamily;
    if (!isSupported) throw new Error(`Component !${this.name} doesn't exist`);
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

  isFamilyEnabled(commandModule: ModuleFamily): Component | undefined {
    return this.user.components.find((userComponent: Component) => {
      const isCommand = userComponent.name.toUpperCase() === commandModule.toUpperCase();
      if (isCommand) {
        return userComponent.enabled
      }
      return false
    })
  }
}
