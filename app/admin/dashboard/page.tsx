'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Icon } from '@/components/icon'
import { C, FONTS, hhmm, prettyDate, shortDate, nextDays, dateKey, sameDay, durLabel, WD_SHORT, OPEN_MIN, CLOSE_MIN, SLOT_STEP } from '@/lib/design'
import type { Booking } from '@/lib/types'

// ── seed para o admin não abrir vazio ─────────────────────────
function seedAppointments(): Booking[] {
  const today = new Date(); today.setHours(0,0,0,0)
  const k = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
  return [
    { id: 'a1', cancel_token: 'LUMI-7K2Q9', client_name: 'Marina Alves',  client_phone: '(11) 99812-4477', service_id: '2', booking_date: k(0), start_time: '16:00', end_time: '17:30', status: 'confirmed', created_at: new Date().toISOString(), service: { id:'2', name:'Esmaltação normal', duration_minutes: 90 } },
    { id: 'a2', cancel_token: 'LUMI-3PX8M', client_name: 'Júlia Fontes',   client_phone: '(11) 99645-2031', service_id: '3', booking_date: k(0), start_time: '18:00', end_time: '20:00', status: 'confirmed', created_at: new Date().toISOString(), service: { id:'3', name:'Esmaltação em gel', duration_minutes: 120 } },
    { id: 'a3', cancel_token: 'LUMI-9WQ4Z', client_name: 'Beatriz Lemos',  client_phone: '(11) 99230-7788', service_id: '4', booking_date: k(1), start_time: '16:00', end_time: '19:00', status: 'confirmed', created_at: new Date().toISOString(), service: { id:'4', name:'Extensão de unha',  duration_minutes: 180 } },
    { id: 'a4', cancel_token: 'LUMI-1ND6T', client_name: 'Carla Menezes',  client_phone: '(11) 99771-5510', service_id: '1', booking_date: k(2), start_time: '16:00', end_time: '16:15', status: 'confirmed', created_at: new Date().toISOString(), service: { id:'1', name:'Spá de mão',        duration_minutes: 15  } },
  ]
}

// ── block sheet ───────────────────────────────────────────────
interface BlockItem { id: string; date: string; allDay: boolean; start?: number; end?: number; label?: string }

function BlockSheet({ sel, onClose, onSave }: { sel: Date; onClose: () => void; onSave: (b: BlockItem) => void }) {
  const [mode, setMode] = useState<'time' | 'day'>('day')
  const [start, setStart] = useState(OPEN_MIN)
  const [end, setEnd] = useState(OPEN_MIN + SLOT_STEP)
  const [label, setLabel] = useState('')

  const times: number[] = []
  for (let m = OPEN_MIN; m <= CLOSE_MIN; m += SLOT_STEP) times.push(m)

  const save = () => {
    const block: BlockItem = mode === 'day'
      ? { id: 'b' + Date.now(), date: dateKey(sel), allDay: true, label: label || 'Dia bloqueado' }
      : { id: 'b' + Date.now(), date: dateKey(sel), allDay: false, start, end: Math.max(end, start + SLOT_STEP), label: label || 'Bloqueado' }
    onSave(block)
    onClose()
  }

  const Seg = ({ val, cur, set, txt }: { val: 'time'|'day'; cur: 'time'|'day'; set: (v:'time'|'day') => void; txt: string }) => (
    <button onClick={() => set(val)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: FONTS.montserrat, fontSize: 13, fontWeight: 600, background: cur === val ? C.taupe : C.white, color: cur === val ? '#fff' : C.cafe, boxShadow: cur === val ? 'none' : `inset 0 0 0 1.5px ${C.line}` }}>{txt}</button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(63,54,47,0.35)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: C.off, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '10px 22px 36px', boxShadow: '0 -10px 40px rgba(0,0,0,0.15)', maxWidth: 480, width: '100%', margin: '0 auto' }}>
        <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONTS.playfair, fontSize: 20, color: C.ink, margin: 0, fontWeight: 500 }}>Bloquear · {shortDate(sel)}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 99, border: 'none', background: C.areia, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <Seg val="day" cur={mode} set={setMode} txt="Dia inteiro" />
          <Seg val="time" cur={mode} set={setMode} txt="Horário específico" />
        </div>

        {mode === 'time' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <select value={start} onChange={e => { const v = +e.target.value; setStart(v); if (end <= v) setEnd(v + SLOT_STEP) }}
              style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.white, fontFamily: FONTS.montserrat, fontSize: 14, color: C.ink, appearance: 'none' }}>
              {times.slice(0, -1).map(m => <option key={m} value={m}>{hhmm(m)}</option>)}
            </select>
            <span style={{ fontFamily: FONTS.montserrat, fontSize: 13, color: C.muted }}>até</span>
            <select value={end} onChange={e => setEnd(+e.target.value)}
              style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.white, fontFamily: FONTS.montserrat, fontSize: 14, color: C.ink, appearance: 'none' }}>
              {times.filter(m => m > start).map(m => <option key={m} value={m}>{hhmm(m)}</option>)}
            </select>
          </div>
        )}

        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Motivo (opcional) — ex.: folga, almoço"
          style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.white, fontFamily: FONTS.montserrat, fontSize: 14, color: C.ink, outline: 'none', marginBottom: 18, boxSizing: 'border-box' }} />

        <button onClick={save} style={{ width: '100%', border: 'none', cursor: 'pointer', background: C.taupe, color: C.white, fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 15, padding: '15px 22px', borderRadius: 16, boxShadow: '0 8px 20px rgba(141,123,109,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="ban" size={16} stroke="#fff" /> Confirmar bloqueio
        </button>
      </div>
    </div>
  )
}

