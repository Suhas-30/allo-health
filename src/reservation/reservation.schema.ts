import { z } from "zod"

export const createReservationSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  warehouseId: z.string().uuid("Invalid warehouse ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
})

export type CreateReservationInput = z.infer<typeof createReservationSchema>