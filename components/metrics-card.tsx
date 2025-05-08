"use client"

import { Card, CardContent } from "./ui/card"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string
  change?: {
    value: string
    percentage: string
    isPositive: boolean
  }
}

export function MetricsCard({ title, value, change }: MetricsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div
                className={`flex items-center text-xs font-medium ${
                  change.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {change.isPositive ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4" />
                )}
                <span>{change.percentage}</span>
              </div>
            )}
          </div>
          {change && <p className="text-xs text-muted-foreground">{change.value} desde el último período</p>}
        </div>
      </CardContent>
    </Card>
  )
}
