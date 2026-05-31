import { NextRequest, NextResponse } from 'next/server'
import { scryptSync, timingSafeEqual, randomBytes } from 'crypto'

function setCookieAndRespond() {
  const token = randomBytes(32).toString('hex')
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return response
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  // Modo Supabase — ativado quando as variáveis de ambiente estiverem configuradas
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createBrowserClient } = await import('@/lib/supabase')
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
    }
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  }

  // Modo local — credenciais do .env.local
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    return NextResponse.json({ error: 'Servidor não configurado' }, { status: 500 })
  }

  if (email !== adminEmail) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
  }

  const [salt, storedHex] = adminPasswordHash.split(':')
  const derived = scryptSync(password, salt, 64)
  const stored = Buffer.from(storedHex, 'hex')

  if (derived.length !== stored.length || !timingSafeEqual(derived, stored)) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
  }

  return setCookieAndRespond()
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  return response
}
