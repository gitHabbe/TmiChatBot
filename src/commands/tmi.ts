import { JsonArrayFile } from "../models/JsonArrayFile";
import { User } from "../models/database/user";
// import { User } from "../interfaces/prisma";

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
  const user = new User(username);
  const newPrismaUser = await user.addUser();

  if (newPrismaUser) {
    const newUser = new JsonArrayFile<string>(newPrismaUser.name);
    newUser.add();

    return `I have joined channel: ${newPrismaUser.name}`;
  }

  return "Something went wrong. I couldn't join your channel";
};
