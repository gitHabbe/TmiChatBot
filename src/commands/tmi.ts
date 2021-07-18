import { PrismaClient } from "@prisma/client";
import { JsonFile } from "../models/database";
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
  console.log("creating user");

  const prisma = new PrismaClient();
  const user: User = await prisma.user.create({
    data: { name: username },
  });

  if (user) {
    const newUser = new JsonFile<string>();
    newUser.add(user.name);

    return `I have joined channel: ${user.name}`;
  }

  return "Something went wrong. I couldn't join your channel";
};
