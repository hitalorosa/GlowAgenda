import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET() {
  const db = createServiceRoleClient()
  const { data, error } = await db
    .from('working_days')
    .select('*')
    .order('day_of_week', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ working_days: data })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { day_of_week, is_active } = body

  if (day_of_week === undefined || is_active === undefined) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const db = createServiceRoleClient()
  const { data, error } = await db
    .from('working_days')
    .update({ is_active })
    .eq('day_of_week', day_of_week)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ working_day: data })
}
