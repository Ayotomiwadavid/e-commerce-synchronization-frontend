import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Settings, AlertTriangle, History, ParkingSquare, BookOpen, Users, LogOut } from 'lucide-react'
import { PageType } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface SidebarProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
}

const menuItems = [
  { id: 'dashboard' as PageType, label: 'Dashboard', icon: Calendar, role: 'admin, staff' },
  { id: 'bookings' as PageType, label: 'Bookings', icon: BookOpen, role: 'admin, staff' },
  { id: 'pricing' as PageType, label: 'Pricing', icon: DollarSign, role: 'admin, staff' },
  { id: 'availability' as PageType, label: 'Availability', icon: ParkingSquare, role: 'admin, staff' },
  { id: 'logs' as PageType, label: 'Change History', icon: History, role: 'admin, staff' },
  { id: 'alerts' as PageType, label: 'Alerts', icon: AlertTriangle, role: 'admin, staff' },
  { id: 'settings' as PageType, label: 'Settings', icon: Settings, role: 'admin, staff' },
  { id: 'staff' as PageType, label: 'Staff', icon: Users, role: 'admin' },
]

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const router = useRouter()
  const [user, setUser] = useState<null>(null)

   useEffect(() => {
     const fetchProfile = async () => {
       try {
        const profile = await api.getProfile()
        setUser(profile.user)
       } catch (error) {
         console.error('Failed to load profile', error)
       }
     }
     fetchProfile()
   }, [])

  const handleLogout = () => {
    api.setToken('')
    router.push('/login')
  }

  const filteredMenuItems = menuItems.filter((item) => {
    const roles =
      typeof (item as any).role === 'string'
        ? (item as any).role.split(',').map((r: string) => r.trim().toLowerCase())
        : undefined
    if (!roles) return true
    const role = (user?.role || '').toLowerCase()
    if (!role) return false
    return roles.includes(role)
  })

  return (
    <aside className="w-64 lg:w-64 h-full border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-semibold text-sidebar-foreground flex items-center gap-2">
          <ParkingSquare className="w-6 h-6 text-emerald-500" />
          Airport Parking
        </h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">Management Dashboard</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all mb-4"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
        
        <div className="text-xs text-sidebar-foreground/50">
          Logged in as <span className="font-medium text-sidebar-foreground/70">{user?.username || '...'}</span>
        </div>
      </div>
    </aside>
  )
}
