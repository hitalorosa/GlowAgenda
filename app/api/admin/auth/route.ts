import { NextRequest, NextResponse } from 'next/server'
import { scryptSync, timingSafeEqual, randomBytes } from 'crypto'

// Credenciais da profissional — o hash é seguro para estar no código.
// Para trocar a senha, rode no terminal:
//   node -e "const {scryptSync,randomBytes}=require('crypto');const s=randomBytes(16).toString('hex');console.log(s+':'+scryptSync('NOVA_SENHA',s,64).toString('hex'))"
// e substitua ADMIN_HASH abaixo.
const ADMIN_EMAIL = 'natielle@luminails.studio'
const ADMIN_HASH  = '31eecf11a33d9b20d1dfa6c72e3670bc:9f7df6841346c3ceef5ceb927326ec9789ce018cb3b092d2a90fc44b149eabc5a2bc95587803940df53008d291f109c36b835cb478582fe1289e885ac27560bf'

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

  // Modo Supabase — ativado automaticamente quando conectar o projeto
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

  // Modo standalone — hash fixo no código
  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
  }

  const [salt, storedHex] = ADMIN_HASH.split(':')
  const derived = scryptSync(password, salt, 64)
  const stored  = Buffer.from(storedHex, 'hex')

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
