import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET() {
  const db = createServiceRoleClient()
  const { data, error } = await db
    .from('services')
    .select('*')
    .order('duration_minutes', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ services: data })
}
