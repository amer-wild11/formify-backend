import prisma from "~/lib/prisma";

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
