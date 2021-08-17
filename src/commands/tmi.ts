import { JsonArrayFile } from "../models/JsonArrayFile";
import { UserPrisma } from "../models/database/user";
import { CommandPrisma } from "../models/database/command";
import { Command, User } from "@prisma/client";

export const createUser = async (
  channel: string,
  username: string | undefined
): Promise<string> => {
  try {
    if (channel !== process.env.TWITCH_USERNAME) {
      throw new Error("Wrong channel");
    }
    if (!username) {
      throw new Error("User not found");
    }
    const user = new UserPrisma(username);
    const newPrismaUser = await user.addUser();

    if (newPrismaUser) {
      const jsonUser = new JsonArrayFile<string>(newPrismaUser.name);
      jsonUser.add();
    }
    return `I have joined channel: ${newPrismaUser.name}`;
  } catch (error) {
    return "Something went wrong. I couldn't join your channel";
  }
};

export const removeUser = async (
  username: string | undefined
): Promise<string> => {
  try {
    if (!username) {
      throw new Error("User not found");
    }
    const user = new UserPrisma(username);
    const removedUser = await user.removeUser();
    if (removedUser) {
      const jsonUser = new JsonArrayFile<string>(removedUser.name);
      jsonUser.remove();
    }
    return `I have left channel: ${removeUser.name}`;
  } catch (error) {
    return "Problem leaving channel";
  }
};

export const newCommand = async (
  streamer: string,
  messageArray: string[],
  creator: string | undefined
): Promise<string> => {
  try {
    // const asdf = new UserPrisma("habbe");
    // await asdf.addUser();
    if (!creator) throw new Error("Creator not specified");
    const commandName = messageArray[0];
    console.log("~ commandName", commandName);
    const commandContent = messageArray.slice(1).join("");
    console.log("~ commandContent", commandContent);
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.getUser();
    console.log("~ user", user);
    const newCommand = new CommandPrisma(user);
    const command = await newCommand.add(commandName, commandContent, creator);
    return `Command ${command.name} created`;
  } catch (error) {
    console.log("error.message:", error.message);
    return "Couldn't create command";
  }
};

export const isUserCustomCommand = async (
  streamer: string,
  targetCommand: string
): Promise<Command | undefined> => {
  const userPrisma = new UserPrisma(streamer);
  const user: User = await userPrisma.getUser();
  const command = new CommandPrisma(user);
  const commands = await command.findAll();
  const isCommand = commands.find(
    (command: Command) => command.name === targetCommand
  );

  return isCommand;
};
