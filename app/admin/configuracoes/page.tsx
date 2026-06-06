'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/icon'
import { C, FONTS, hhmm, prettyDate, WD_LONG, OPEN_MIN, CLOSE_MIN } from '@/lib/design'
import { useStudioConfig } from '@/lib/use-config'
import { SiteConfig } from '@/lib/site-config'

interface BlockItem { id: string; date: string; allDay: boolean; start?: number; end?: number; label?: string }
interface WorkingDay { day_of_week: number; is_active: boolean }

const DEFAULT_DAYS: WorkingDay[] = [
  { day_of_week: 0, is_active: false },
  { day_of_week: 1, is_active: true  },
  { day_of_week: 2, is_active: true  },
  { day_of_week: 3, is_active: true  },
  { day_of_week: 4, is_active: true  },
  { day_of_week: 5, is_active: true  },
  { day_of_week: 6, is_active: true  },
]

const ORDER = [1, 2, 3, 4, 5, 6, 0]

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

function InlineField({ label, value, onChange, type = 'text', prefix }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; prefix?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: `1px solid ${C.faint}` }}>
      <span style={{ fontFamily: FONTS.montserrat, fontSize: 13, color: C.muted, minWidth: 90, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
        {prefix && <span style={{ fontFamily: FONTS.montserrat, fontSize: 13.5, color: C.cafe, fontWeight: 600 }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          placeholder="—"
          onChange={e => onChange(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONTS.montserrat, fontSize: 13.5, color: C.ink, textAlign: 'right' }}
        />
      </div>
    </div>
  )
}

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { config, update } = useStudioConfig()

  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(DEFAULT_DAYS)
  const [blocks, setBlocks] = useState<BlockItem[]>([])

  // Draft editável localmente antes de salvar
  const [draft, setDraft] = useState<SiteConfig>(config)
  const [saved, setSaved] = useState(false)

  // Sincroniza draft quando config carrega do localStorage
  useEffect(() => { setDraft(config) }, [config])

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

  const handleSave = () => {
    update(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const updateServicePrice = (id: string, raw: string) => {
    const price = raw === '' ? null : Number(raw)
    setDraft(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, price: isNaN(price as number) ? s.price : price } : s),
    }))
  }

  const updateServiceBlurb = (id: string, blurb: string) => {
    setDraft(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, blurb } : s),
    }))
  }

  const updateFooter = (field: keyof SiteConfig['footer'], value: string) => {
    setDraft(prev => ({ ...prev, footer: { ...prev.footer, [field]: value } }))
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

      <div style={{ flex: 1, padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 26 }}>

        {/* ── Serviços e preços ───────────────────────────────── */}
        <div>
          <SectionTitle>Serviços e preços</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {draft.services.map(s => (
              <div key={s.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.faint}` }}>
                  <div style={{ fontFamily: FONTS.playfair, fontSize: 16, color: C.ink }}>{s.name}</div>
                </div>
                <InlineField
                  label="Descrição"
                  value={s.blurb}
                  onChange={v => updateServiceBlurb(s.id, v)}
                />
                <InlineField
                  label="Preço"
                  value={s.price !== null ? String(s.price) : ''}
                  onChange={v => updateServicePrice(s.id, v)}
                  type="number"
                  prefix="R$"
                />
              </div>
            ))}
          </div>
          <p style={{ fontFamily: FONTS.montserrat, fontSize: 11, color: C.muted, margin: '10px 4px 0', lineHeight: 1.6 }}>
            Deixe o preço em branco para não exibi-lo no site. Alterações visíveis após salvar.
          </p>
        </div>

        {/* ── Rodapé do site ──────────────────────────────────── */}
        <div>
          <SectionTitle>Rodapé do site</SectionTitle>
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
            <InlineField label="Instagram" value={draft.footer.instagram} onChange={v => updateFooter('instagram', v)} />
            <InlineField label="Endereço"  value={draft.footer.address}   onChange={v => updateFooter('address', v)} />
            <InlineField label="Obs."      value={draft.footer.note}      onChange={v => updateFooter('note', v)} />
          </div>
        </div>

        {/* ── Botão salvar ────────────────────────────────────── */}
        <button onClick={handleSave} style={{
          width: '100%', border: 'none', cursor: 'pointer',
          background: saved ? '#7a9e7e' : C.taupe, color: C.white,
          fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 15,
          padding: '15px 22px', borderRadius: 16, transition: 'background .3s',
          boxShadow: '0 8px 20px rgba(141,123,109,0.28)',
        }}>
          {saved ? '✓ Salvo com sucesso' : 'Salvar alterações'}
        </button>

        <div style={{ background: 'rgba(216,182,164,0.18)', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name="sparkle" size={16} stroke={C.rose} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontFamily: FONTS.montserrat, fontSize: 11.5, color: C.cafe, margin: 0, lineHeight: 1.6 }}>
            As alterações ficam salvas neste dispositivo. Para que todas as clientes vejam, conecte o Supabase (próximo passo do projeto).
          </p>
        </div>

        {/* ── Janela de atendimento ───────────────────────────── */}
        <div>
          <SectionTitle>Janela de atendimento</SectionTitle>
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.line}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="clock" size={20} stroke={C.rose} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONTS.montserrat, fontSize: 14, fontWeight: 600, color: C.ink }}>16:00 — 20:00</div>
              <div style={{ fontFamily: FONTS.montserrat, fontSize: 11.5, color: C.muted }}>Horário base do estúdio</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(216,182,164,0.22)', color: C.cafe, fontFamily: FONTS.montserrat, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4, padding: '5px 11px', borderRadius: 999 }}>fixo</span>
          </div>
        </div>

        {/* ── Dias de atendimento ─────────────────────────────── */}
        <div>
          <SectionTitle>Dias de atendimento</SectionTitle>
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
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
        </div>

        {/* ── Bloqueios ativos ────────────────────────────────── */}
        <div>
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
    </div>
  )
}
