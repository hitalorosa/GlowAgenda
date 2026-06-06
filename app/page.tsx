'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@/components/icon'
import { C, FONTS, durLabel } from '@/lib/design'
import { useStudioConfig } from '@/lib/use-config'

function Photo({ label, h = 150 }: { label: string; h?: number }) {
  const id = label.replace(/\s/g, '')
  return (
    <div style={{ height: h, borderRadius: 18, overflow: 'hidden', position: 'relative', background: C.areia, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="none">
        <defs>
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="14" height="14" fill={C.areia} />
            <line x1="0" y1="0" x2="0" y2="14" stroke={C.rose} strokeOpacity="0.30" strokeWidth="7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <span style={{ position: 'relative', fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: 0.5, color: C.cafe, background: 'rgba(250,248,246,0.82)', padding: '5px 10px', borderRadius: 999 }}>{label}</span>
    </div>
  )
}

export default function HomePage() {
  const { config } = useStudioConfig()
  const { services, footer } = config

  return (
    <div style={{ background: C.off, minHeight: '100vh', paddingBottom: 96 }}>

      {/* HERO */}
      <div style={{
        background: `radial-gradient(120% 90% at 50% -10%, ${C.white} 0%, ${C.areia} 55%, ${C.off} 100%)`,
        padding: '54px 24px 36px', textAlign: 'center', position: 'relative',
        borderBottomLeftRadius: 34, borderBottomRightRadius: 34,
      }}>
        <Image
          src="/assets/logo-vertical.png"
          alt="Lumi Nails Studios"
          width={184} height={200}
          style={{ width: 184, height: 'auto', maxWidth: '64%', display: 'block', margin: '0 auto' }}
          priority
        />
        <h1 style={{ fontFamily: FONTS.playfair, fontSize: 22, fontWeight: 500, color: C.ink, margin: '16px auto 6px', maxWidth: 300, lineHeight: 1.3 }}>
          Seu momento de autocuidado começa aqui
        </h1>
        <p style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 18, color: C.taupe, margin: '0 auto', maxWidth: 280, lineHeight: 1.4 }}>
          Agende online e reserve um tempo para você
        </p>
        <div style={{ marginTop: 22, maxWidth: 250, margin: '22px auto 0' }}>
          <Link href="/agendar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', border: 'none', cursor: 'pointer', background: C.taupe, color: C.white, fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 15, letterSpacing: 0.3, padding: '15px 22px', borderRadius: 16, boxShadow: '0 8px 20px rgba(141,123,109,0.30)', textDecoration: 'none' }}>
            <Icon name="sparkle" size={16} stroke="#fff" /> Agendar horário
          </Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 18, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: FONTS.montserrat, fontSize: 11.5, color: C.muted, display: 'inline-flex', gap: 5, alignItems: 'center' }}>
            <Icon name="clock" size={14} stroke={C.rose} /> Seg–Sáb · 16h às 20h
          </span>
          <span style={{ fontFamily: FONTS.montserrat, fontSize: 11.5, color: C.muted, display: 'inline-flex', gap: 5, alignItems: 'center' }}>
            <Icon name="map" size={14} stroke={C.rose} /> São Paulo · SP
          </span>
        </div>
      </div>

      {/* SERVIÇOS */}
      <div style={{ padding: '30px 20px 8px' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.rose, textTransform: 'uppercase' }}>Nossos serviços</div>
          <h2 style={{ fontFamily: FONTS.playfair, fontSize: 26, color: C.ink, margin: '4px 0 0', fontWeight: 500 }}>Escolha seu cuidado</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
          {services.map(s => (
            <Link key={s.id} href="/agendar" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 18, padding: '16px 18px', boxShadow: '0 2px 8px rgba(107,91,82,0.04)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONTS.playfair, fontSize: 18, color: C.ink, lineHeight: 1.15 }}>{s.name}</div>
                    {s.sub && <div style={{ fontFamily: FONTS.cormorant, fontStyle: 'italic', fontSize: 15, color: C.taupe, marginTop: 1 }}>{s.sub}</div>}
                    <div style={{ fontFamily: FONTS.montserrat, fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginTop: 8 }}>{s.blurb}</div>
                  </div>
                  <Icon name="sparkle" size={20} stroke={C.rose} style={{ flexShrink: 0, marginTop: 2 }} />
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(216,182,164,0.22)', color: C.cafe, fontFamily: FONTS.montserrat, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4, padding: '5px 11px', borderRadius: 999 }}>
                    <Icon name="clock" size={13} stroke={C.cafe} /> {durLabel(s.dur)}
                  </span>
                  {s.price !== null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(141,123,109,0.12)', color: C.taupe, fontFamily: FONTS.montserrat, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, padding: '5px 11px', borderRadius: 999 }}>
                      R$ {s.price}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* PORTFÓLIO */}
      <div style={{ padding: '28px 20px 8px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.rose, textTransform: 'uppercase' }}>Portfólio</div>
          <h2 style={{ fontFamily: FONTS.playfair, fontSize: 26, color: C.ink, margin: '4px 0 0', fontWeight: 500 }}>Trabalhos recentes</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Photo label="foto · unhas em gel" h={150} />
          <Photo label="foto · nail art" h={150} />
          <Photo label="foto · francesinha" h={120} />
          <Photo label="foto · extensão" h={120} />
        </div>
      </div>

      {/* ASSINATURA */}
      <div style={{ padding: '30px 24px 10px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <Icon name="sparkle" size={22} stroke={C.rose} style={{ margin: '0 auto', display: 'block' }} />
        <p style={{ fontFamily: FONTS.cormorant, fontSize: 19, color: C.cafe, lineHeight: 1.55, margin: '12px auto 14px', maxWidth: 300 }}>
          Obrigada por reservar seu horário, será um prazer receber você e cuidar do seu momento de autocuidado.
        </p>
        <div style={{ fontFamily: FONTS.allura, fontSize: 38, color: C.taupe, lineHeight: 1 }}>by Natielle</div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: '24px 24px 28px', textAlign: 'center', borderTop: `1px solid ${C.line}`, marginTop: 18 }}>
        <Image src="/assets/logo-monogram.png" alt="" width={64} height={64} style={{ width: 64, height: 'auto', opacity: 0.9, margin: '0 auto', display: 'block' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 14 }}>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontFamily: FONTS.montserrat, fontSize: 12, color: C.muted }}>
            <Icon name="instagram" size={15} stroke={C.taupe} /> {footer.instagram}
          </span>
        </div>
        <div style={{ fontFamily: FONTS.montserrat, fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
          {footer.address}<br />{footer.note}
        </div>
      </div>

      {/* CTA FIXO */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '12px 20px 26px', background: 'linear-gradient(transparent, rgba(250,248,246,0.96) 28%)', zIndex: 10 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <Link href="/agendar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', border: 'none', cursor: 'pointer', background: C.taupe, color: C.white, fontFamily: FONTS.montserrat, fontWeight: 600, fontSize: 15, letterSpacing: 0.3, padding: '15px 22px', borderRadius: 16, boxShadow: '0 8px 20px rgba(141,123,109,0.30)', textDecoration: 'none' }}>
            <Icon name="sparkle" size={16} stroke="#fff" /> Agendar meu horário
          </Link>
        </div>
      </div>
    </div>
  )
}
