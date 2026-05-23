import { ReservationDetails } from "@/components/reservation/ReservationDetails"
import { ReservationActions } from "@/components/reservation/ReservationActions"
import { CountdownTimer } from "@/components/reservation/CountdownTimer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { notFound } from "next/navigation"

interface ReservationPageProps {
  params: Promise<{ id: string }>
}

export default async function ReservationPage({
  params,
}: ReservationPageProps) {
  const { id } = await params

  let reservation
  try {
    reservation = await api.getReservation(id)
  } catch {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">Your Reservation</h1>

      <Card>
        <CardHeader>
          <CardTitle>Reservation Details</CardTitle>
          {reservation.status === "PENDING" && (
            <CountdownTimer expiresAt={reservation.expiresAt} />
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <ReservationDetails reservation={reservation} />
          <hr />
          <ReservationActions
            reservationId={reservation.id}
            status={reservation.status}
          />
        </CardContent>
      </Card>
    </main>
  )
}