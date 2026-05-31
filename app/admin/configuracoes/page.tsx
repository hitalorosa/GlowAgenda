'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/icon'
import { C, FONTS, hhmm, prettyDate, WD_LONG, OPEN_MIN, CLOSE_MIN, SLOT_STEP } from '@/lib/design'

interface BlockItem { id: string; date: string; allDay: boolean; start?: number; end?: number; label?: string }
interface WorkingDay { day_of_week: number; is_active: boolean }

const DEFAULT_DAYS: WorkingDay[] = [
  { day_of_week: 0, is_active: false }, // Dom
  { day_of_week: 1, is_active: true  }, // Seg
  { day_of_week: 2, is_active: true  }, // Ter
  { day_of_week: 3, is_active: true  }, // Qua
  { day_of_week: 4, is_active: true  }, // Qui
  { day_of_week: 5, is_active: true  }, // Sex
  { day_of_week: 6, is_active: true  }, // Sáb
]

const ORDER = [1, 2, 3, 4, 5, 6, 0] // Seg → Sáb → Dom

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 46, height: 28, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 3,
      background: on ? C.taupe : '#d9cfc6', transition: 'background .2s', position: 'relative', flexShrink: 0,
    }}>
      <span style={{
        display: 'block', width: 22, height: 22, borderRadius: 99, background: '#fff',
        transform: on ? 'translateX(18px)' : 'translateX(0)', transition: 'transform .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: C.muted, textTransform: 'uppercase', margin: '0 0 10px 4px' }}>{children}</div>
}

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(DEFAULT_DAYS)
  const [blocks, setBlocks] = useState<BlockItem[]>([])

  // Tenta carregar do servidor; usa defaults se Supabase não estiver conectado
  useEffect(() => {
    fetch('/api/admin/working-days')
      .then(r => r.json())
      .then(d => { if (d.working_days?.length) setWorkingDays(d.working_days) })
      .catch(() => {})

    fetch('/api/admin/blocked-slots')
      .then(r => r.json())
      .then(d => { if (d.blocked_slots?.length) setBlocks(d.blocked_slots) })
      .catch(() => {})
  }, [])

  const toggleDay = async (dayOfWeek: number) => {
    const updated = workingDays.map(d =>
      d.day_of_week === dayOfWeek ? { ...d, is_active: !d.is_active } : d
    )
    setWorkingDays(updated)
    await fetch('/api/admin/working-days', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_of_week: dayOfWeek, is_active: updated.find(d => d.day_of_week === dayOfWeek)?.is_active }),
    }).catch(() => {})
  }

  const removeBlock = async (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
    await fetch(`/api/admin/blocked-slots/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  return (
    <div style={{ minHeight: '100vh', background: C.off, maxWidth: 480, margin: '0 auto' }}>
      {/* header */}
      <div style={{ background: C.white, padding: '18px 20px 14px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 5 }}>
        <button onClick={() => router.push('/admin/dashboard')} style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${C.line}`, background: C.off, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevronL" size={18} />
        </button>
        <h2 style={{ fontFamily: FONTS.playfair, fontSize: 20, color: C.ink, margin: 0, fontWeight: 500 }}>Configurações</h2>
      </div>

      <div style={{ flex: 1, padding: '20px 20px 40px' }}>

        {/* Janela de atendimento */}
        <SectionTitle>Janela de atendimento</SectionTitle>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.line}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
          <Icon name="clock" size={20} stroke={C.rose} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.montserrat, fontSize: 14, fontWeight: 600, color: C.ink }}>16:00 — 20:00</div>
            <div style={{ fontFamily: FONTS.montserrat, fontSize: 11.5, color: C.muted }}>Horário base do estúdio</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(216,182,164,0.22)', color: C.cafe, fontFamily: FONTS.montserrat, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4, padding: '5px 11px', borderRadius: 999 }}>fixo</span>
        </div>

        {/* Dias da semana */}
        <SectionTitle>Dias de atendimento</SectionTitle>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden', marginBottom: 26 }}>
          {ORDER.map((d, i) => {
            const wd = workingDays.find(w => w.day_of_week === d)
            const open = wd?.is_active ?? false
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < ORDER.length - 1 ? `1px solid ${C.faint}` : 'none' }}>
                <span style={{ flex: 1, fontFamily: FONTS.montserrat, fontSize: 14.5, fontWeight: 500, color: open ? C.ink : C.muted }}>{WD_LONG[d]}</span>
                <span style={{ fontFamily: FONTS.montserrat, fontSize: 12, color: C.muted, marginRight: 4 }}>{open ? 'aberto' : 'fechado'}</span>
                <Switch on={open} onClick={() => toggleDay(d)} />
              </div>
            )
          })}
        </div>

        {/* Bloqueios ativos */}
        <SectionTitle>Bloqueios ativos</SectionTitle>
        {blocks.length === 0 ? (
          <p style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 16, color: C.muted, padding: '4px 2px' }}>
            Nenhum bloqueio cadastrado.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {blocks.slice().sort((a, b) => a.date.localeCompare(b.date)).map(b => {
              const d = new Date(b.date + 'T00:00:00')
              return (
                <div key={b.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.line}`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: C.areia, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="ban" size={18} stroke={C.taupe} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONTS.montserrat, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{prettyDate(d)}</div>
                    <div style={{ fontFamily: FONTS.montserrat, fontSize: 11.5, color: C.muted }}>
                      {b.allDay ? 'Dia inteiro' : `${hhmm(b.start ?? OPEN_MIN)} – ${hhmm(b.end ?? CLOSE_MIN)}`}
                      {b.label ? ` · ${b.label}` : ''}
                    </div>
                  </div>
                  <button onClick={() => removeBlock(b.id)} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: C.areia, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="x" size={15} stroke={C.muted} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
