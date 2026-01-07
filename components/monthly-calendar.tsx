'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type CalendarData } from '@/lib/api'

interface MonthlyCalendarProps {
  data: CalendarData[]
  currentDate: Date
  onMonthChange: (date: Date) => void
  onDateClick: (date: CalendarData) => void
}

export function MonthlyCalendar({ data, currentDate, onMonthChange, onDateClick }: MonthlyCalendarProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const getDateData = (day: number) => {
    const padded = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const unpadded = `${year}-${month + 1}-${day}`
    return data.find(d => d.date === padded || d.date === unpadded)
  }

  const getStatusColor = (dateData: CalendarData | undefined) => {
    const status = dateData?.availability === 'available' ? 'green' : 'red'
    // Check both flat 'remaining' (from legacy/update) and nested 'capacity.remaining' (from standard API)
    const remaining = dateData?.capacityRemaining ?? dateData?.remaining ?? dateData?.capacity?.remaining

    if (!dateData || status !== 'green') return 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
    if (remaining === 0) return 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
    if (remaining !== undefined && remaining < 100) return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300'
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
  }

  const previousMonth = () => {
    onMonthChange(new Date(year, month - 1))
  }

  const nextMonth = () => {
    onMonthChange(new Date(year, month + 1))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const dateData = getDateData(day)
          const status = getStatusColor(dateData)
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

          return (
            <button
              key={day}
              onClick={() => {
                 if (dateData) {
                    onDateClick(dateData)
                 } else {
                     // If no data exists for this date (e.g., past/future outside range),
                     // we might still want to open it or at least handle the click.
                     // For now, let's construct a dummy object or just ignore.
                     // But better UX is to allow editing if it's a valid date.
                     const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                     onDateClick({
                         date: dateStr,
                         price: 0,
                         availability: 'available',
                         manualOverride: false,
                         capacity: { total: 0, remaining: 0 },
                         remaining: 0,
                         bookingsCount: 0,
                         alerts: [],
                         total: 0,
                         status: 'green'
                     })
                 }
              }}
              className={cn(
                'aspect-square border-2 rounded-lg p-1 sm:p-2 transition-all hover:scale-105 hover:shadow-lg',
                status,
                isToday && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <div className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">{day}</div>
              {dateData && (
                <>
                  <div className="text-[10px] sm:text-xs font-semibold">£{dateData.price}</div>
                  <div className="text-[10px] sm:text-xs hidden sm:block">
                    {dateData.capacityRemaining ?? dateData.remaining} left
                  </div>
                </>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-6 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-500/20 border border-yellow-500/30" />
          <span className="text-muted-foreground">Limited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-500/20 border border-red-500/30" />
          <span className="text-muted-foreground">Full/Closed</span>
        </div>
      </div>
    </div>
  )
}
