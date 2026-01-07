'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Dashboard } from '@/components/dashboard'
import { Loader2 } from 'lucide-react'

export default function Page() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false)
  // const [isLoading, setIsLoading] = useState(true)
  // const router = useRouter()

  // useEffect(() => {
  //   checkAuth()
  // }, [])

  // const checkAuth = () => {
  //   const token = api.getToken()
  //   if (!token) {
  //     // router.push('/login')
  //   } else {
  //     setIsAuthenticated(true)
  //   }
  //   setIsLoading(false)
  // }

  // if (isLoading) {
  //   return (
  //     <div className="h-screen w-screen flex items-center justify-center bg-background">
  //       <Loader2 className="w-8 h-8 animate-spin text-primary" />
  //     </div>
  //   )
  // }

  // if (!isAuthenticated) {
  //   return null // Will redirect
  // }

  return <Dashboard />
}
