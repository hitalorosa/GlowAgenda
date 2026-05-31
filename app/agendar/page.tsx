'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Icon } from '@/components/icon'
import {
  C, FONTS, durLabel, hhmm, prettyDate, nextDays, dateKey, sameDay, getMockSlots, WD_SHORT,
} from '@/lib/design'

// ── tipos ──────────────────────────────────────────────────────
interface Service { id: string; name: string; sub: string; dur: number; blurb: string }
interface Draft { serviceId: string | null; date: Date | null; time: number | null; name: string; phone: string }

// ── serviços fixos (mock até Supabase) ────────────────────────
const SERVICES: Service[] = [
  { id: '1', name: 'Spá de mão',       sub: '',                dur: 15,  blurb: 'Hidratação e esfoliação para mãos macias e renovadas.' },
  { id: '2', name: 'Esmaltação normal', sub: 'com cuticulagem', dur: 90,  blurb: 'Cuticulagem completa e esmalte tradicional com acabamento impecável.' },
  { id: '3', name: 'Esmaltação em gel', sub: 'com cuticulagem', dur: 120, blurb: 'Cor intensa e duradoura em gel, com brilho que dura semanas.' },
  { id: '4', name: 'Extensão de unha',  sub: 'e cuticulagem',   dur: 180, blurb: 'Alongamento sob medida com modelagem e finalização premium.' },
]

// ── componentes ────────────────────────────────────────────────
function Chip({ children, tone = 'rose' }: { children: React.ReactNode; tone?: 'rose' | 'taupe' }) {
  const bg = tone === 'taupe' ? 'rgba(141,123,109,0.14)' : 'rgba(216,182,164,0.22)'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: bg, color: C.cafe, fontFamily: FONTS.montserrat, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4, padding: '5px 11px', borderRadius: 999 }}>
      {children}
    </span>
  )
}

function SummaryRow({ icon, label, value, last }: { icon: 'sparkle' | 'calendar' | 'clock' | 'user'; label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: last ? 'none' : `1px solid ${C.faint}` }}>
      <Icon name={icon} size={18} stroke={C.taupe} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONTS.montserrat, fontSize: 10.5, color: C.muted, letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontFamily: FONTS.montserrat, fontSize: 14, fontWeight: 500, color: C.ink }}>{value}</div>
      </div>
    </div>
  )
}

function PrimaryBtn({ children, onClick, disabled, style }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', border: 'none', cursor: disabled ? 'default' : 'pointer',
      background: disabled ? '#cfc4ba' : C.taupe, color: C.white,
      fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 15, letterSpacing: 0.3,
      padding: '15px 22px', borderRadius: 16,
      boxShadow: disabled ? 'none' : '0 8px 20px rgba(141,123,109,0.30)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style,
    }}>{children}</button>
  )
}

