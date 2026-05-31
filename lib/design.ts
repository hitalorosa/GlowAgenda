// Design tokens — GlowAgenda / Lumi Nails Studios
export const C = {
  taupe:  '#8D7B6D',
  rose:   '#D8B6A4',
  areia:  '#F3EEE9',
  off:    '#FAF8F6',
  cafe:   '#6B5B52',
  white:  '#FFFFFF',
  line:   'rgba(107,91,82,0.14)',
  faint:  'rgba(107,91,82,0.06)',
  ink:    '#3F362F',
  muted:  '#8a7d72',
  error:  '#a8584e',
} as const

export const FONTS = {
  playfair:  '"Playfair Display", serif',
  cormorant: '"Cormorant Garamond", serif',
  montserrat:'Montserrat, sans-serif',
  allura:    '"Allura", cursive',
} as const

// ── scheduling constants ──────────────────────────────────────
export const OPEN_MIN  = 16 * 60   // 960
export const CLOSE_MIN = 20 * 60   // 1200
export const SLOT_STEP = 60        // 1 hour

export const WD_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
export const WD_LONG  = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
export const MON_LONG = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                         'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function hhmm(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}

export function toMin(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export function durLabel(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60), m = min % 60
  return m ? `${h}h${String(m).padStart(2,'0')}` : `${h}h`
}

export function prettyDate(d: Date): string {
  return `${WD_LONG[d.getDay()]}, ${d.getDate()} de ${MON_LONG[d.getMonth()]}`
}

export function shortDate(d: Date): string {
  return `${d.getDate()} ${MON_LONG[d.getMonth()].slice(0,3).toLowerCase()}`
}

export function nextDays(n: number): Date[] {
  const base = new Date(); base.setHours(0,0,0,0)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base); d.setDate(d.getDate() + i); return d
  })
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function sameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b)
}

/** Generate time slots for a given duration (in minutes), returns {start, label} */
export function getMockSlots(durationMinutes: number): { start: number; label: string }[] {
  const slots = []
  for (let s = OPEN_MIN; s + durationMinutes <= CLOSE_MIN; s += SLOT_STEP) {
    slots.push({ start: s, label: hhmm(s) })
  }
  return slots
}
