import { warehouseController } from "@/src/warehouse/warehouse.controller"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  return warehouseController.getAll(req)
}