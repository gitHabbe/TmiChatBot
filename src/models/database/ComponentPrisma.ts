import { Component } from "@prisma/client";
import { ModuleFamily } from "../../interfaces/tmi";
import { Prisma } from "./Prisma";
import { JoinedUser } from "../../interfaces/prisma";

export class ComponentPrisma extends Prisma {
  private db = this.prisma.component;

  constructor(private user: JoinedUser, private name: string) {
    super();
    if (name[0] === "!") this.name = name.slice(1);
    this.name = this.name.toUpperCase();
  }

  async toggle() {
    let component = await this.getComponent();
    if (component === null) return

    return this.db.update({
      where: {
        id: component.id,
      },
      data: {
        enabled: !component.enabled,
      },
    });
  };

  async isEnabled() {
    let component = await this.getComponent();
    if (component === null) return

    return component.enabled;
  };



  getComponent() {
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
