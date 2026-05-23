import { NextRequest, NextResponse } from "next/server"
import { warehouseService } from "./warehouse.service"

export const warehouseController = {
  getAll: async (_req: NextRequest) => {
    try {
      const warehouses = await warehouseService.getAllWarehouses()
      return NextResponse.json(warehouses)
    } catch (error: any) {
      console.error("Error fetching warehouses:", error)
      return NextResponse.json(
        { error: "Failed to fetch warehouses" },
        { status: 500 }
      )
    }
  },
}