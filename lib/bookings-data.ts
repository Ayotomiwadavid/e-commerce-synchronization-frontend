export interface Booking {
  id: string
  customerName: string
  email: string
  phone: string
  carReg: string
  arrivalDate: string
  returnDate: string
  price: number
  spacesReserved: number
  source: 'Looking4' | 'SkyParks' | 'Direct'
  status: 'New' | 'Confirmed' | 'Completed'
  createdAt: string
}

export const bookingsData: Booking[] = [
  {
    id: "BK-12345",
    customerName: "John Smith",
    email: "john.smith@example.com",
    phone: "07123456789",
    carReg: "AB12 CDE",
    arrivalDate: "2025-06-01",
    returnDate: "2025-06-10",
    price: 65.00,
    spacesReserved: 1,
    source: "Looking4",
    status: "New",
    createdAt: "2025-01-15T10:30:00Z"
  },
  {
    id: "BK-12346",
    customerName: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "07234567890",
    carReg: "CD34 EFG",
    arrivalDate: "2025-06-05",
    returnDate: "2025-06-12",
    price: 77.00,
    spacesReserved: 1,
    source: "SkyParks",
    status: "Confirmed",
    createdAt: "2025-01-15T11:45:00Z"
  },
  {
    id: "BK-12347",
    customerName: "Michael Brown",
    email: "m.brown@example.com",
    phone: "07345678901",
    carReg: "EF56 GHI",
    arrivalDate: "2025-05-28",
    returnDate: "2025-06-04",
    price: 49.00,
    spacesReserved: 1,
    source: "Direct",
    status: "Confirmed",
    createdAt: "2025-01-14T09:15:00Z"
  },
  {
    id: "BK-12348",
    customerName: "Emma Wilson",
    email: "emma.wilson@example.com",
    phone: "07456789012",
    carReg: "GH78 IJK",
    arrivalDate: "2025-06-15",
    returnDate: "2025-06-22",
    price: 91.00,
    spacesReserved: 2,
    source: "Looking4",
    status: "New",
    createdAt: "2025-01-15T14:20:00Z"
  },
  {
    id: "BK-12349",
    customerName: "David Taylor",
    email: "d.taylor@example.com",
    phone: "07567890123",
    carReg: "IJ90 KLM",
    arrivalDate: "2025-06-03",
    returnDate: "2025-06-07",
    price: 44.00,
    spacesReserved: 1,
    source: "SkyParks",
    status: "Confirmed",
    createdAt: "2025-01-14T16:30:00Z"
  },
  {
    id: "BK-12350",
    customerName: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    phone: "07678901234",
    carReg: "KL12 MNO",
    arrivalDate: "2025-05-25",
    returnDate: "2025-06-01",
    price: 63.00,
    spacesReserved: 1,
    source: "Direct",
    status: "Completed",
    createdAt: "2025-01-12T08:00:00Z"
  },
  {
    id: "BK-12351",
    customerName: "James Martinez",
    email: "james.m@example.com",
    phone: "07789012345",
    carReg: "MN34 PQR",
    arrivalDate: "2025-06-20",
    returnDate: "2025-06-27",
    price: 84.00,
    spacesReserved: 1,
    source: "Looking4",
    status: "New",
    createdAt: "2025-01-15T15:45:00Z"
  },
  {
    id: "BK-12352",
    customerName: "Sophie Davis",
    email: "sophie.davis@example.com",
    phone: "07890123456",
    carReg: "OP56 STU",
    arrivalDate: "2025-06-08",
    returnDate: "2025-06-14",
    price: 72.00,
    spacesReserved: 1,
    source: "SkyParks",
    status: "Confirmed",
    createdAt: "2025-01-15T12:10:00Z"
  },
  {
    id: "BK-12353",
    customerName: "Robert Garcia",
    email: "r.garcia@example.com",
    phone: "07901234567",
    carReg: "QR78 VWX",
    arrivalDate: "2025-05-30",
    returnDate: "2025-06-05",
    price: 54.00,
    spacesReserved: 1,
    source: "Direct",
    status: "Completed",
    createdAt: "2025-01-13T10:25:00Z"
  },
  {
    id: "BK-12354",
    customerName: "Jennifer Lee",
    email: "jennifer.lee@example.com",
    phone: "07012345678",
    carReg: "ST90 YZA",
    arrivalDate: "2025-06-18",
    returnDate: "2025-06-25",
    price: 98.00,
    spacesReserved: 2,
    source: "Looking4",
    status: "New",
    createdAt: "2025-01-15T17:00:00Z"
  },
  {
    id: "BK-12355",
    customerName: "Christopher White",
    email: "chris.white@example.com",
    phone: "07123456780",
    carReg: "UV12 BCD",
    arrivalDate: "2025-06-10",
    returnDate: "2025-06-16",
    price: 78.00,
    spacesReserved: 1,
    source: "SkyParks",
    status: "Confirmed",
    createdAt: "2025-01-15T13:30:00Z"
  },
  {
    id: "BK-12356",
    customerName: "Amanda Thompson",
    email: "amanda.t@example.com",
    phone: "07234567891",
    carReg: "WX34 EFG",
    arrivalDate: "2025-06-02",
    returnDate: "2025-06-09",
    price: 70.00,
    spacesReserved: 1,
    source: "Direct",
    status: "Confirmed",
    createdAt: "2025-01-14T14:15:00Z"
  }
]
