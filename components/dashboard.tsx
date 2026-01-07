'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { DashboardHome } from '@/components/dashboard-home'
import { BookingsPage } from '@/components/bookings-page'
import { PricingManagement } from '@/components/pricing-management'
import { AvailabilityCapacity } from '@/components/availability-capacity'
import { LogsHistory } from '@/components/logs-history'
import { AlertsPage } from '@/components/alerts-page'
import { SettingsPage } from '@/components/settings-page'
import { StaffManagement } from '@/components/staff-management'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type PageType = 'dashboard' | 'bookings' | 'pricing' | 'availability' | 'logs' | 'alerts' | 'settings' | 'staff'

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page)
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {currentPage === 'dashboard' && <DashboardHome />}
        {currentPage === 'bookings' && <BookingsPage />}
        {currentPage === 'pricing' && <PricingManagement />}
        {currentPage === 'availability' && <AvailabilityCapacity />}
        {currentPage === 'logs' && <LogsHistory />}
        {currentPage === 'alerts' && <AlertsPage />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'staff' && <StaffManagement />}
      </main>
    </div>
  )
}
