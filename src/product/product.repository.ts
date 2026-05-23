import { prisma } from "@/lib/prisma"

export const productRepository = {
  findAllWithStock: async () => {
    return await prisma.product.findMany({
      include: {
        stocks: {
          include: {
            warehouse: true,
          },
        },
      },
    })
  },

  findById: async (id: string) => {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        stocks: {
          include: {
            warehouse: true,
          },
        },
      },
    })
  },
}