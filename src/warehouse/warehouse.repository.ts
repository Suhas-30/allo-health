import { prisma } from "@/lib/prisma"

export const warehouseRepository = {
  findAll: async () => {
    return await prisma.warehouse.findMany({
      include: {
        stocks: {
          include: {
            product: true,
          },
        },
      },
    })
  },

  findById: async (id: string) => {
    return await prisma.warehouse.findUnique({
      where: { id },
    })
  },
}