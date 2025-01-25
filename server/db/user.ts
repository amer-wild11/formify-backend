import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserById = async (id: any) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      files: true,
    },
  });
  return user;
};

export const createUser = async (data: any) => {
  const user = await prisma.user.create({ data });
  return user;
};

export const getUserByName = async (name: any) => {
  const user = await prisma.user.findFirst({
    where: { name },
  });
  return user;
};
