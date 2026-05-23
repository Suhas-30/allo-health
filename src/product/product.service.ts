import { productRepository } from "./product.repository"
import { ProductResponse } from "@/src/types"

export const productService = {
  getAllProducts: async (): Promise<ProductResponse[]> => {
    const products = await productRepository.findAllWithStock()

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      warehouses: product.stocks.map((stock) => ({
        stockId: stock.id,
        warehouseId: stock.warehouseId,
        warehouseName: stock.warehouse.name,
        location: stock.warehouse.location,
        totalUnits: stock.totalUnits,
        availableUnits: stock.totalUnits - stock.reservedUnits,
      })),
    }))
  },
}