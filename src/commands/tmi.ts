import { JsonArrayFile } from "../models/JsonArrayFile";
import { UserPrisma } from "../models/database/user";
import { CommandPrisma } from "../models/database/command";
import { Command, User } from "@prisma/client";
import { TrustPrisma } from "../models/database/trust";

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
  madeBy: string | undefined
): Promise<string> => {
  try {
    if (!madeBy) throw new Error("Creator not specified");
    const isTrusted = await isTrustedUser(streamer, madeBy);
    if (!isTrusted) throw new Error(`${madeBy} not allowed to do that`);
    const commandName = messageArray[0];
    const commandContent = messageArray.slice(1).join("");
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.getUser();
    const newCommand = new CommandPrisma(user);
    const command = await newCommand.add(commandName, commandContent, madeBy);
    return `Command ${command.name} created`;
  } catch (error) {
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

export const removeCommand = async (
  streamer: string,
  messageArray: string[],
  madeBy: string | undefined
): Promise<string> => {
  try {
    if (!madeBy) throw new Error("Creator not specified");
    const isTrusted = await isTrustedUser(streamer, madeBy);
    if (!isTrusted) throw new Error(`${madeBy} not allowed to do that`);
    const commandName = messageArray[0];
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.getUser();
    const command = new CommandPrisma(user);
    const delCommand = await command.remove(commandName);

    return `Command ${delCommand.name} deleted`;
  } catch (error) {
    return "Couldn't remove command";
  }
};

export const isTrustedUser = async (streamer: string, madeBy: string) => {
  const userPrisma = new UserPrisma(streamer);
  const user: User = await userPrisma.getUser();
  const trust = new TrustPrisma(user);
  return trust.isTrusted(madeBy);
};

export const addUserTrust = async (
  streamer: string,
  messageArray: string[],
  madeBy: string | undefined
) => {
  try {
    if (!madeBy) throw new Error("Creator not specified");
    const newTrust = messageArray[0];
    if (!newTrust) throw new Error("No user specified");
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.getUser();
    const trust = new TrustPrisma(user);
    const addTrust = await trust.add(newTrust, madeBy);
    return `${addTrust.name} added to trust-list`;
  } catch (error) {
    if (error.message) return error.message;
    return "Problem creating trust";
  }
};

export const removeUserTrust = async (
  streamer: string,
  messageArray: string[],
  madeBy: string | undefined
) => {
  try {
    if (!madeBy) throw new Error("Creator not specified");
    const deleteTrust = messageArray[0];
    if (!deleteTrust) throw new Error("No user specified");
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.getUser();
    const trust = new TrustPrisma(user);
    const removeTrust = await trust.remove(deleteTrust);
    return `${removeTrust.name} removed from trust-list`;
  } catch (error) {
    if (error.message) return error.message;
    return "Problem creating trust";
  }
};
