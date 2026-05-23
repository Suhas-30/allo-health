import { ReservationResponse } from "@/src/types"
import { Badge } from "@/components/ui/badge"

interface ReservationDetailsProps {
  reservation: ReservationResponse
}

const statusColors = {
  PENDING: "bg-yellow-500 hover:bg-yellow-600",
  CONFIRMED: "bg-green-500 hover:bg-green-600",
  RELEASED: "bg-gray-500 hover:bg-gray-600",
}

export function ReservationDetails({ reservation }: ReservationDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Status</p>
        <Badge className={statusColors[reservation.status]}>
          {reservation.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Reservation ID</p>
        <p className="text-sm font-mono">{reservation.id.slice(0, 8)}...</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Quantity</p>
        <p className="text-sm font-medium">{reservation.quantity} unit(s)</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Reserved at</p>
        <p className="text-sm font-medium">
          {new Date(reservation.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}