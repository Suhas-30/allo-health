import { Badge } from "@/components/ui/badge"

interface StockBadgeProps {
  availableUnits: number
}

export function StockBadge({ availableUnits }: StockBadgeProps) {
  if (availableUnits === 0) {
    return <Badge variant="destructive">Out of stock</Badge>
  }

  if (availableUnits <= 3) {
    return (
      <Badge className="bg-orange-500 hover:bg-orange-600">
        Only {availableUnits} left!
      </Badge>
    )
  }

  return (
    <Badge className="bg-green-500 hover:bg-green-600">
      {availableUnits} units available
    </Badge>
  )
}