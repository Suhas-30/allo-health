import { ProductList } from "@/components/product/ProductList"
import { api } from "@/lib/api"

export default async function Home() {
  const products = await api.getProducts()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Allo Inventory</h1>
        <p className="text-gray-500 mt-1">
          Reserve products from your nearest warehouse
        </p>
      </div>
      <ProductList products={products} />
    </main>
  )
}