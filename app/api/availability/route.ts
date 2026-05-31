import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { getAvailableSlots } from '@/lib/scheduling'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const serviceId = searchParams.get('service_id')

  if (!date || !serviceId) {
    return NextResponse.json({ error: 'Missing date or service_id' }, { status: 400 })
  }

  const db = createServiceRoleClient()

  const [serviceRes, workingDayRes, bookingsRes, blockedRes] = await Promise.all([
    db.from('services').select('*').eq('id', serviceId).single(),
    db
      .from('working_days')
      .select('*')
      .eq('day_of_week', new Date(date + 'T00:00:00').getDay())
      .single(),
    db
      .from('bookings')
      .select('*')
      .eq('booking_date', date)
      .eq('status', 'confirmed'),
    db.from('blocked_slots').select('*').eq('blocked_date', date),
  ])

  if (serviceRes.error || !serviceRes.data) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const slots = getAvailableSlots(
    serviceRes.data.duration_minutes,
    bookingsRes.data ?? [],
    blockedRes.data ?? [],
    workingDayRes.data ?? undefined,
  )

  return NextResponse.json({ slots })
}
