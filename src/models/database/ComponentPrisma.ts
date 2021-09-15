import { User } from "@prisma/client";
import { ComponentsSupport } from "../../interfaces/tmi";
import { Prisma } from "./Prisma";

export class ComponentPrisma extends Prisma {
  private db = this.prisma.component;
  constructor(private user: User, private name: string) {
    super();
    if (name[0] === "!") this.name = name.slice(1);
    this.name = this.name.toUpperCase();
    // console.log("name:", name);
    // console.log("name.slice(1):", name.slice(1));
    // console.log("this.name:", this.name);
  }

  toggle = async () => {
    // console.log("CALLED TOGGLE");
    // console.log("this.name:", this.name);
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
    // console.log("CALLED ISENABLED");
    // console.log("this.name:", this.name);
    let component = await this.getComponent();
    if (component === null) component = await this.createComponent();

    return component.enabled;
  };

  createComponent = () => {
    // console.log("CALLED CREATE");
    // console.log("this.name:", this.name);
    const isSupported = this.name in ComponentsSupport;
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
}
