import { redis } from "@/lib/redis"
import { reservationRepository } from "./reservation.repository"
import { CreateReservationInput } from "./reservation.schema"
import { ReservationResponse } from "@/src/types"
import { logger } from "@/lib/logger"

const RESERVATION_EXPIRY_MINUTES = 10

export const reservationService = {

  createReservation: async (
    input: CreateReservationInput
  ): Promise<ReservationResponse> => {
    const { productId, warehouseId, quantity } = input
    logger.info("Creating reservation", { productId, warehouseId, quantity })

    // 1. Acquire Redis lock
    const lockKey = `lock:${productId}:${warehouseId}`
    const lock = await redis.set(lockKey, "locked", {
      nx: true,
      ex: 10,
    })

    // 2. If lock not acquired → another request is processing
    if (!lock) {
      logger.warn("Lock not acquired — another request is processing", { lockKey })
      throw { code: "CONFLICT", message: "Too many requests, try again" }
    }

    logger.info("Lock acquired", { lockKey })

    try {
      // 3. Find stock
      const stock = await reservationRepository
        .findStockByProductAndWarehouse(productId, warehouseId)

      if (!stock) {
        logger.warn("Stock not found", { productId, warehouseId })
        throw { code: "NOT_FOUND", message: "Stock not found" }
      }

      // 4. Check available stock
      const available = stock.totalUnits - stock.reservedUnits
      logger.info("Stock check", { available, requested: quantity })

      if (available < quantity) {
        logger.warn("Insufficient stock", { available, requested: quantity })
        throw { code: "INSUFFICIENT_STOCK", message: "Not enough stock available" }
      }

      // 5. Increment reservedUnits
      await reservationRepository.incrementReservedUnits(stock.id, quantity)
      logger.info("Reserved units incremented", { stockId: stock.id, quantity })

      // 6. Create reservation with expiry
      const expiresAt = new Date(
        Date.now() + RESERVATION_EXPIRY_MINUTES * 60 * 1000
      )
      const reservation = await reservationRepository.createReservation(
        stock.id,
        quantity,
        expiresAt
      )

      logger.info("Reservation created successfully", {
        reservationId: reservation.id,
        expiresAt,
      })

      return {
        id: reservation.id,
        productId,
        warehouseId,
        stockId: stock.id,
        quantity: reservation.quantity,
        status: reservation.status as "PENDING",
        expiresAt: reservation.expiresAt.toISOString(),
        createdAt: reservation.createdAt.toISOString(),
      }

    } finally {
      // 7. Always release lock
      await redis.del(lockKey)
      logger.info("Lock released", { lockKey })
    }
  },

  confirmReservation: async (id: string): Promise<ReservationResponse> => {
    logger.info("Confirming reservation", { id })
    const reservation = await reservationRepository.findById(id)

    if (!reservation) {
      logger.warn("Reservation not found", { id })
      throw { code: "NOT_FOUND", message: "Reservation not found" }
    }

    if (reservation.status !== "PENDING") {
      logger.warn("Reservation is not pending", { id, status: reservation.status })
      throw { code: "CONFLICT", message: `Reservation is already ${reservation.status}` }
    }

    if (new Date() > reservation.expiresAt) {
      logger.warn("Reservation expired", { id, expiresAt: reservation.expiresAt })
      throw { code: "EXPIRED", message: "Reservation has expired" }
    }

    await reservationRepository.confirmReservation(
      id,
      reservation.stockId,
      reservation.quantity
    )

    logger.info("Reservation confirmed successfully", { id })

    return {
      id: reservation.id,
      productId: reservation.stock.productId,
      warehouseId: reservation.stock.warehouseId,
      stockId: reservation.stockId,
      quantity: reservation.quantity,
      status: "CONFIRMED",
      expiresAt: reservation.expiresAt.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
    }
  },

  releaseReservation: async (id: string): Promise<ReservationResponse> => {
    logger.info("Releasing reservation", { id })
    const reservation = await reservationRepository.findById(id)

    if (!reservation) {
      logger.warn("Reservation not found", { id })
      throw { code: "NOT_FOUND", message: "Reservation not found" }
    }

    if (reservation.status !== "PENDING") {
      logger.warn("Reservation is not pending", { id, status: reservation.status })
      throw { code: "CONFLICT", message: `Reservation is already ${reservation.status}` }
    }

    await reservationRepository.releaseReservation(
      id,
      reservation.stockId,
      reservation.quantity
    )

    logger.info("Reservation released successfully", { id })

    return {
      id: reservation.id,
      productId: reservation.stock.productId,
      warehouseId: reservation.stock.warehouseId,
      stockId: reservation.stockId,
      quantity: reservation.quantity,
      status: "RELEASED",
      expiresAt: reservation.expiresAt.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
    }
  },

  releaseExpiredReservations: async (): Promise<number> => {
    logger.info("Checking for expired reservations")
    const expired = await reservationRepository.findExpiredReservations()
    logger.info(`Found ${expired.length} expired reservations`)

    for (const reservation of expired) {
      await reservationRepository.releaseReservation(
        reservation.id,
        reservation.stockId,
        reservation.quantity
      )
      logger.info("Expired reservation released", { id: reservation.id })
    }

    logger.info("Expiry cleanup complete", { released: expired.length })
    return expired.length
  },
}