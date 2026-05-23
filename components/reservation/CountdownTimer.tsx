"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  expiresAt: string
  onExpire?: () => void
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      return Math.max(0, diff)
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      if (remaining === 0) {
        clearInterval(timer)
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpire])

  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const isUrgent = timeLeft < 60000

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-1">Reservation expires in</p>
      <p className={`text-4xl font-bold ${isUrgent ? "text-red-500" : "text-green-500"}`}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </p>
      {isUrgent && (
        <p className="text-red-500 text-sm mt-1 font-medium">
          Hurry! Your reservation is about to expire.
        </p>
      )}
    </div>
  )
}