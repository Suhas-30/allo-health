import { NextRequest, NextResponse } from "next/server"
import { productService } from "./product.service"

export const productController = {
  getAll: async (_req: NextRequest) => {
    try {
      const products = await productService.getAllProducts()
      return NextResponse.json(products)
    } catch (error: any) {
      console.error("Error fetching products:", error)
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      )
    }
  },
}