// ── ApptRow ───────────────────────────────────────────────────
function ApptRow({ appt, onCancel }: { appt: Booking; onCancel: () => void }) {
  const dur = appt.service?.duration_minutes ?? 0
  const startMin = parseInt(appt.start_time) * 60 + parseInt(appt.start_time.split(':')[1])
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ width: 52, flexShrink: 0, textAlign: 'right', paddingTop: 14 }}>
        <div style={{ fontFamily: FONTS.montserrat, fontSize: 13, fontWeight: 700, color: C.ink }}>{appt.start_time.slice(0,5)}</div>
        <div style={{ fontFamily: FONTS.montserrat, fontSize: 10.5, color: C.muted }}>{appt.end_time.slice(0,5)}</div>
      </div>
      <div style={{ flex: 1, background: C.white, borderRadius: 14, padding: '13px 15px', border: `1.5px solid ${C.line}`, boxShadow: '0 2px 8px rgba(107,91,82,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontFamily: FONTS.playfair, fontSize: 16.5, color: C.ink, lineHeight: 1.15 }}>{appt.client_name}</div>
          <button onClick={onCancel} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}>
            <Icon name="x" size={16} stroke={C.muted} />
          </button>
        </div>
        <div style={{ fontFamily: FONTS.montserrat, fontSize: 12.5, color: C.cafe, marginTop: 3 }}>{appt.service?.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 9 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(216,182,164,0.22)', color: C.cafe, fontFamily: FONTS.montserrat, fontSize: 11.5, fontWeight: 600, padding: '5px 11px', borderRadius: 999 }}>
            <Icon name="clock" size={12} stroke={C.cafe} /> {durLabel(dur)}
          </span>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', fontFamily: FONTS.montserrat, fontSize: 11.5, color: C.muted }}>
            <Icon name="phone" size={13} stroke={C.rose} /> {appt.client_phone}
          </span>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, sub }: { icon: 'ban'|'calendar'; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '36px 24px', background: C.white, borderRadius: 18, border: `1px dashed ${C.line}` }}>
      <div style={{ width: 54, height: 54, borderRadius: 99, background: C.areia, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <Icon name={icon} size={24} stroke={C.taupe} />
      </div>
      <div style={{ fontFamily: FONTS.playfair, fontSize: 18, color: C.ink, fontWeight: 500 }}>{title}</div>
      <div style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 16, color: C.muted, marginTop: 2 }}>{sub}</div>
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const router = useRouter()
  const [sel, setSel] = useState<Date>(() => { const d = new Date(); d.setHours(0,0,0,0); return d })
  const [bookings, setBookings] = useState<Booking[]>(seedAppointments())
  const [blocks, setBlocks] = useState<BlockItem[]>([])
  const [showSheet, setShowSheet] = useState(false)
  const days = nextDays(21)

  const loadBookings = useCallback(async (date: Date) => {
    try {
      const res = await fetch(`/api/bookings?date=${dateKey(date)}`)
      const json = await res.json()
      if (res.ok && json.bookings?.length > 0) setBookings(json.bookings)
    } catch (_) {}
  }, [])

  useEffect(() => { loadBookings(sel) }, [sel, loadBookings])

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {})
    router.push('/admin')
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Cancelar este agendamento?')) return
    await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' }).catch(() => {})
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b))
  }

  const key = dateKey(sel)
  const dayBookings = bookings.filter(b => b.booking_date === key && b.status === 'confirmed')
  const dayBlock = blocks.find(b => b.date === key && b.allDay)
  const totalMin = dayBookings.reduce((s, b) => s + (b.service?.duration_minutes ?? 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: C.off, maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ background: C.white, padding: '18px 20px 14px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 5 }}>
        <Image src="/assets/logo-monogram.png" alt="" width={42} height={42} style={{ width: 42, height: 'auto', objectFit: 'contain' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 15, color: C.taupe, lineHeight: 1 }}>Olá,</div>
          <div style={{ fontFamily: FONTS.playfair, fontSize: 19, color: C.ink, lineHeight: 1.1 }}>Natielle</div>
        </div>
        <button onClick={() => router.push('/admin/configuracoes')} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.line}`, background: C.off, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="gear" size={19} />
        </button>
        <button onClick={handleLogout} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.line}`, background: C.off, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={18} stroke={C.muted} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* tira de dias */}
        <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 20px 4px' }}>
          {days.map(d => {
            const isSel = sameDay(d, sel)
            const dk = dateKey(d)
            const cnt = bookings.filter(b => b.booking_date === dk && b.status === 'confirmed').length
            const blk = blocks.some(b => b.date === dk && b.allDay)
            return (
              <button key={dk} onClick={() => setSel(d)} style={{ flexShrink: 0, width: 52, padding: '10px 0', borderRadius: 13, cursor: 'pointer', border: `1.5px solid ${isSel ? C.taupe : C.line}`, background: isSel ? C.taupe : C.white, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontFamily: FONTS.montserrat, fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: isSel ? 'rgba(255,255,255,0.85)' : C.muted, textTransform: 'uppercase' }}>{WD_SHORT[d.getDay()]}</span>
                <span style={{ fontFamily: FONTS.playfair, fontSize: 18, color: isSel ? '#fff' : C.ink }}>{d.getDate()}</span>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: blk ? (isSel ? 'rgba(255,255,255,0.6)' : C.muted) : cnt ? (isSel ? '#fff' : C.rose) : 'transparent' }} />
              </button>
            )
          })}
        </div>

        {/* título + stats */}
        <div style={{ padding: '16px 20px 4px' }}>
          <h2 style={{ fontFamily: FONTS.playfair, fontSize: 22, color: C.ink, margin: 0, fontWeight: 500 }}>{prettyDate(sel)}</h2>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            {[
              { n: dayBookings.length, label: dayBookings.length === 1 ? 'agendamento' : 'agendamentos' },
              { n: totalMin ? durLabel(totalMin) : '—', label: 'tempo reservado' },
              { n: dayBlock ? 'bloqueado' : 'aberto', label: 'status do dia' },
            ].map(({ n, label }) => (
              <div key={label}>
                <div style={{ fontFamily: FONTS.playfair, fontSize: 19, color: C.ink, lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: FONTS.montserrat, fontSize: 10.5, color: C.muted, marginTop: 3, letterSpacing: 0.3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* agenda */}
        <div style={{ padding: '14px 20px 4px' }}>
          {dayBlock ? (
            <EmptyState icon="ban" title="Dia bloqueado" sub={dayBlock.label || 'Você bloqueou o dia inteiro.'} />
          ) : dayBookings.length === 0 ? (
            <EmptyState icon="calendar" title="Nenhum agendamento" sub="Os horários deste dia estão livres." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dayBookings.map(b => (
                <ApptRow key={b.id} appt={b} onCancel={() => handleCancelBooking(b.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ações */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 20px 30px', borderTop: `1px solid ${C.line}`, background: C.white, display: 'flex', gap: 10 }}>
        <button onClick={() => setShowSheet(true)} style={{ flex: 1, cursor: 'pointer', background: 'transparent', color: C.cafe, fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 14, padding: '13px 20px', borderRadius: 16, border: `1.4px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="ban" size={15} stroke={C.cafe} /> Bloquear
        </button>
        <button onClick={() => router.push('/admin/configuracoes')} style={{ flex: 1, border: 'none', cursor: 'pointer', background: C.taupe, color: C.white, fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 14, padding: '13px 20px', borderRadius: 16, boxShadow: '0 8px 20px rgba(141,123,109,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="gear" size={16} stroke="#fff" /> Configurações
        </button>
      </div>

      {showSheet && <BlockSheet sel={sel} onClose={() => setShowSheet(false)} onSave={b => setBlocks(prev => [...prev, b])} />}
    </div>
  )
}
