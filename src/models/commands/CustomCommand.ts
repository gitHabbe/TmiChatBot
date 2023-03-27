import { Command } from "@prisma/client";
import { UserPrisma } from "../database/UserPrisma";
import { CommandPrisma } from "../database/CommandPrisma";
import { ICommand } from "../../interfaces/Command";
import { MessageData } from "../tmi/MessageData";
import { ModuleFamily } from "../../interfaces/tmi"
import { JoinedUser } from "../../interfaces/prisma"

export class CustomCommand implements ICommand {
  moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

  constructor(public messageData: MessageData, private joinedUser: JoinedUser) {}

  isCustomCommand(): Command | undefined {
    const { message } = this.messageData
    const targetCommand: string = message.split(" ")[0];
    return this.joinedUser.commands.find(({ name }: Command) => name === targetCommand);
  }

  async run(): Promise<MessageData> {
    const isCommand = await this.isCustomCommand();
    if (!isCommand) { return this.messageData }

    this.messageData.response = isCommand.content
    return this.messageData
  }

}
