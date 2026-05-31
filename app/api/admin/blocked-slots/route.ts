import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET() {
  const db = createServiceRoleClient()
  const { data, error } = await db
    .from('blocked_slots')
    .select('*')
    .order('blocked_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ blocked_slots: data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { blocked_date, start_time, end_time, reason } = body

  if (!blocked_date) {
    return NextResponse.json({ error: 'Data obrigatória' }, { status: 400 })
  }

  const db = createServiceRoleClient()
  const { data, error } = await db
    .from('blocked_slots')
    .insert({ blocked_date, start_time: start_time || null, end_time: end_time || null, reason })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ blocked_slot: data }, { status: 201 })
}
