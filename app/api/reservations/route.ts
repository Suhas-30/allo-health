import { reservationController } from "@/src/reservation/reservation.controller"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  return reservationController.create(req)
}