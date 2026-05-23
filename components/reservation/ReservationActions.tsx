"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ErrorMessage } from "@/components/shared/ErrorMessage"

interface ReservationActionsProps {
  reservationId: string
  status: string
}

export function ReservationActions({
  reservationId,
  status,
}: ReservationActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<"confirm" | "cancel" | null>(null)
  const [error, setError] = useState<string | null>(null)

  // If already confirmed or released show message only
  if (status === "CONFIRMED") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-600 font-medium">
          ✅ Purchase confirmed! Thank you for your order.
        </p>
      </div>
    )
  }

  if (status === "RELEASED") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-600 font-medium">
          ❌ This reservation has been cancelled.
        </p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => router.push("/")}
        >
          Browse Products
        </Button>
      </div>
    )
  }

  const handleConfirm = async () => {
    setLoading("confirm")
    setError(null)

    try {
      await api.confirmReservation(reservationId)
      router.refresh()
    } catch (err: any) {
      if (err.status === 410) {
        setError("Reservation has expired. Please reserve again.")
      } else {
        setError(err.message || "Failed to confirm. Please try again.")
      }
    } finally {
      setLoading(null)
    }
  }

  const handleCancel = async () => {
    setLoading("cancel")
    setError(null)

    try {
      await api.releaseReservation(reservationId)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to cancel. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {error && <ErrorMessage message={error} />}

      <Button
        className="w-full"
        onClick={handleConfirm}
        disabled={loading !== null}
      >
        {loading === "confirm" ? "Confirming..." : "✅ Confirm Purchase"}
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleCancel}
        disabled={loading !== null}
      >
        {loading === "cancel" ? "Cancelling..." : "❌ Cancel Reservation"}
      </Button>
    </div>
  )
}