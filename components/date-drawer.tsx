'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { type CalendarData, api } from '@/lib/api'
import { toast } from 'react-toastify'

interface DateDrawerProps {
  date: CalendarData
  onClose: () => void
  onUpdate: (date: CalendarData) => void
}

export function DateDrawer({ date, onClose, onUpdate }: DateDrawerProps) {
  const [editedDate, setEditedDate] = useState(date)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = []

      // Always send update requests if values are present, or check diff
      // Assuming API handles 'create if not exists' or we just update existing
      // If the date didn't exist in 'data' array, it might be new.
      // But updatePrice etc usually work by date string.

      if (editedDate.price !== date.price) {
        promises.push(api.updatePrice(editedDate.date, editedDate.price))
      }
      
      // Check if capacity exists and changed
      if (editedDate.capacity?.total !== date.capacity?.total) {
         // Fallback if capacity object is missing in partial data
         const newTotal = editedDate.capacity?.total ?? 0
         promises.push(api.updateCapacity(editedDate.date, newTotal))
      }

      if (editedDate.availability !== date.availability || editedDate.manualOverride !== date.manualOverride) {
        promises.push(api.updateAvailability(editedDate.date, editedDate.availability as any, editedDate.manualOverride))
      }
      
      // If we are just creating a new entry (editing a date that had no data), we should probably ensure at least one call is made
      // or maybe the backend handles it. 
      // For now, if nothing changed but we hit save on a new date, maybe we should init it?
      // Let's rely on the user changing something.

      await Promise.all(promises)

      toast.success('Changes saved successfully')
      onUpdate(editedDate)
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Edit Date</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Date</Label>
              <p className="text-lg font-semibold text-foreground mt-1">
                {new Date(editedDate.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <Label htmlFor="price">Price (£)</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditedDate({ ...editedDate, price: Math.max(0, editedDate.price - 5) })}
                >
                  -
                </Button>
                <Input
                  id="price"
                  type="number"
                  value={editedDate.price}
                  onChange={(e) => setEditedDate({ ...editedDate, price: parseFloat(e.target.value) || 0 })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditedDate({ ...editedDate, price: editedDate.price + 5 })}
                >
                  +
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={editedDate.capacity.total}
                onChange={(e) => setEditedDate({ ...editedDate, capacity: { ...editedDate.capacity, total: parseInt(e.target.value) || 0 } })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="remaining">Remaining Spaces</Label>
              <Input
                id="remaining"
                type="number"
                value={editedDate.capacity.remaining}
                disabled
                className="mt-2 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Calculated by backend based on capacity and bookings
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="availability">Availability</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Toggle to close or open this date
                </p>
              </div>
              <Switch
                id="availability"
                checked={editedDate.availability === 'available'}
                onCheckedChange={(checked) => setEditedDate({ 
                    ...editedDate, 
                    availability: checked ? 'available' : 'unavailable',
                    manualOverride: true 
                })}
              />
            </div>
            
            {/* 
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="manualOverride">Manual Override</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                        Lock this status against automatic updates
                    </p>
                </div>
                <Switch
                    id="manualOverride"
                    checked={editedDate.manualOverride}
                    onCheckedChange={(checked) => setEditedDate({ ...editedDate, manualOverride: checked })}
                />
            </div> 
            */}
          </div>

          <div className="flex gap-3 mt-8">
            <Button onClick={handleSave} className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
