'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react'
import { api, type Alert } from '@/lib/api'
import { toast } from 'react-toastify'

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts()
      setAlerts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (id: string) => {
    try {
      await api.markAlertRead(id)
      setAlerts(alerts.filter(a => a.id !== id))
      toast.success('Alert dismissed')
    } catch (error) {
      console.error(error)
      toast.error('Failed to dismiss alert')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Alerts & Warnings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Monitor important notifications and warnings</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : alerts.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No active alerts
          </Card>
        ) : (
          alerts.map((alert) => {
            const Icon = alert.severity === 'critical' ? AlertTriangle : alert.severity === 'warning' ? AlertCircle : CheckCircle2
            const colorClasses =
              alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                alert.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  'bg-emerald-500/10 border-emerald-500/20'
            const textColor =
              alert.severity === 'critical' ? 'text-red-700 dark:text-red-300' :
                alert.severity === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-emerald-700 dark:text-emerald-300'

            return (
              <Card key={alert.id} className={`p-4 sm:p-6 ${colorClasses}`}>
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-base sm:text-lg ${textColor} capitalize`}>{alert.type.replace('_', ' ')}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {new Date(alert.date).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => handleDismiss(alert.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm sm:text-base text-foreground mb-3">{alert.message}</p>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
