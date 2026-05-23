import { warehouseRepository } from "./warehouse.repository"
import { WarehouseResponse } from "@/src/types"

type WarehouseWithStock = Awaited<ReturnType<typeof warehouseRepository.findAll>>[0]

export const warehouseService = {
  getAllWarehouses: async (): Promise<WarehouseResponse[]> => {
    const warehouses = await warehouseRepository.findAll()

    return warehouses.map((warehouse: WarehouseWithStock) => ({
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
    }))
  },
}