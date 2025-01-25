import prisma from "~/lib/prisma";

export const createPdfFile = async (data: any) => {
  const file = await prisma.pdfFile.create({ data });
  return file;
};

export const getPdfByUserId = async (id: any) => {
  const file = await prisma.pdfFile.findFirst({
    where: {
      userId: id,
    },
  });
  return file;
};
