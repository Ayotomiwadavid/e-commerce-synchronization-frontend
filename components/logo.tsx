'use client'

import { ParkingSquare } from 'lucide-react'

export function Logo() {

  return (
    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg">
      <ParkingSquare className="w-9 h-9 text-white" />
    </div>
  )
}
