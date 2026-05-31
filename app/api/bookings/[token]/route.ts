import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const db = createServiceRoleClient()

  const { data, error } = await db
    .from('bookings')
    .select('*, service:services(id,name,duration_minutes)')
    .eq('cancel_token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ booking: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const db = createServiceRoleClient()

  const { data: existing } = await db
    .from('bookings')
    .select('id, status')
    .eq('cancel_token', token)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
  }

  if (existing.status === 'cancelled') {
    return NextResponse.json({ error: 'Agendamento já cancelado' }, { status: 400 })
  }

  const { error } = await db
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('cancel_token', token)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
