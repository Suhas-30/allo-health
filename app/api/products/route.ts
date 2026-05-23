import { productController } from "@/src/product/product.controller"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  return productController.getAll(req)
}