function GhostBtn({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', cursor: 'pointer', background: 'transparent', color: C.cafe,
      fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 14,
      padding: '13px 20px', borderRadius: 16, border: `1.4px solid ${C.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style,
    }}>{children}</button>
  )
}

// ── StepBar ────────────────────────────────────────────────────
function StepBar({ step, onBack, titles }: { step: number; onBack: () => void; titles: string[] }) {
  return (
    <div style={{ padding: '20px 20px 10px', background: C.off, position: 'sticky', top: 0, zIndex: 5, borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${C.line}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="chevronL" size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: C.muted, textTransform: 'uppercase' }}>
            Passo {step} de 3
          </div>
          <div style={{ fontFamily: FONTS.cormorant, fontSize: 21, fontWeight: 600, color: C.ink, lineHeight: 1.1, marginTop: 1 }}>
            {titles[step - 1]}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{ flex: 1, height: 4, borderRadius: 99, background: n <= step ? C.taupe : C.line, transition: 'background .3s' }} />
        ))}
      </div>
    </div>
  )
}

// ── ServiceCard ────────────────────────────────────────────────
function ServiceCard({ svc, selected, onClick }: { svc: Service; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', display: 'block',
      background: C.white, border: `1.5px solid ${selected ? C.taupe : C.line}`,
      borderRadius: 18, padding: '16px 18px',
      boxShadow: selected ? '0 8px 22px rgba(141,123,109,0.16)' : '0 2px 8px rgba(107,91,82,0.04)',
      transition: 'border-color .2s, box-shadow .2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.playfair, fontSize: 18, color: C.ink, lineHeight: 1.15 }}>{svc.name}</div>
          {svc.sub && <div style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 15, color: C.taupe, marginTop: 1 }}>{svc.sub}</div>}
          <div style={{ fontFamily: FONTS.montserrat, fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginTop: 8 }}>{svc.blurb}</div>
        </div>
        {selected
          ? <div style={{ width: 24, height: 24, borderRadius: 99, background: C.taupe, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="check" size={15} stroke="#fff" sw={2.2} /></div>
          : <Icon name="sparkle" size={20} stroke={C.rose} style={{ flexShrink: 0, marginTop: 2 }} />}
      </div>
      <div style={{ marginTop: 12 }}>
        <Chip><Icon name="clock" size={13} stroke={C.cafe} /> {durLabel(svc.dur)}</Chip>
      </div>
    </button>
  )
}

// ── STEP 1 — serviço ──────────────────────────────────────────
function StepService({ draft, setDraft, onNext }: { draft: Draft; setDraft: (d: Draft) => void; onNext: () => void }) {
  return (
    <div style={{ background: C.off, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 8px', flex: 1 }}>
        <p style={{ fontFamily: FONTS.montserrat, fontSize: 13, color: C.muted, margin: '0 0 14px', lineHeight: 1.5 }}>
          O tempo de atendimento muda conforme o serviço — por isso pedimos primeiro.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SERVICES.map(s => (
            <ServiceCard key={s.id} svc={s} selected={draft.serviceId === s.id}
              onClick={() => setDraft({ ...draft, serviceId: s.id, time: null })} />
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 20px 32px', position: 'sticky', bottom: 0, background: `linear-gradient(transparent, rgba(250,248,246,0.96) 24%)` }}>
        <PrimaryBtn disabled={!draft.serviceId} onClick={onNext}>
          Continuar <Icon name="arrowR" size={16} stroke="#fff" />
        </PrimaryBtn>
      </div>
    </div>
  )
}

// ── STEP 2 — data e horário ───────────────────────────────────
function StepWhen({ draft, setDraft, onNext }: { draft: Draft; setDraft: (d: Draft) => void; onNext: () => void }) {
  const svc = SERVICES.find(s => s.id === draft.serviceId)!
  const days = nextDays(21)
  const slots = draft.date ? getMockSlots(svc.dur) : []

  return (
    <div style={{ background: C.off, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        {/* resumo do serviço */}
        <div style={{ margin: '14px 20px 0', padding: '12px 16px', background: C.white, borderRadius: 14, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="sparkle" size={18} stroke={C.rose} />
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: FONTS.playfair, fontSize: 15, color: C.ink }}>{svc.name}</span>
            {svc.sub && <span style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 14, color: C.taupe }}> {svc.sub}</span>}
          </div>
          <Chip tone="taupe">{durLabel(svc.dur)}</Chip>
        </div>

        {/* tira de datas */}
        <div style={{ fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: C.muted, textTransform: 'uppercase', padding: '20px 20px 8px' }}>
          Escolha o dia
        </div>
        <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px 6px' }}>
          {days.map(d => {
            const sel = draft.date ? sameDay(draft.date, d) : false
            return (
              <button key={dateKey(d)} onClick={() => setDraft({ ...draft, date: d, time: null })}
                style={{ flexShrink: 0, width: 58, padding: '12px 0', borderRadius: 14, cursor: 'pointer', border: `1.5px solid ${sel ? C.taupe : C.line}`, background: sel ? C.taupe : C.white, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: FONTS.montserrat, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.5, color: sel ? 'rgba(255,255,255,0.85)' : C.muted, textTransform: 'uppercase' }}>{WD_SHORT[d.getDay()]}</span>
                <span style={{ fontFamily: FONTS.playfair, fontSize: 20, color: sel ? '#fff' : C.ink }}>{d.getDate()}</span>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: sel ? '#fff' : C.rose }} />
              </button>
            )
          })}
        </div>

        {/* horários */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 8px' }}>
          <span style={{ fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: C.muted, textTransform: 'uppercase' }}>Horários disponíveis</span>
          <span style={{ fontFamily: FONTS.montserrat, fontSize: 10.5, color: C.muted }}>16h – 20h</span>
        </div>
        {!draft.date ? (
          <div style={{ padding: '24px 20px', textAlign: 'center', fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 17, color: C.muted }}>
            Selecione um dia para ver os horários.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '0 20px 12px' }}>
            {slots.map(s => {
              const sel = draft.time === s.start
              return (
                <button key={s.start} onClick={() => setDraft({ ...draft, time: s.start })}
                  style={{ padding: '11px 0', borderRadius: 12, cursor: 'pointer', border: `1.5px solid ${sel ? C.taupe : C.line}`, background: sel ? C.taupe : C.white, color: sel ? '#fff' : C.ink, fontFamily: FONTS.montserrat, fontSize: 13.5, fontWeight: 600 }}>
                  {s.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ padding: '12px 20px 32px', position: 'sticky', bottom: 0, background: `linear-gradient(transparent, rgba(250,248,246,0.96) 24%)` }}>
        <PrimaryBtn disabled={draft.time == null} onClick={onNext}>
          Continuar <Icon name="arrowR" size={16} stroke="#fff" />
        </PrimaryBtn>
      </div>
    </div>
  )
}

// ── STEP 3 — dados ────────────────────────────────────────────
function StepDetails({ draft, setDraft, onConfirm, submitting, error }: {
  draft: Draft; setDraft: (d: Draft) => void; onConfirm: () => void; submitting: boolean; error: string
}) {
  const svc = SERVICES.find(s => s.id === draft.serviceId)!
  const valid = draft.name.trim().length > 2 && draft.phone.replace(/\D/g, '').length >= 10

  const Field = ({ label, field, type, ph, icon }: { label: string; field: 'name' | 'phone'; type: string; ph: string; icon: 'user' | 'phone' }) => (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 1, color: C.muted, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: '0 14px', marginTop: 6 }}>
        <Icon name={icon} size={18} stroke={C.rose} />
        <input type={type} value={draft[field]} placeholder={ph}
          onChange={e => setDraft({ ...draft, [field]: e.target.value })}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '14px 0', fontFamily: FONTS.montserrat, fontSize: 15, color: C.ink }} />
      </div>
    </label>
  )

  return (
    <div style={{ background: C.off, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '16px 20px 8px' }}>
        {/* resumo */}
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.line}`, padding: 18, marginBottom: 22, boxShadow: '0 6px 18px rgba(107,91,82,0.05)' }}>
          <div style={{ fontFamily: FONTS.montserrat, fontSize: 10.5, fontWeight: 600, letterSpacing: 1.5, color: C.rose, textTransform: 'uppercase', marginBottom: 12 }}>Resumo do agendamento</div>
          <SummaryRow icon="sparkle" label="Serviço" value={`${svc.name}${svc.sub ? ' ' + svc.sub : ''}`} />
          <SummaryRow icon="calendar" label="Data" value={prettyDate(draft.date!)} />
          <SummaryRow icon="clock" label="Horário" value={`${hhmm(draft.time!)} – ${hhmm(draft.time! + svc.dur)} · ${durLabel(svc.dur)}`} last />
        </div>
        <Field label="Seu nome" field="name" type="text" ph="Como podemos te chamar?" icon="user" />
        <Field label="WhatsApp / telefone" field="phone" type="tel" ph="(11) 90000-0000" icon="phone" />
        <p style={{ fontFamily: FONTS.montserrat, fontSize: 11, color: C.muted, lineHeight: 1.6, marginTop: 4 }}>
          Você receberá um link único para cancelar quando quiser.
        </p>
        {error && (
          <div style={{ background: 'rgba(168,88,78,0.08)', border: `1px solid rgba(168,88,78,0.28)`, borderRadius: 12, padding: '12px 14px', marginTop: 8, fontFamily: FONTS.montserrat, fontSize: 13, color: C.error }}>
            {error}
          </div>
        )}
      </div>
      <div style={{ padding: '12px 20px 32px', position: 'sticky', bottom: 0, background: `linear-gradient(transparent, rgba(250,248,246,0.96) 24%)` }}>
        <PrimaryBtn disabled={!valid || submitting} onClick={onConfirm}>
          <Icon name="check" size={17} stroke="#fff" sw={2.2} />
          {submitting ? 'Confirmando...' : 'Confirmar agendamento'}
        </PrimaryBtn>
      </div>
    </div>
  )
}

