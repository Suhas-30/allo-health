
export type WarehouseResponse = {
  id: string
  name: string
  location: string
}


export type StockResponse = {
  stockId: string
  warehouseId: string
  warehouseName: string
  location: string
  totalUnits: number
  availableUnits: number
}


export type ProductResponse = {
  id: string
  name: string
  description: string
  price: number
  warehouses: StockResponse[]
}


export type ReservationStatus = "PENDING" | "CONFIRMED" | "RELEASED"

export type ReservationResponse = {
  id: string
  productId: string
  warehouseId: string
  stockId: string
  quantity: number
  status: ReservationStatus
  expiresAt: string
  createdAt: string
}


export type CreateReservationRequest = {
  productId: string
  warehouseId: string
  quantity: number
}

// API Error types
export type ApiError = {
  error: string
  code?: string
}