import { redirect } from 'next/navigation'

const API_BASE_URL = 'https://e-commerce-synchronization.onrender.com'

export interface User {
    id: string
    email: string
    role: 'admin' | 'staff'
    username: string
    permissions?: string[]
}

export interface Staff extends User {
    status?: 'active' | 'inactive'
    lastLogin?: string
}

export interface UserProfile {
    username: string
    email: string
    role: string
    avatar?: string
}

export interface BusinessSettings {
    name: string
    address: string
    phone: string
    email: string
    currency: string
    taxId?: string
}

export interface NotificationSettings {
    emailAlerts: boolean
    pushNotifications: boolean
    lowStockAlerts: boolean
    weeklyReports: boolean
}

export interface AuthResponse {
    token: string
    user: User
}

export interface CalendarResponse {
    year: string
    month: string
    days: CalendarData[]
}

export interface CalendarData {
    id?: string // Some responses use id for date string
    date: string
    price: number
    availability: string // 'available'
    status?: string // 'green' | 'red' etc (from list)
    statusColor?: string // 'green' (from update)
    manualOverride: boolean
    capacity: {
        total: number
        remaining: number
    }
    capacityTotal?: number // From update
    capacityRemaining?: number // From update
    remaining: number
    bookingsCount: number
    alerts: any[]
    total: number
}

export interface UpdateResponse {
    message: string
    date: {
        _id: string
        id: string // This corresponds to the date string
        date: string // This is a full ISO date
        price: number
        availability: string
        manualOverride: boolean
        capacityTotal: number
        capacityRemaining: number
        bookingsCount: number
        statusColor: string
        createdAt: string
        updatedAt: string
    }
}

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

export interface Alert {
    id: string
    type: 'low_space' | 'fully_booked' | 'high_demand' | 'manual_change'
    message: string
    date: string
    read: boolean
    severity: 'info' | 'warning' | 'critical'
}

export interface Log {
    id: string
    action: string
    user: string
    timestamp: string
    details: string
}

class ApiService {
    private token: string | null = null
    private normalizeDateId(date: string): string {
        const parts = date.split('-')
        if (parts.length !== 3) return date
        const y = parts[0]
        const m = String(parseInt(parts[1], 10))
        const d = String(parseInt(parts[2], 10))
        return `${y}-${m}-${d}`
    }

