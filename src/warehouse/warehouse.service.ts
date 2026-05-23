import { warehouseRepository } from "./warehouse.repository"
import { WarehouseResponse } from "@/src/types"

export const warehouseService = {
  getAllWarehouses: async (): Promise<WarehouseResponse[]> => {
    const warehouses = await warehouseRepository.findAll()

    return warehouses.map((warehouse) => ({
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
    }))
  },
}