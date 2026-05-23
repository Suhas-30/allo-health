import { NextRequest, NextResponse } from "next/server"
import { reservationService } from "./reservation.service"
import { createReservationSchema } from "./reservation.schema"

export const reservationController = {

  create: async (req: NextRequest) => {
    try {
      // 1. Parse and validate request body
      const body = await req.json()
      const validation = createReservationSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.flatten().fieldErrors },
          { status: 400 }
        )
      }

      // 2. Call service
      const reservation = await reservationService.createReservation(
        validation.data
      )

      return NextResponse.json(reservation, { status: 201 })

    } catch (error: any) {
      console.error("Error creating reservation:", error)

      if (error.code === "INSUFFICIENT_STOCK") {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }

      if (error.code === "NOT_FOUND") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }

      if (error.code === "CONFLICT") {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Failed to create reservation" },
        { status: 500 }
      )
    }
  },

  confirm: async (
    _req: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    try {
      const reservation = await reservationService.confirmReservation(
        params.id
      )
      return NextResponse.json(reservation)

    } catch (error: any) {
      console.error("Error confirming reservation:", error)

      if (error.code === "NOT_FOUND") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }

      if (error.code === "EXPIRED") {
        return NextResponse.json(
          { error: error.message },
          { status: 410 }
        )
      }

      if (error.code === "CONFLICT") {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Failed to confirm reservation" },
        { status: 500 }
      )
    }
  },

  release: async (
    _req: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    try {
      const reservation = await reservationService.releaseReservation(
        params.id
      )
      return NextResponse.json(reservation)

    } catch (error: any) {
      console.error("Error releasing reservation:", error)

      if (error.code === "NOT_FOUND") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }

      if (error.code === "CONFLICT") {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Failed to release reservation" },
        { status: 500 }
      )
    }
  },
}