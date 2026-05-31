'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Icon } from '@/components/icon'
import { C, FONTS } from '@/lib/design'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('natielle@luminails.studio')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'E-mail ou senha incorretos'); return }
      router.push('/admin/dashboard')
    } catch (_) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ val, set, type, ph, icon }: { val: string; set: (v: string) => void; type: string; ph: string; icon: 'mail' | 'lock' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: '0 14px', marginBottom: 12 }}>
      <Icon name={icon} size={18} stroke={C.rose} />
      <input type={type} value={val} placeholder={ph} onChange={e => set(e.target.value)}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '15px 0', fontFamily: FONTS.montserrat, fontSize: 14.5, color: C.ink }} />
    </div>
  )

  return (
    <div style={{ background: `radial-gradient(120% 80% at 50% 0%, ${C.white}, ${C.areia} 70%)`, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 28px', maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Image src="/assets/logo-monogram.png" alt="Lumi Nails Studios" width={96} height={96} style={{ width: 96, height: 'auto', margin: '0 auto', display: 'block' }} />
        <h1 style={{ fontFamily: FONTS.playfair, fontSize: 26, color: C.ink, margin: '10px 0 2px', fontWeight: 500 }}>Painel do estúdio</h1>
        <p style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 17, color: C.taupe, margin: 0 }}>Acesso da profissional</p>
      </div>

      <form onSubmit={handleLogin}>
        <Field val={email} set={setEmail} type="email" ph="E-mail" icon="mail" />
        <Field val={password} set={setPassword} type="password" ph="Senha" icon="lock" />

        {error && (
          <div style={{ background: 'rgba(168,88,78,0.08)', border: '1px solid rgba(168,88,78,0.28)', borderRadius: 12, padding: '12px 14px', marginBottom: 12, fontFamily: FONTS.montserrat, fontSize: 13, color: '#a8584e' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading} style={{ width: '100%', border: 'none', cursor: loading ? 'default' : 'pointer', background: loading ? '#cfc4ba' : C.taupe, color: C.white, fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 15, letterSpacing: 0.3, padding: '15px 22px', borderRadius: 16, boxShadow: '0 8px 20px rgba(141,123,109,0.30)' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.montserrat, fontSize: 12.5, fontWeight: 600, color: C.muted, marginTop: 16, width: '100%' }}>
          Esqueci minha senha
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 30, fontFamily: FONTS.montserrat, fontSize: 10.5, color: C.muted, letterSpacing: 0.5 }}>
        GlowAgenda · acesso restrito
      </div>
    </div>
  )
}
