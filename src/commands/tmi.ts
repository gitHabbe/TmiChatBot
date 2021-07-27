import { PrismaClient } from "@prisma/client";
import { JsonArrayFile } from "../models/database";
import { User } from "../interfaces/prisma";
import { UserDatabase } from "../models/database";

export const createUser = async (
  channel: string,
  username: string | undefined
): Promise<string> => {
  if (channel !== process.env.TWITCH_USERNAME) {
    throw new Error("Wrong channel");
  }
  if (!username) {
    throw new Error("User not found");
  }
  const user = new UserDatabase(username);
  const newPrismaUser: User | undefined = await user.addUser();

  if (newPrismaUser) {
    const newUser = new JsonArrayFile<string>(newPrismaUser.name);
    newUser.add();

    return `I have joined channel: ${newPrismaUser.name}`;
  }

  return "Something went wrong. I couldn't join your channel";
};
