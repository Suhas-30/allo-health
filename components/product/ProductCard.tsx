"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProductResponse } from "@/src/types"
import { api } from "@/lib/api"
import { StockBadge } from "./StockBadge"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ProductCardProps {
  product: ProductResponse
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReserve = async (
    warehouseId: string,
    stockId: string
  ) => {
    setLoading(stockId)
    setError(null)

    try {
      const reservation = await api.createReservation(
        product.id,
        warehouseId,
        1
      )
      router.push(`/reservation/${reservation.id}`)

    } catch (err: any) {
      if (err.status === 409) {
        setError("Not enough stock available. Someone else may have reserved it.")
      } else {
        setError(err.message || "Something went wrong. Please try again.")
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
        <p className="text-xl font-bold text-primary">
          ₹{Number(product.price).toLocaleString()}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {error && <ErrorMessage message={error} />}

        <p className="text-sm font-medium text-gray-500">
          Available at warehouses:
        </p>

        {product.warehouses.map((warehouse) => (
          <div
            key={warehouse.stockId}
            className="flex items-center justify-between border rounded-lg p-3 gap-2"
          >
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm">{warehouse.warehouseName}</p>
              <p className="text-xs text-gray-400">{warehouse.location}</p>
              <StockBadge availableUnits={warehouse.availableUnits} />
            </div>

            <Button
              size="sm"
              disabled={
                warehouse.availableUnits === 0 ||
                loading === warehouse.stockId
              }
              onClick={() =>
                handleReserve(warehouse.warehouseId, warehouse.stockId)
              }
            >
              {loading === warehouse.stockId ? "Reserving..." : "Reserve"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}