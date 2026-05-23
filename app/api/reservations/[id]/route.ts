import { NextRequest, NextResponse } from "next/server"
import { reservationRepository } from "@/src/reservation/reservation.repository"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reservation = await reservationRepository.findById(id)

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json(
      { error: "Failed to fetch reservation" },
      { status: 500 }
    )
  }
}