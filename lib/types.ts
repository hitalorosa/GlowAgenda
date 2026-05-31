export interface Service {
  id: string
  name: string
  duration_minutes: number
}

export interface WorkingDay {
  day_of_week: number
  is_active: boolean
  start_time: string
  end_time: string
}

export interface BlockedSlot {
  id: string
  blocked_date: string
  start_time: string | null
  end_time: string | null
  reason: string | null
  created_at: string
}

export interface Booking {
  id: string
  client_name: string
  client_phone: string
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled'
  cancel_token: string
  created_at: string
  service?: Service
}

export interface TimeSlot {
  time: string
  available: boolean
}
