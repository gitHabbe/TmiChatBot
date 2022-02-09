import {Client} from "tmi.js";
import {MessageData} from "../Tmi";
import {Command} from "@prisma/client";
import {UserModel} from "../database/UserPrisma";
import {CommandPrisma} from "../database/CommandPrisma";

export const isUserCustomCommand = async (
    streamer: string,
    targetCommand: string
): Promise<Command | undefined> => {
  const userPrisma = new UserModel(streamer);
  const user = await userPrisma.get();
  if (!user) throw new Error(`User not found`);
  const command = new CommandPrisma(user);
  const commands = await command.findAll();
  const isCommand = commands.find(
      (command: Command) => command.name === targetCommand
  );

  return isCommand;
};
export const callCustomCommand = async (
  tmiClient: Client,
  messageData: MessageData
): Promise<boolean> => {
  const { message, channel } = messageData;
  const chatterCommand: string = message.split(" ")[0];
  const isCommand = await isUserCustomCommand(channel, chatterCommand);
  if (isCommand) {
    tmiClient.say(channel, isCommand.content);
    return true;
  }

  return false;
};
