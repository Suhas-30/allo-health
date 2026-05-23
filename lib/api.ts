import { ProductResponse, ReservationResponse } from "@/src/types"

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "")

export const api = {
  // Fetches all products with stock info per warehouse
  getProducts: async (): Promise<ProductResponse[]> => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Failed to fetch products")
    return res.json()
  },

  // Fetches single reservation by id
  getReservation: async (id: string): Promise<ReservationResponse> => {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Failed to fetch reservation")
    return res.json()
  },

  // Creates a new reservation
  createReservation: async (
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<ReservationResponse> => {
    const res = await fetch(`${BASE_URL}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, warehouseId, quantity }),
    })
    const data = await res.json()
    if (!res.ok) throw { status: res.status, message: data.error }
    return data
  },

  // Confirms a reservation after payment
  confirmReservation: async (id: string): Promise<ReservationResponse> => {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}/confirm`, {
      method: "POST",
    })
    const data = await res.json()
    if (!res.ok) throw { status: res.status, message: data.error }
    return data
  },

  // Releases a reservation (cancel)
  releaseReservation: async (id: string): Promise<ReservationResponse> => {
    const res = await fetch(`${BASE_URL}/api/reservations/${id}/release`, {
      method: "POST",
    })
    const data = await res.json()
    if (!res.ok) throw { status: res.status, message: data.error }
    return data
  },
}