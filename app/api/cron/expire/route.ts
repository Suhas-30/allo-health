import { reservationService } from "@/src/reservation/reservation.service"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const released = await reservationService.releaseExpiredReservations()
    return NextResponse.json({
      message: `Released ${released} expired reservations`,
    })
  } catch (error) {
    console.error("Error releasing expired reservations:", error)
    return NextResponse.json(
      { error: "Failed to release expired reservations" },
      { status: 500 }
    )
  }
}