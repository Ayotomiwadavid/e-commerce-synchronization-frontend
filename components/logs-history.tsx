'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, ParkingSquare, ToggleLeft, Loader2, Activity } from 'lucide-react'
import { api, type Log } from '@/lib/api'
import { toast } from 'react-toastify'

export function LogsHistory() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const data = await api.getLogs()
      setLogs(data.logs || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  const getLogType = (log: Log) => {
    if (log.action.toLowerCase().includes('price')) return 'price'
    if (log.action.toLowerCase().includes('capacity')) return 'capacity'
    if (log.action.toLowerCase().includes('availability') || log.action.toLowerCase().includes('status')) return 'availability'
    if (log.action.toLowerCase().includes('login')) return 'login'
    if (log.action.toLowerCase().includes('create_staff')) return 'create_staff'
    if (log.action.toLowerCase().includes('update_staff_role')) return 'update_staff_role'
    return 'other'
  }

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return getLogType(log) === filter
  })

  return (
    <div className="p-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Change History</h1>
        <p className="text-muted-foreground">Track all pricing and availability changes</p>
      </div>

      <div className="mb-6">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Changes</SelectItem>
            <SelectItem value="price">Price Changes</SelectItem>
            <SelectItem value="availability">Availability Changes</SelectItem>
            <SelectItem value="capacity">Capacity Changes</SelectItem>
            <SelectItem value="create_staff">Create Staff Changes</SelectItem>
            <SelectItem value="login">Login Changes</SelectItem>
            <SelectItem value="update_staff_role">Update Staff Role Changes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No logs found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const type = getLogType(log)
              const Icon = type === 'price' ? DollarSign : type === 'capacity' ? ParkingSquare : type === 'availability' ? ToggleLeft : Activity
              const iconColor = type === 'price' ? 'text-emerald-500' : type === 'capacity' ? 'text-blue-500' : type === 'availability' ? 'text-yellow-500' : 'text-gray-500'

              return (
                <div key={log.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-lg bg-muted h-fit`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-foreground">{log.message}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${type === 'price' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                          type === 'capacity' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300' :
                            type === 'availability' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' :
                              'bg-gray-500/10 text-gray-700 dark:text-gray-300'
                          }`}>
                          {type}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Changed by:</span> {log.userId?.username || 'Unknown'}
                      </div>
                      {log.details && (
                        <div className="mt-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                          {log.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
