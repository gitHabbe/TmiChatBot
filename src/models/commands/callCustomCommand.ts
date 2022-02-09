import { Command } from "@prisma/client";
import { UserModel } from "../database/UserPrisma";
import { CommandPrisma } from "../database/CommandPrisma";
import { MessageData } from "../MessageData";
import { ICommand } from "../../interfaces/Command";

export class CustomCommand implements ICommand {

  constructor(public messageData: MessageData) {}

  private allCommands = async (user: any): Promise<Command[]> => {
    const command = new CommandPrisma(user);
    const commands = await command.findAll();
    return commands;
  };

  isCustomCommand = async (
      streamer: string,
      targetCommand: string
  ): Promise<Command | undefined> => {
    const userPrisma = new UserModel(streamer);
    const user = await userPrisma.get();
    if (!user) throw new Error(`User not found`);
    const commands = await this.allCommands(user);
    return commands.find((command: Command) => command.name === targetCommand);
  }

  run = async (): Promise<string> => {
    const { message, channel } = this.messageData;
    const chatterCommand: string = message.split(" ")[0];
    const isCommand = await this.isCustomCommand(channel, chatterCommand);
    if (!isCommand) throw new Error("User command does not exist")

    return isCommand.content
  }
}
