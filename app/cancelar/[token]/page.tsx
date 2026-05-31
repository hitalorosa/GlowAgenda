'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Icon } from '@/components/icon'
import { C, FONTS, prettyDate, durLabel } from '@/lib/design'
import type { Booking } from '@/lib/types'

function SummaryRow({ icon, label, value, last }: { icon: 'user'|'sparkle'|'calendar'|'clock'; label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: last ? 'none' : `1px solid rgba(107,91,82,0.06)` }}>
      <Icon name={icon} size={18} stroke={C.taupe} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONTS.montserrat, fontSize: 10.5, color: C.muted, letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontFamily: FONTS.montserrat, fontSize: 14, fontWeight: 500, color: C.ink }}>{value}</div>
      </div>
    </div>
  )
}

export default function CancelarPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/bookings/${token}`)
      .then(r => r.json())
      .then(d => {
        setBooking(d.booking)
        if (d.booking?.status === 'cancelled') setDone(true)
      })
      .catch(() => setError('Agendamento não encontrado.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${token}`, { method: 'DELETE' })
      if (res.ok) { setDone(true) }
      else { const j = await res.json(); setError(j.error ?? 'Erro ao cancelar.') }
    } catch (_) {
      setError('Erro de conexão.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.off }}>
      <p style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 18, color: C.muted }}>Carregando...</p>
    </div>
  )

  if (error && !booking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.off, padding: 32, textAlign: 'center' }}>
      <div>
        <div style={{ width: 64, height: 64, borderRadius: 99, background: C.areia, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Icon name="x" size={28} stroke={C.taupe} />
        </div>
        <h2 style={{ fontFamily: FONTS.playfair, fontSize: 22, color: C.ink, fontWeight: 500, margin: '0 0 8px' }}>Link inválido</h2>
        <p style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 17, color: C.muted, margin: '0 0 24px' }}>
          O link pode estar incorreto ou o agendamento foi removido.
        </p>
        <button onClick={() => router.push('/')} style={{ border: 'none', cursor: 'pointer', background: C.taupe, color: C.white, fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 15, padding: '14px 32px', borderRadius: 16, boxShadow: '0 8px 20px rgba(141,123,109,0.28)' }}>
          Voltar ao início
        </button>
      </div>
    </div>
  )

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.off, padding: '40px 30px', textAlign: 'center' }}>
      <div style={{ width: 70, height: 70, borderRadius: 99, background: C.areia, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="checkCircle" size={34} stroke={C.taupe} />
      </div>
      <h2 style={{ fontFamily: FONTS.playfair, fontSize: 25, color: C.ink, margin: '18px 0 6px', fontWeight: 500 }}>Agendamento cancelado</h2>
      <p style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 17, color: C.taupe, lineHeight: 1.5, maxWidth: 280 }}>
        O horário já foi liberado na agenda. Esperamos te ver em breve!
      </p>
      <button onClick={() => router.push('/agendar')} style={{ border: 'none', cursor: 'pointer', background: C.taupe, color: C.white, fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 15, padding: '14px 32px', borderRadius: 16, boxShadow: '0 8px 20px rgba(141,123,109,0.28)', marginTop: 26 }}>
        Fazer novo agendamento
      </button>
    </div>
  )

  const b = booking!
  const dateObj = new Date(b.booking_date + 'T00:00:00')

  return (
    <div style={{ minHeight: '100vh', background: C.off, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ flex: 1, padding: '50px 24px 8px' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Image src="/assets/logo-monogram.png" alt="" width={70} height={70} style={{ width: 70, height: 'auto', margin: '0 auto', display: 'block' }} />
        </div>
        <h2 style={{ fontFamily: FONTS.playfair, fontSize: 23, color: C.ink, textAlign: 'center', margin: '8px 0 4px', fontWeight: 500 }}>Cancelar agendamento</h2>
        <p style={{ fontFamily: FONTS.montserrat, fontSize: 13, color: C.muted, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
          Confira os dados antes de confirmar o cancelamento.
        </p>

        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.line}`, padding: 18, marginBottom: 20 }}>
          <SummaryRow icon="user" label="Cliente" value={b.client_name} />
          <SummaryRow icon="sparkle" label="Serviço" value={b.service?.name ?? b.service_id} />
          <SummaryRow icon="calendar" label="Data" value={prettyDate(dateObj)} />
          <SummaryRow icon="clock" label="Horário"
            value={`${b.start_time.slice(0,5)} – ${b.end_time.slice(0,5)}${b.service ? ' · ' + durLabel(b.service.duration_minutes) : ''}`}
            last />
        </div>

        {error && (
          <div style={{ background: 'rgba(168,88,78,0.08)', border: '1px solid rgba(168,88,78,0.28)', borderRadius: 12, padding: '12px 14px', fontFamily: FONTS.montserrat, fontSize: 13, color: '#a8584e', marginBottom: 12 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ padding: '14px 24px 36px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={handleCancel} disabled={cancelling} style={{ width: '100%', border: 'none', cursor: cancelling ? 'default' : 'pointer', background: '#a8584e', color: C.white, fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 15, padding: '15px 22px', borderRadius: 16, boxShadow: '0 8px 20px rgba(168,88,78,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="x" size={16} stroke="#fff" />
          {cancelling ? 'Cancelando...' : 'Confirmar cancelamento'}
        </button>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.montserrat, fontSize: 13, fontWeight: 600, color: C.muted }}>
          Manter meu horário
        </button>
      </div>
    </div>
  )
}
