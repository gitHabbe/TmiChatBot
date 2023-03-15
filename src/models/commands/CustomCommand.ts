import { Command } from "@prisma/client";
import { UserPrisma } from "../database/UserPrisma";
import { CommandPrisma } from "../database/CommandPrisma";
import { ICommand } from "../../interfaces/Command";
import { MessageData } from "../tmi/MessageData";
import { ModuleFamily } from "../../interfaces/tmi"

export class CustomCommand implements ICommand {
  moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

  constructor(public messageData: MessageData) {}

  private async allCommands(user: any): Promise<Command[]> {
    const command = new CommandPrisma(user);
    return await command.findAll();
  };

  async isCustomCommand(streamer: string, targetCommand: string): Promise<Command | undefined> {
    const userPrisma = new UserPrisma(streamer);
    const user = await userPrisma.get();
    if (!user) throw new Error(`User not found`);
    const commands = await this.allCommands(user);
    return commands.find((command: Command) => command.name === targetCommand);
  }

  async run(): Promise<MessageData> {
    const { message, channel } = this.messageData;
    const chatterCommand: string = message.split(" ")[0];
    const isCommand = await this.isCustomCommand(channel, chatterCommand);
    if (!isCommand) throw new Error("User command does not exist")
    this.messageData.response = isCommand.content

    return this.messageData
  }
}
