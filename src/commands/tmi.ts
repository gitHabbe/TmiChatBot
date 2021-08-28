import { ChatUserstate } from "tmi.js";
import { Command, User } from "@prisma/client";
import { JsonStringArray } from "../models/JsonArrayFile";
import { UserPrisma } from "../models/database/user";
import { CommandPrisma } from "../models/database/command";
import { TrustPrisma } from "../models/database/trust";
import { fetchStreamer, fetchStreamerVideos } from "./twitch";
import { TimestampPrisma } from "../models/database/timestamp";
import { IStreamer, IVideo } from "../interfaces/twitch";

export const createUser = async (
  channel: string,
  userstate: ChatUserstate
): Promise<string> => {
  try {
    const botName = process.env.TWITCH_USERNAME;
    if (channel !== botName) {
      throw new Error(`!join can only works in ${botName}'s channel`);
    }
    if (!userstate.username) {
      throw new Error("User not found");
    }
    const user = new UserPrisma(userstate.username);
    const newPrismaUser = await user.add();

    if (newPrismaUser) {
      const jsonUser = new JsonStringArray();
      jsonUser.add(newPrismaUser.name);
    }
    return `I have joined channel: ${newPrismaUser.name}`;
  } catch (error) {
    return "Something went wrong. I couldn't join your channel";
  }
};

export const removeUser = async (userstate: ChatUserstate): Promise<string> => {
  try {
    if (!userstate.username) {
      throw new Error("User not found");
    }
    const user = new UserPrisma(userstate.username);
    const removedUser = await user.remove();
    if (removedUser) {
      const jsonUser = new JsonStringArray();
      jsonUser.remove(removedUser.name);
    }
    return `I have left channel: ${removeUser.name}`;
  } catch (error) {
    return "Problem leaving channel";
  }
};

export const newCommand = async (
  streamer: string,
  messageArray: string[],
  madeBy: ChatUserstate
): Promise<string> => {
  try {
    if (!madeBy.username) throw new Error("Creator not specified");
    const isTrusted = await isTrustedUser(streamer, madeBy);
    if (!isTrusted) throw new Error(`${madeBy} not allowed to do that`);
    const commandName = messageArray[0];
    const commandContent = messageArray.slice(1).join("");
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.find();
    const newCommand = new CommandPrisma(user);
    const command = await newCommand.add(
      commandName,
      commandContent,
      madeBy.username
    );
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
  const user: User = await userPrisma.find();
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
  madeBy: ChatUserstate
): Promise<string> => {
  try {
    if (!madeBy.username) throw new Error("Creator not specified");
    const isTrusted = await isTrustedUser(streamer, madeBy);
    if (!isTrusted) throw new Error(`${madeBy} not allowed to remove command`);
    const commandName = messageArray[0];
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.find();
    const command = new CommandPrisma(user);
    const delCommand = await command.remove(commandName);

    return `Command ${delCommand.name} deleted`;
  } catch (error) {
    return "Couldn't remove command";
  }
};

export const isTrustedUser = async (
  streamer: string,
  madeBy: ChatUserstate
) => {
  const userPrisma = new UserPrisma(streamer);
  const user: User = await userPrisma.find();
  const trust = new TrustPrisma(user);
  return trust.isTrusted(madeBy);
};

export const addUserTrust = async (
  streamer: string,
  messageArray: string[],
  madeBy: ChatUserstate
) => {
  try {
    if (!madeBy.username) throw new Error("Creator not specified");
    const newTrust = messageArray[0];
    if (!newTrust) throw new Error("No user specified");
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.find();
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
  madeBy: ChatUserstate
) => {
  try {
    if (!madeBy.username) throw new Error("Creator not specified");
    const deleteTrust = messageArray[0];
    if (!deleteTrust) throw new Error("No user specified");
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.find();
    const trust = new TrustPrisma(user);
    const removeTrust = await trust.remove(deleteTrust, madeBy);
    return `${removeTrust.name} removed from trust-list`;
  } catch (error) {
    if (error.message) return error.message;
    return "Problem removing trust";
  }
};

export const addTimestamp = async (
  streamer: string,
  messageArray: string[],
  madeBy: ChatUserstate
) => {
  try {
    if (!madeBy.username) throw new Error("Creator not specified");
    const isTrusted = await isTrustedUser(streamer, madeBy);
    if (!isTrusted)
      throw new Error(`${madeBy.username} not allowed to create timestamps`);
    const timestampName: string = messageArray[0];
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.find();
    const { id, started_at }: IStreamer = await fetchStreamer(streamer);
    const videos: IVideo[] = await fetchStreamerVideos(parseInt(id));
    const timestamp = new TimestampPrisma(user);
    const newTimestamp = await timestamp.add(
      videos[0],
      timestampName,
      madeBy.username
    );
    return `Timestamp ${newTimestamp.name} created. Use !findts ${newTimestamp.name} to watch it`;
  } catch (error) {
    if (error.message) return error.message;
    return "Problem creating timestamp";
  }
};

export const findTimestamp = async (
  streamer: string,
  messageArray: string[]
) => {
  try {
    const timestampName: string = messageArray[0];
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.find();
    const timestampObj = new TimestampPrisma(user);
    const foundTimestamp = await timestampObj.find(timestampName);
    const backtrackLength = 90;
    const { name, url, timestamp } = foundTimestamp;
    return `${name}: ${url}?t=${timestamp - backtrackLength}s`;
  } catch (error) {
    if (error.message) return error.message;
    return "Problem deleteing timestamp";
  }
};

export const removeTimestamp = async (
  streamer: string,
  messageArray: string[],
  madeBy: ChatUserstate
) => {
  try {
    if (!madeBy.username) throw new Error("Creator not specified");
    const isTrusted = await isTrustedUser(streamer, madeBy);
    if (!isTrusted)
      throw new Error(`${madeBy.username} not allowed to delete timestamps`);
    const timestampName: string = messageArray[0];
    const userPrisma = new UserPrisma(streamer);
    const user: User = await userPrisma.find();
    const timestamp = new TimestampPrisma(user);
    const deleteTimestamp = await timestamp.remove(timestampName);
    return `Timestamp ${deleteTimestamp.name}`;
  } catch (error) {
    if (error.message) return error.message;
    return "Problem deleteing timestamp";
  }
};
