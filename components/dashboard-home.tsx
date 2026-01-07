'use client'

import { useState, useEffect } from 'react'
import { MonthlyCalendar } from '@/components/monthly-calendar'
import { DateDrawer } from '@/components/date-drawer'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DollarSign, ParkingSquare, TrendingUp, Loader2 } from 'lucide-react'
import { api, type CalendarData } from '@/lib/api'
import { toast } from 'react-toastify'

export function DashboardHome() {
  const [selectedDate, setSelectedDate] = useState<CalendarData | null>(null)
  const [data, setData] = useState<CalendarData[]>([])
  const [quickPrice, setQuickPrice] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1 // API expects 1-12
      const data = await api.getCalendar(year, month)
      setData(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentDate])

  const today = new Date().toISOString().split('T')[0]
  // Note: 'data' contains the current month's data. If today is in current month, we find it.
  const todayData = data.find(d => d.date === today)

  const handleDateClick = (dateData: CalendarData) => {
    setSelectedDate(dateData)
  }

  const handleUpdateDate = async (updatedDate: CalendarData) => {
    // Optimistic update
    setData(prev => prev.map(d => d.date === updatedDate.date ? updatedDate : d))
    setSelectedDate(updatedDate)

    // In a real app, the drawer/components should call the API update methods.
    // However, if DateDrawer calls the API, we might just re-fetch or rely on the passed callback.
    // For now, let's assume DateDrawer handles the API call internally or we do it here.
    // Looking at the task list, "Implement Pricing, Availability... Updates" is next.
    // We will ensure DateDrawer is wired up then.
  }

  const handleQuickPriceUpdate = async () => {
    if (todayData && quickPrice) {
      const price = parseFloat(quickPrice)
      if (isNaN(price)) return

      const loadingToast = toast.loading('Updating price...')
      try {
        await api.updatePrice(todayData.date, price)
        toast.success('Price updated')

        // Update local state
        const updatedToday = { ...todayData, price }
        handleUpdateDate(updatedToday)
        setQuickPrice('')
      } catch (error) {
        console.error(error)
        toast.error('Failed to update price')
      } finally {
        toast.dismiss(loadingToast)
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Parking Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage daily operations and pricing</p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <Card className="p-6 bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Today's Price</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                £{todayData?.price || 0}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Spaces Remaining</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {todayData?.capacityRemaining ?? todayData?.remaining ?? 0}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <ParkingSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Quick Price Update</p>
              <p className="text-xs text-muted-foreground">Update today's price</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter price"
              value={quickPrice}
              onChange={(e) => setQuickPrice(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleQuickPriceUpdate} disabled={!quickPrice}>
              Update
            </Button>
          </div>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="p-4 sm:p-6 overflow-x-auto relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <MonthlyCalendar
          data={data}
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          onDateClick={handleDateClick}
        />
      </Card>

      {/* Date Editor Drawer */}
      {selectedDate && (
        <DateDrawer
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onUpdate={handleUpdateDate}
        />
      )}
    </div>
  )
}
