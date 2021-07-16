import { PrismaClient } from ".prisma/client";

interface User {
  name: string;
}

export const createUser = async (name: string) => {
  const prisma = new PrismaClient();
  await prisma.user.create({
    data: {
      name,
    },
  });
};
