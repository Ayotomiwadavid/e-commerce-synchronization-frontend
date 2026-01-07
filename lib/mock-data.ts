export interface ParkingDate {
  date: string
  price: number
  capacity: number
  remainingSpaces: number
  status: 'open' | 'closed'
  notes?: string
}

export interface ChangeLog {
  date: string
  type: 'price' | 'availability' | 'capacity'
  description: string
  user: string
  details?: string
}

export interface Alert {
  severity: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  action?: string
}

// Generate 90 days of mock data
const generateParkingData = (): ParkingDate[] => {
  const data: ParkingDate[] = []
  const startDate = new Date('2025-01-01')
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Vary prices based on day of week (weekends more expensive)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const basePrice = isWeekend ? 45 : 35
    const priceVariation = Math.floor(Math.random() * 15)
    
    // Vary capacity and remaining spaces
    const capacity = 475
    const booked = Math.floor(Math.random() * 400)
    const remainingSpaces = capacity - booked
    
    data.push({
      date: dateStr,
      price: basePrice + priceVariation,
      capacity,
      remainingSpaces,
      status: Math.random() > 0.9 ? 'closed' : 'open',
      notes: ''
    })
  }
  
  return data
}

export const parkingData = generateParkingData()

export const changeHistory: ChangeLog[] = [
  {
    date: '2025-01-15 14:32',
    type: 'price',
    description: 'Price updated for January 20, 2025',
    user: 'Mel',
    details: 'Changed from £40 to £50 due to high demand period'
  },
  {
    date: '2025-01-15 10:15',
    type: 'availability',
    description: 'Date closed: January 25, 2025',
    user: 'Mel',
    details: 'Facility maintenance scheduled'
  },
  {
    date: '2025-01-14 16:45',
    type: 'capacity',
    description: 'Capacity adjusted for January 18, 2025',
    user: 'Mel',
    details: 'Reduced from 475 to 400 spaces for renovation work'
  },
  {
    date: '2025-01-14 09:20',
    type: 'price',
    description: 'Bulk price update applied to weekend dates',
    user: 'Mel',
    details: 'Increased all weekend prices by £5 for January'
  },
  {
    date: '2025-01-13 15:10',
    type: 'availability',
    description: 'Re-opened January 22, 2025',
    user: 'Mel',
    details: 'Previously closed date reopened due to customer demand'
  }
]

export const alerts: Alert[] = [
  {
    severity: 'error',
    title: 'Critical: Low Space Alert',
    message: 'January 18, 2025 has only 12 spaces remaining. Consider closing bookings or increasing price.',
    timestamp: '2 hours ago',
    action: 'View Date'
  },
  {
    severity: 'warning',
    title: 'Weekend Capacity Warning',
    message: 'January 20-21 weekend showing high booking rate. Current remaining: 45 spaces.',
    timestamp: '5 hours ago',
    action: 'Adjust Pricing'
  },
  {
    severity: 'warning',
    title: 'Price Consistency Notice',
    message: 'January 25-27 have varying prices. Consider standardizing for better customer experience.',
    timestamp: '1 day ago',
    action: 'Review Pricing'
  },
  {
    severity: 'info',
    title: 'Upcoming Maintenance',
    message: 'Scheduled facility check on February 1st. Remember to adjust capacity.',
    timestamp: '2 days ago',
    action: 'Update Capacity'
  }
]
