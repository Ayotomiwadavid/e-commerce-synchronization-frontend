'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Minus, Check, Loader2, Save } from 'lucide-react'
import { api, type CalendarData } from '@/lib/api'
import { toast } from 'react-toastify'

export function PricingManagement() {
  const [data, setData] = useState<CalendarData[]>([])
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [bulkPrice, setBulkPrice] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('01') // Default to Jan or current
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    // Determine current month if 'all' is not selected, but for now let's just default to current month if simpler
    // Or better, fetch data when selectedMonth changes
    if (selectedMonth !== 'all') {
      fetchData(parseInt(selectedMonth))
    } else {
      // If 'all' is selected, we might need to fetch multiple months. 
      // For simplicity/performance, let's limit 'all' or fetch a range.
      // Or just fetch current month by default.
      // Let's implement fetching for the selected month.
    }
  }, [selectedMonth])

  const fetchData = async (month: number) => {
    setLoading(true)
    try {
      const data = await api.getCalendar(currentYear, month)
      setData(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load pricing data')
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (date: string, newPrice: number) => {
    setData(prev => prev.map(d => d.date === date ? { ...d, price: newPrice } : d))
  }

  const savePrice = async (date: string, price: number) => {
    try {
      await api.updatePrice(date, price)
      toast.success('Price updated')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update price')
    }
  }

  // Bulk actions now need to just update local state, then have a "Save All" or save individually?
  // The UI has a "Save" button next to bulk input.
  // For +/- buttons, we should probably have a "Apply" button or apply immediately?
  // The previous mock logic applied immediately to local state.
  // We can keep that, but we need a way to persist.
  // Let's assume the user modifies locally and then expects it to save?
  // Or we trigger API calls for all selected items.

  const handleBulkIncrease = async () => {
    if (selectedDates.size === 0) return
    const amount = 5
    // Optimistic
    setData(prev => prev.map(d =>
      selectedDates.has(d.date) ? { ...d, price: d.price + amount } : d
    ))
    // API
    await performBulkUpdate((d) => d.price + amount)
  }

  const handleBulkDecrease = async () => {
    if (selectedDates.size === 0) return
    const amount = 5
    // Optimistic
    setData(prev => prev.map(d =>
      selectedDates.has(d.date) ? { ...d, price: Math.max(0, d.price - amount) } : d
    ))
    // API
    await performBulkUpdate((d) => Math.max(0, d.price - amount))
  }

  const handleBulkUpdate = async () => {
    if (bulkPrice && selectedDates.size > 0) {
      const price = parseFloat(bulkPrice)
      if (isNaN(price)) return

      // Optimistic
      setData(prev => prev.map(d =>
        selectedDates.has(d.date) ? { ...d, price } : d
      ))
      setBulkPrice('')

      // API
      setUpdating(true)
      const loadingToast = toast.loading(`Updating ${selectedDates.size} dates...`)
      try {
        const promises = Array.from(selectedDates).map(date => api.updatePrice(date, price))
        await Promise.all(promises)
        toast.success('Bulk update successful')
      } catch (error) {
        toast.error('Some updates failed')
      } finally {
        toast.dismiss(loadingToast)
        setUpdating(false)
      }
    }
  }

  const performBulkUpdate = async (priceCalculator: (d: CalendarData) => number) => {
    setUpdating(true)
    const loadingToast = toast.loading(`Updating ${selectedDates.size} dates...`)
    try {
      const datesToUpdate = data.filter(d => selectedDates.has(d.date))
      const promises = datesToUpdate.map(d => api.updatePrice(d.date, priceCalculator(d)))
      await Promise.all(promises)
      toast.success('Bulk update successful')
    } catch (error) {
      console.error(error)
      toast.error('Some updates failed')
    } finally {
      toast.dismiss(loadingToast)
      setUpdating(false)
    }
  }

  const toggleDateSelection = (date: string) => {
    const newSelected = new Set(selectedDates)
    if (newSelected.has(date)) {
      newSelected.delete(date)
    } else {
      newSelected.add(date)
    }
    setSelectedDates(newSelected)
  }

  const selectAll = () => {
    setSelectedDates(new Set(data.map(d => d.date)))
  }

  const clearSelection = () => {
    setSelectedDates(new Set())
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Pricing Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Adjust prices for individual dates or in bulk</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Filter by Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">January</SelectItem>
                  <SelectItem value="02">February</SelectItem>
                  <SelectItem value="03">March</SelectItem>
                  <SelectItem value="04">April</SelectItem>
                  <SelectItem value="05">May</SelectItem>
                  <SelectItem value="06">June</SelectItem>
                  <SelectItem value="07">July</SelectItem>
                  <SelectItem value="08">August</SelectItem>
                  <SelectItem value="09">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Bulk Price Update</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                />
                <Button onClick={handleBulkUpdate} disabled={selectedDates.size === 0 || !bulkPrice || updating}>
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleBulkIncrease} disabled={selectedDates.size === 0 || updating} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                +£5
              </Button>
              <Button variant="outline" onClick={handleBulkDecrease} disabled={selectedDates.size === 0 || updating} className="flex-1 sm:flex-none">
                <Minus className="w-4 h-4 mr-2" />
                -£5
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="flex-1">
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection} className="flex-1">
                Clear
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {selectedDates.size > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {selectedDates.size} date{selectedDates.size > 1 ? 's' : ''} selected
          </p>
        </div>
      )}

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
                <th className="text-left p-4 text-sm font-medium text-foreground">Select</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Day</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Price (£)</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Spaces</th>
              </tr>
            </thead>
            <tbody>
              {data.map((dateData) => {
                const date = new Date(dateData.date)
                const isSelected = selectedDates.has(dateData.date)

                return (
                  <tr key={dateData.date} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleDateSelection(dateData.date)}
                      />
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      {date.toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          value={dateData.price}
                          onChange={(e) => handlePriceChange(dateData.date, parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => savePrice(dateData.date, dateData.price)}
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${dateData.status === 'green' || dateData.availability === 'available'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-500/10 text-red-700 dark:text-red-300'
                        }`}>
                        {dateData.status === 'green' || dateData.availability === 'available' ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      {dateData.capacity.remaining} / {dateData.capacity.total}
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
