'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AlertTriangle, CheckCircle2, Save, Loader2 } from 'lucide-react'
import { api, type CalendarData } from '@/lib/api'
import { toast } from 'react-toastify'

export function AvailabilityCapacity() {
  const [totalSpaces, setTotalSpaces] = useState(475)
  const [data, setData] = useState<CalendarData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const today = new Date()
      // Fetching current month for now. Ideally should be paginate-able.
      const data = await api.getCalendar(today.getFullYear(), today.getMonth() + 1)
      setData(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load availability data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDate = async (date: string, status: 'available' | 'unavailable') => {
    // Optimistic
    setData(prev => prev.map(d => d.date === date ? { ...d, status } : d))
    try {
      await api.updateAvailability(date, status)
      toast.success(`Date ${status === 'available' ? 'available' : 'unavailable'}`)
    } catch (error) {
      toast.error('Update failed')
      // Revert?
    }
  }

  const handleCapacityChange = (date: string, capacity: number) => {
    setData(prev => prev.map(d => d.date === date ? { ...d, capacity: { ...d.capacity, total: capacity } } : d))
  }

  const saveCapacity = async (date: string, capacity: number) => {
    try {
      await api.updateCapacity(date, capacity)
      toast.success('Capacity updated')
    } catch (error) {
      toast.error('Update failed')
    }
  }

  const handleApplyGlobalCapacity = async () => {
    const loadingToast = toast.loading('Applying capacity to all loaded dates...')
    try {
      const promises = data.map(d => api.updateCapacity(d.date, totalSpaces))
      await Promise.all(promises)
      toast.success('Global capacity applied')
      // Refresh
      fetchData()
    } catch (error) {
      toast.error('Some updates failed')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Availability & Capacity</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage parking capacity and availability</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Global Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="total-spaces">Total Parking Spaces</Label>
              <Input
                id="total-spaces"
                type="number"
                value={totalSpaces}
                onChange={(e) => setTotalSpaces(parseInt(e.target.value) || 0)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default capacity applied to all dates in current view
              </p>
            </div>
            <Button className="w-full" onClick={handleApplyGlobalCapacity}>Apply to All Dates</Button>
          </div>
        </Card>

        <Card className="p-6 bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Quick Status Summary</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {data.filter(d => (d.statusColor || d.status) === 'green' && (d.capacityRemaining ?? d.remaining) > 100).length} dates
                  </span> with high availability
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {data.filter(d => (d.statusColor || d.status) === 'green' && (d.capacityRemaining ?? d.remaining) <= 100 && (d.capacityRemaining ?? d.remaining) > 0).length} dates
                  </span> with limited spaces
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {data.filter(d => ((d.statusColor || d.status) !== 'green' || (d.capacityRemaining ?? d.remaining) === 0)).length} dates
                  </span> closed or fully booked
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Day</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Capacity</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Remaining</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Open</th>
              </tr>
            </thead>
            <tbody>
              {data.map((dateData) => {
                const date = new Date(dateData.date)
                const total = dateData.capacityTotal ?? dateData.capacity.total
                const remaining = dateData.capacityRemaining ?? dateData.remaining
                const utilizationPercent = ((total - remaining) / total) * 100

                return (
                  <tr key={dateData.date} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">
                      {date.toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {date.toLocaleDateString('en-GB', { weekday: 'long' })}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={dateData.capacityTotal ?? dateData.capacity.total}
                          onChange={(e) => handleCapacityChange(dateData.date, parseInt(e.target.value) || 0)}
                          className="w-24 bg-background border rounded px-2 py-1 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => saveCapacity(dateData.date, dateData.capacityTotal ?? dateData.capacity.total)}
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${remaining === 0 ? 'text-red-600 dark:text-red-400' :
                          remaining < 100 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-emerald-600 dark:text-emerald-400'
                          }`}>
                          {remaining}
                        </span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${utilizationPercent >= 100 ? 'bg-red-500' :
                              utilizationPercent >= 80 ? 'bg-yellow-500' :
                                'bg-emerald-500'
                              }`}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {(dateData.statusColor || dateData.status) === 'green' && remaining > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          {(dateData.statusColor || dateData.status) !== 'green' ? 'Closed' : 'Full'}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Switch
                        checked={(dateData.availability || dateData.status) === 'available'}
                        onCheckedChange={(checked) => handleToggleDate(dateData.date, checked ? 'available' as any : 'unavailable' as any)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
