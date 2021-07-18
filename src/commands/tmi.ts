import { PrismaClient } from "@prisma/client";
import { JsonUserFile } from "../models/database";
import { User } from "../interfaces/prisma";

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
  const prisma = new PrismaClient();
  const user: User = await prisma.user.create({
    data: { name: username },
  });

  if (user) {
    const newUser = new JsonUserFile<string>(user.name);
    newUser.add();

    return `I have joined channel: ${user.name}`;
  }

  return "Something went wrong. I couldn't join your channel";
};
