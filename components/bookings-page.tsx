'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, Mail, Phone, Car, Eye, Download, ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api, type Booking } from '@/lib/api'
import { BookingDetailsDrawer } from '@/components/booking-details-drawer'
import { toast } from 'react-toastify'

export function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const data = await api.getBookings()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.carReg.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSource = sourceFilter === 'all' || booking.source === sourceFilter
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter

    return matchesSearch && matchesSource && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDrawerOpen(true)
  }

  const handleExportCSV = () => {
    const headers = ['Booking Ref', 'Customer Name', 'Email', 'Phone', 'Car Reg', 'Arrival', 'Return', 'Price', 'Spaces', 'Source', 'Status']
    const rows = filteredBookings.map(b => [
      b.id, b.customerName, b.email, b.phone, b.carReg,
      b.arrivalDate, b.returnDate, `£${b.price.toFixed(2)}`,
      b.spacesReserved, b.source, b.status
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'New': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
      'Confirmed': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      'Completed': 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20'
    }
    return variants[status as keyof typeof variants] || variants.New
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-16 lg:pt-8 min-h-screen">
      <div className="mb-4 sm:mb-6 lg:mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Bookings</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
            View and manage all incoming bookings from agents and direct customers
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">Search Bookings</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ref, or car..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">Source</label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Looking4">Looking4</SelectItem>
                <SelectItem value="SkyParks">SkyParks</SelectItem>
                <SelectItem value="Direct">Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </div>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="sm:ml-auto text-xs sm:text-sm"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Bookings Table */}
      {loading ? (
        <Card className="p-8 sm:p-12 text-center flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="text-muted-foreground">
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
            <p className="text-base sm:text-lg font-medium mb-2">No bookings found</p>
            <p className="text-xs sm:text-sm">Try adjusting your search or filters</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 lg:hidden">
            {paginatedBookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-sm text-foreground mb-1">{booking.customerName}</div>
                    <div className="text-xs text-muted-foreground">{booking.id}</div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Car className="w-3 h-3 text-muted-foreground" />
                    <span className="font-mono">{booking.carReg}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(booking.arrivalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(booking.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      {booking.source}
                    </span>
                    <span className="font-semibold text-sm">£{booking.price.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleViewDetails(booking)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-medium text-foreground">Booking Ref</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-medium text-foreground">Customer</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-medium text-foreground">Contact</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-medium text-foreground">Car Reg</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-medium text-foreground">Dates</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-medium text-foreground">Price</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-medium text-foreground">Source</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-medium text-foreground">Status</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3 lg:p-4">
                        <div className="font-medium text-xs lg:text-sm text-foreground">{booking.id}</div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="text-xs lg:text-sm text-foreground font-medium">{booking.customerName}</div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{booking.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {booking.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="flex items-center gap-1 text-xs lg:text-sm">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono">{booking.carReg}</span>
                        </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            In: {new Date(booking.arrivalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Out: {new Date(booking.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="font-semibold text-xs lg:text-sm text-foreground">£{booking.price.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{booking.spacesReserved} space{booking.spacesReserved > 1 ? 's' : ''}</div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          {booking.source}
                        </span>
                      </td>
                      <td className="p-3 lg:p-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-3 lg:p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Booking Details Drawer */}
      <BookingDetailsDrawer
        booking={selectedBooking}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}
