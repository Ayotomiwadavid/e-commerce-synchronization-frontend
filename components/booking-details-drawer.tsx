'use client'

import { X, Mail, Phone, Car, Calendar, MapPin, User, CreditCard, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type Booking } from '@/lib/api'

interface BookingDetailsDrawerProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
}

export function BookingDetailsDrawer({ booking, isOpen, onClose }: BookingDetailsDrawerProps) {
  if (!booking || !isOpen) return null

  const getStatusBadge = (status: string) => {
    const variants = {
      'New': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
      'Confirmed': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      'Completed': 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20'
    }
    return variants[status as keyof typeof variants] || variants.New
  }

  const arrivalDate = new Date(booking.arrivalDate)
  const returnDate = new Date(booking.returnDate)
  const nights = Math.ceil((returnDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[90vw] md:w-[500px] lg:w-[550px] bg-background border-l border-border z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Booking Details</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{booking.id}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Status Badge */}
          <div className="mb-4 sm:mb-6">
            <span className={`inline-flex px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border ${getStatusBadge(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          {/* Customer Information */}
          <Card className="p-3 sm:p-4 mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Customer Information
            </h3>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Name</div>
                <div className="text-sm font-medium text-foreground">{booking.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </div>
                <div className="text-xs sm:text-sm text-foreground break-all">{booking.email}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Phone
                </div>
                <div className="text-xs sm:text-sm text-foreground">{booking.phone}</div>
              </div>
            </div>
          </Card>

          {/* Vehicle Information */}
          <Card className="p-3 sm:p-4 mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Car className="w-3 h-3 sm:w-4 sm:h-4" />
              Vehicle Information
            </h3>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Registration Number</div>
                <div className="text-sm font-mono font-medium text-foreground">{booking.carReg}</div>
              </div>
            </div>
          </Card>

          {/* Booking Details */}
          <Card className="p-3 sm:p-4 mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Booking Details
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Arrival Date</div>
                  <div className="text-xs sm:text-sm font-medium text-foreground">
                    {arrivalDate.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Return Date</div>
                  <div className="text-xs sm:text-sm font-medium text-foreground">
                    {returnDate.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <div className="text-xs sm:text-sm font-medium text-foreground">{nights} night{nights !== 1 ? 's' : ''}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Spaces Reserved
                </div>
                <div className="text-xs sm:text-sm font-medium text-foreground">{booking.spacesReserved}</div>
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-3 sm:p-4 mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              Payment Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-xs sm:text-sm text-muted-foreground">Total Price</div>
                <div className="text-lg sm:text-xl font-bold text-foreground">£{booking.price.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">Price per night</div>
                <div className="text-xs sm:text-sm text-foreground">£{(booking.price / nights).toFixed(2)}</div>
              </div>
            </div>
          </Card>

          {/* Source Information */}
          <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              Booking Source
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                {booking.source}
              </span>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full text-sm" size="lg">
              Confirm Booking
            </Button>
            <Button variant="outline" className="w-full text-sm">
              Contact Customer
            </Button>
            <Button variant="outline" className="w-full text-sm text-red-600 hover:text-red-700">
              Cancel Booking
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