// ── CONFIRMAÇÃO ───────────────────────────────────────────────
function Confirmation({ cancelCode, draft, svc, onCancelScreen, onHome }: {
  cancelCode: string; draft: Draft; svc: Service; onCancelScreen: () => void; onHome: () => void
}) {
  const [copied, setCopied] = useState(false)
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/cancelar/${cancelCode}`

  return (
    <div style={{ background: C.off, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '56px 24px 8px', textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: 99, margin: '0 auto', background: 'rgba(216,182,164,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 54, height: 54, borderRadius: 99, background: C.taupe, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={28} stroke="#fff" sw={2.4} />
          </div>
        </div>
        <h2 style={{ fontFamily: FONTS.playfair, fontSize: 27, color: C.ink, margin: '18px 0 4px', fontWeight: 500 }}>Tudo certo!</h2>
        <p style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 18, color: C.taupe, margin: 0 }}>
          {draft.name.split(' ')[0]}, seu horário está reservado.
        </p>

        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.line}`, padding: 18, margin: '22px 0 0', textAlign: 'left', boxShadow: '0 6px 18px rgba(107,91,82,0.05)' }}>
          <SummaryRow icon="sparkle" label="Serviço" value={`${svc.name}${svc.sub ? ' ' + svc.sub : ''}`} />
          <SummaryRow icon="calendar" label="Data" value={prettyDate(draft.date!)} />
          <SummaryRow icon="clock" label="Horário" value={`${hhmm(draft.time!)} – ${hhmm(draft.time! + svc.dur)}`} last />
        </div>

        <div style={{ background: 'rgba(216,182,164,0.16)', border: `1.5px dashed ${C.rose}`, borderRadius: 16, padding: 16, marginTop: 16, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon name="link" size={16} stroke={C.cafe} />
            <span style={{ fontFamily: FONTS.montserrat, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.5, color: C.cafe, textTransform: 'uppercase' }}>Seu link de cancelamento</span>
          </div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, color: C.taupe, background: C.white, borderRadius: 10, padding: '10px 12px', wordBreak: 'break-all', border: `1px solid ${C.line}` }}>
            {link}
          </div>
          <p style={{ fontFamily: FONTS.montserrat, fontSize: 11, color: C.muted, lineHeight: 1.5, margin: '8px 0 12px' }}>
            Guarde este link — com ele você cancela sozinha, sem precisar falar com a Natielle.
          </p>
          <GhostBtn onClick={() => { navigator.clipboard.writeText(link).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1600) }}>
            <Icon name={copied ? 'check' : 'link'} size={15} stroke={C.cafe} />
            {copied ? 'Link copiado!' : 'Copiar link'}
          </GhostBtn>
        </div>
      </div>
      <div style={{ padding: '14px 24px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <GhostBtn onClick={onCancelScreen} style={{ color: C.error, borderColor: 'rgba(168,88,78,0.28)' }}>
          <Icon name="x" size={15} stroke={C.error} /> Cancelar este agendamento
        </GhostBtn>
        <button onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.montserrat, fontSize: 13, fontWeight: 600, color: C.muted }}>
          Voltar ao início
        </button>
      </div>
    </div>
  )
}