    setToken(token: string) {
        this.token = token
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token)
        }
    }

    getToken(): string | null {
        if (this.token) return this.token
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token')
        }
        return null
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken()

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        })

        if (response.status === 401) {
            this.setToken('')
            if (typeof window !== 'undefined') window.location.href = '/login'
            throw new Error('Unauthorized')
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `API Error: ${response.statusText}`)
        }

        return response.json()
    }

    // Auth
    async login(username: string, password: string): Promise<AuthResponse> {
        const data = await this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        })
        this.setToken(data.token)
        return data
    }

    async register(name: string, email: string, password: string): Promise<AuthResponse> {
        // ID 10: Register endpoint
        const data = await this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username: name, name, email, password }),
        })
        this.setToken(data.token)
        return data
    }

    async forgotPassword(email: string): Promise<void> {
        // ID 10: Forgot password endpoint
        return this.request('/auth/forgotPassword', {
            method: 'POST',
            body: JSON.stringify({ email }),
        })
    }

    async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
        return this.request('/auth/resetPassword', {
            method: 'POST',
            body: JSON.stringify({ email, token, newPassword }),
        })
    }

    async verifyEmail(token: string): Promise<void> {
        return this.request('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
        })
    }

    // Calendar
    async getCalendar(year: number, month: number): Promise<CalendarData[]> {
        const response = await this.request<{ days: CalendarData[] } | CalendarData[]>(`/date/calendar/${year}/${month}`)
        if ('days' in response) {
            return response.days
        }
        return response
    }

    // Updates
    async updatePrice(date: string, price: number): Promise<UpdateResponse> {
        return this.request<UpdateResponse>('/date/price/update', {
            method: 'POST',
            body: JSON.stringify({ dateId: this.normalizeDateId(date), newPrice:price }),
        })
    }

    async updateAvailability(date: string, status: 'available' | 'unavailable', manualOverride: boolean = true): Promise<UpdateResponse> {
        return this.request<UpdateResponse>('/date/availability/update', {
            method: 'POST',
            body: JSON.stringify({ 
                dateId: this.normalizeDateId(date), 
                newAvailability: status,
                manualOverride 
            }),
        })
    }

    async updateCapacity(date: string, capacity: number): Promise<UpdateResponse> {
        return this.request<UpdateResponse>('/date/capacity/update', {
            method: 'POST',
            body: JSON.stringify({ dateId: this.normalizeDateId(date), newCapacity:capacity }),
        })
    }

    // Bookings
    async getBookings(): Promise<Booking[]> {
        const response = await this.request<{ bookings: Booking[] } | Booking[]>('/booking/bookings')
        if ('bookings' in response) {
            return response.bookings
        }
        return response as Booking[]
    }

    async getBookingsByDate(date: string): Promise<Booking[]> {
        return this.request<Booking[]>(`/booking/bookings/${date}`)
    }

    // Alerts
    async getAlerts(): Promise<Alert[]> {
        const response = await this.request<{ alerts: Alert[] } | Alert[]>('/alerts')
        if ('alerts' in response) {
            return response.alerts
        }
        return response as Alert[]
    }

    async markAlertRead(id: string): Promise<void> {
        // Assumption: Endpoint to mark alert as read
        return this.request(`/alerts/${id}/read`, {
            method: 'POST', // or PATCH
        })
    }

    // Logs
    async getLogs(): Promise<Log[]> {
        return this.request<Log[]>('/logs')
    }

    // Staff
    async getStaff(): Promise<Staff[]> {
        return this.request<Staff[]>('/staff',)
    }

    async createStaff(staff: Partial<Staff> & { password?: string }): Promise<Staff> {
        return this.request<Staff>(`/staff/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify(staff)
        })
    }

    async updateStaffRole(staffId: string, role: string): Promise<void> {
        return this.request('/staff/update-role', {
            method: 'POST',
            body: JSON.stringify({ staffId, role })
        })
    }

    async updateStaffPermissions(staffId: string, permissions: string[]): Promise<void> {
        return this.request('/staff/update-permissions', {
            method: 'POST',
            body: JSON.stringify({ staffId, permissions })
        })
    }

    // Settings
    async getProfile(): Promise<UserProfile> {
        return this.request<UserProfile>(`/settings/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
        })
    }

    async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
        return this.request<UserProfile>('/settings/profile', {
            method: 'PUT',
            body: JSON.stringify(profile)
        })
    }

    async getBusinessSettings(): Promise<BusinessSettings> {
        return this.request<BusinessSettings>('/settings/business')
    }

    async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
        return this.request<BusinessSettings>('/settings/business', {
            method: 'POST',
            body: JSON.stringify(settings)
        })
    }

    async getNotificationSettings(): Promise<NotificationSettings> {
        return this.request<NotificationSettings>('/settings/notifications')
    }

    async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
        return this.request<NotificationSettings>('/settings/notifications', {
            method: 'POST',
            body: JSON.stringify(settings)
        })
    }

    async getApiKey(): Promise<{ apiKey: string }> {
        return this.request<{ apiKey: string }>('/settings/api-key')
    }

    async regenerateApiKey(): Promise<{ apiKey: string }> {
        return this.request<{ apiKey: string }>('/settings/api-key/regenerate', {
            method: 'POST'
        })
    }

    // Users / Legacy (Keeping these for compatibility if needed, but redirects to staff)
    async getUsers(): Promise<User[]> {
        return this.getStaff()
    }

    async createUser(user: Partial<User> & { password?: string }): Promise<User> {
        return this.createStaff(user)
    }

    async deleteUser(id: string): Promise<void> {
        return this.request(`/auth/deleteUser/${id}`, {
            method: 'DELETE'
        })
    }
}

export const api = new ApiService()
