'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { User, Bell, Key, Building, Loader2 } from 'lucide-react'
import { api, type UserProfile, type BusinessSettings, type NotificationSettings } from '@/lib/api'
import { toast } from 'react-toastify'

export function SettingsPage() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [business, setBusiness] = useState<Partial<BusinessSettings>>({})
  const [notifications, setNotifications] = useState<Partial<NotificationSettings>>({
      emailAlerts: true,
      pushNotifications: true,
      lowStockAlerts: true,
      weeklyReports: false
  })
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const [profileData, businessData, notifData, apiKeyData] = await Promise.all([
        api.getProfile(),
        api.getBusinessSettings(),
        api.getNotificationSettings(),
        api.getApiKey()
      ])

      setProfile(profileData)
      setBusiness(businessData)
      setNotifications(notifData)
      setApiKey(apiKeyData.apiKey)
    } catch (error) {
      console.error(error)
      // toast.error('Failed to load settings')
      // Don't show error toast on initial load to avoid spam if some endpoints are mock/failing
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    setSaving(true)
    try {
        await api.updateProfile(profile)
        toast.success('Profile updated')
    } catch (error) {
        console.error(error)
        toast.error('Failed to update profile')
    } finally {
        setSaving(false)
    }
  }

  const handleUpdateBusiness = async () => {
    setSaving(true)
    try {
        await api.updateBusinessSettings(business)
        toast.success('Business settings updated')
    } catch (error) {
        console.error(error)
        toast.error('Failed to update business settings')
    } finally {
        setSaving(false)
    }
  }

  const handleUpdateNotifications = async () => {
    setSaving(true)
    try {
        await api.updateNotificationSettings(notifications)
        toast.success('Notification settings updated')
    } catch (error) {
        console.error(error)
        toast.error('Failed to update notification settings')
    } finally {
        setSaving(false)
    }
  }

  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure? This will invalidate the old key.')) return
    
    setSaving(true)
    try {
        const data = await api.regenerateApiKey()
        setApiKey(data.apiKey)
        toast.success('API Key regenerated')
    } catch (error) {
        console.error(error)
        toast.error('Failed to regenerate API key')
    } finally {
        setSaving(false)
    }
  }

  if (loading) {
      return (
          <div className="flex h-full items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your dashboard preferences</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Manage your account information</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={profile.username || ''} 
                onChange={(e) => setProfile({ ...profile, username: e.target.value })} 
                className="mt-2" 
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile.email || ''} 
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-2" 
                readOnly
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={saving}>Update Profile</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Business Settings</h2>
              <p className="text-sm text-muted-foreground">Configure parking capacity and operations</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="business-name">Business Name</Label>
              <Input 
                id="business-name" 
                value={business.name || ''} 
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="mt-2" 
              />
            </div>
            <div>
              <Label htmlFor="business-address">Address</Label>
              <Input 
                id="business-address" 
                value={business.address || ''} 
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                className="mt-2" 
              />
            </div>
            <div>
              <Label htmlFor="business-phone">Phone</Label>
              <Input 
                id="business-phone" 
                value={business.phone || ''} 
                onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                className="mt-2" 
              />
            </div>
            <div>
              <Label htmlFor="business-currency">Currency</Label>
              <Input 
                id="business-currency" 
                value={business.currency || ''} 
                onChange={(e) => setBusiness({ ...business, currency: e.target.value })}
                className="mt-2" 
              />
            </div>
            <Button onClick={handleUpdateBusiness} disabled={saving}>Save Changes</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Configure alert and warning preferences</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-warnings">Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive alerts for low capacity
                </p>
              </div>
              <Switch
                id="auto-warnings"
                checked={notifications.lowStockAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, lowStockAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Send alerts to your email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
              />
            </div>
             <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Send alerts to your device
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
              />
            </div>
            <Button onClick={handleUpdateNotifications} disabled={saving}>Update Notifications</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
              <p className="text-sm text-muted-foreground">Manage integrations with booking platforms</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key">Booking Platform API Key</Label>
              <div className="flex gap-2">
                <Input 
                    id="api-key" 
                    type="text" 
                    readOnly
                    value={apiKey} 
                    className="mt-2 font-mono" 
                />
                <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => {
                        navigator.clipboard.writeText(apiKey)
                        toast.success('Copied to clipboard')
                    }}
                >
                    Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                For future integration with third-party booking platforms
              </p>
            </div>
            <Button onClick={handleRegenerateApiKey} variant="destructive" disabled={saving}>Regenerate API Key</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
