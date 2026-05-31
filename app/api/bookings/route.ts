import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { getAvailableSlots, computeEndTime } from '@/lib/scheduling'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  const db = createServiceRoleClient()

  let query = db
    .from('bookings')
    .select('*, service:services(id,name,duration_minutes)')
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (date) {
    query = query.eq('booking_date', date)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookings: data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { client_name, client_phone, service_id, booking_date, start_time } = body

  if (!client_name || !client_phone || !service_id || !booking_date || !start_time) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const db = createServiceRoleClient()

  const { data: service, error: serviceError } = await db
    .from('services')
    .select('*')
    .eq('id', service_id)
    .single()

  if (serviceError || !service) {
    return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
  }

  const { data: workingDay } = await db
    .from('working_days')
    .select('*')
    .eq('day_of_week', new Date(booking_date + 'T00:00:00').getDay())
    .single()

  const { data: existingBookings } = await db
    .from('bookings')
    .select('*')
    .eq('booking_date', booking_date)
    .eq('status', 'confirmed')

  const { data: blockedSlots } = await db
    .from('blocked_slots')
    .select('*')
    .eq('blocked_date', booking_date)

  const available = getAvailableSlots(
    service.duration_minutes,
    existingBookings ?? [],
    blockedSlots ?? [],
    workingDay ?? undefined,
  )

  if (!available.includes(start_time)) {
    return NextResponse.json(
      { error: 'Horário não disponível. Por favor, escolha outro.' },
      { status: 409 },
    )
  }

  const end_time = computeEndTime(start_time, service.duration_minutes)

  const { data: booking, error } = await db
    .from('bookings')
    .insert({
      client_name,
      client_phone,
      service_id,
      booking_date,
      start_time,
      end_time,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ booking }, { status: 201 })
}