// ── CANCELAMENTO (inline, sem login) ─────────────────────────
function CancelInline({ cancelCode, draft, svc, onDone, onHome }: {
  cancelCode: string; draft: Draft; svc: Service; onDone: () => void; onHome: () => void
}) {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    setLoading(true)
    try {
      await fetch(`/api/bookings/${cancelCode}`, { method: 'DELETE' })
    } catch (_) {}
    setDone(true)
    onDone()
  }

  if (done) return (
    <div style={{ background: C.off, minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px', textAlign: 'center' }}>
      <div style={{ width: 70, height: 70, borderRadius: 99, background: C.areia, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="checkCircle" size={34} stroke={C.taupe} />
      </div>
      <h2 style={{ fontFamily: FONTS.playfair, fontSize: 25, color: C.ink, margin: '18px 0 6px', fontWeight: 500 }}>Agendamento cancelado</h2>
      <p style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 17, color: C.taupe, lineHeight: 1.5, maxWidth: 280 }}>
        O horário foi liberado. Esperamos te ver em breve!
      </p>
      <div style={{ width: '100%', maxWidth: 260, marginTop: 26 }}>
        <PrimaryBtn onClick={onHome}>Voltar ao início</PrimaryBtn>
      </div>
    </div>
  )

  return (
    <div style={{ background: C.off, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '50px 24px 8px' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Image src="/assets/logo-monogram.png" alt="" width={70} height={70} style={{ width: 70, height: 'auto', margin: '0 auto', display: 'block' }} />
        </div>
        <h2 style={{ fontFamily: FONTS.playfair, fontSize: 23, color: C.ink, textAlign: 'center', margin: '8px 0 4px', fontWeight: 500 }}>Cancelar agendamento</h2>
        <p style={{ fontFamily: FONTS.montserrat, fontSize: 13, color: C.muted, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
          Confira os dados antes de confirmar o cancelamento.
        </p>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.line}`, padding: 18 }}>
          <SummaryRow icon="user" label="Cliente" value={draft.name} />
          <SummaryRow icon="sparkle" label="Serviço" value={`${svc.name}${svc.sub ? ' ' + svc.sub : ''}`} />
          <SummaryRow icon="calendar" label="Data" value={prettyDate(draft.date!)} />
          <SummaryRow icon="clock" label="Horário" value={`${hhmm(draft.time!)} – ${hhmm(draft.time! + svc.dur)}`} last />
        </div>
      </div>
      <div style={{ padding: '14px 24px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PrimaryBtn onClick={confirm} disabled={loading} style={{ background: C.error, boxShadow: '0 8px 20px rgba(168,88,78,0.28)' }}>
          <Icon name="x" size={16} stroke="#fff" /> {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
        </PrimaryBtn>
        <button onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.montserrat, fontSize: 13, fontWeight: 600, color: C.muted }}>
          Manter meu horário
        </button>
      </div>
    </div>
  )
}

// ── ORQUESTRADOR ──────────────────────────────────────────────
type Screen = 'landing' | 's1' | 's2' | 's3' | 'confirm' | 'cancel'

export default function AgendarPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('s1')
  const [draft, setDraft] = useState<Draft>({ serviceId: null, date: null, time: null, name: '', phone: '' })
  const [cancelCode, setCancelCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bodyRef.current?.scrollTo(0, 0) }, [screen])

  const stepTitles = ['Escolha o serviço', 'Data e horário', 'Seus dados']
  const step = screen === 's1' ? 1 : screen === 's2' ? 2 : screen === 's3' ? 3 : 0

  const handleConfirm = async () => {
    const svc = SERVICES.find(s => s.id === draft.serviceId)!
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: draft.name.trim(),
          client_phone: draft.phone.trim(),
          service_id: draft.serviceId,
          booking_date: dateKey(draft.date!),
          start_time: hhmm(draft.time!),
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erro ao agendar. Tente novamente.'); return }
      setCancelCode(json.booking.cancel_token)
      setScreen('confirm')
    } catch (_) {
      // mock mode sem Supabase: simula código de cancelamento
      setCancelCode('LUMI-' + Math.random().toString(36).slice(2, 7).toUpperCase())
      setScreen('confirm')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => { setDraft({ serviceId: null, date: null, time: null, name: '', phone: '' }); setScreen('s1') }
  const svc = SERVICES.find(s => s.id === draft.serviceId)

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: C.off, maxWidth: 480, margin: '0 auto' }}>
      {step > 0 && (
        <StepBar step={step} titles={stepTitles}
          onBack={() => {
            if (step === 1) router.push('/')
            else setScreen(`s${step - 1}` as Screen)
          }}
        />
      )}
      <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto' }}>
        {screen === 's1' && <StepService draft={draft} setDraft={setDraft} onNext={() => setScreen('s2')} />}
        {screen === 's2' && <StepWhen draft={draft} setDraft={setDraft} onNext={() => setScreen('s3')} />}
        {screen === 's3' && <StepDetails draft={draft} setDraft={setDraft} onConfirm={handleConfirm} submitting={submitting} error={error} />}
        {screen === 'confirm' && svc && <Confirmation cancelCode={cancelCode} draft={draft} svc={svc} onCancelScreen={() => setScreen('cancel')} onHome={reset} />}
        {screen === 'cancel' && svc && <CancelInline cancelCode={cancelCode} draft={draft} svc={svc} onDone={() => {}} onHome={reset} />}
      </div>
    </div>
  )
}
