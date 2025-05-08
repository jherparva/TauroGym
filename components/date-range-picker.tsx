"use client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

interface DatePickerWithRangeProps {
  className?: string
  date: DateRange
  setDate: (date: DateRange) => void
}

export function DatePickerWithRange({ className, date, setDate }: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: es })} - {format(date.to, "dd/MM/yyyy", { locale: es })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface DateRangePickerProps {
  className?: string
  dateRange: {
    from: Date
    to: Date
  }
  setDateRange: (dateRange: {
    from: Date
    to: Date
  }) => void
  onApply?: () => void
}

export function DateRangePicker({ className, dateRange, setDateRange, onApply }: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="p-3">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange.from}
          selected={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onSelect={(selected) => {
            if (selected?.from && selected?.to) {
              setDateRange({
                from: selected.from,
                to: selected.to,
              })
            }
          }}
          numberOfMonths={2}
          locale={es}
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={onApply}>Aplicar</Button>
        </div>
      </div>
    </div>
  )
}
