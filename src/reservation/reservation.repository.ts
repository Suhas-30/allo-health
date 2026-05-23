import { prisma } from "@/lib/prisma"
import { ReservationStatus } from "@/src/types"

export const reservationRepository = {
  findById: async (id: string) => {
    return await prisma.reservation.findUnique({
      where: { id },
      include: {
        stock: {
          include: {
            product: true,
            warehouse: true,
          },
        },
      },
    })
  },

  findExpiredReservations: async () => {
    return await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
      include: {
        stock: true,
      },
    })
  },

  findStockByProductAndWarehouse: async (
    productId: string,
    warehouseId: string
  ) => {
    return await prisma.stock.findUnique({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
    })
  },

  createReservation: async (
    stockId: string,
    quantity: number,
    expiresAt: Date
  ) => {
    return await prisma.reservation.create({
      data: {
        stockId,
        quantity,
        status: "PENDING",
        expiresAt,
      },
    })
  },

  incrementReservedUnits: async (stockId: string, quantity: number) => {
    return await prisma.stock.update({
      where: { id: stockId },
      data: {
        reservedUnits: { increment: quantity },
      },
    })
  },

  decrementReservedUnits: async (stockId: string, quantity: number) => {
    return await prisma.stock.update({
      where: { id: stockId },
      data: {
        reservedUnits: { decrement: quantity },
      },
    })
  },

  confirmReservation: async (id: string, stockId: string, quantity: number) => {
    return await prisma.$transaction([
      prisma.stock.update({
        where: { id: stockId },
        data: {
          totalUnits: { decrement: quantity },
          reservedUnits: { decrement: quantity },
        },
      }),
      prisma.reservation.update({
        where: { id },
        data: { status: "CONFIRMED" },
      }),
    ])
  },

  releaseReservation: async (id: string, stockId: string, quantity: number) => {
    return await prisma.$transaction([
      prisma.stock.update({
        where: { id: stockId },
        data: {
          reservedUnits: { decrement: quantity },
        },
      }),
      prisma.reservation.update({
        where: { id },
        data: { status: "RELEASED" },
      }),
    ])
  },

  updateStatus: async (id: string, status: ReservationStatus) => {
    return await prisma.reservation.update({
      where: { id },
      data: { status },
    })
  },
}