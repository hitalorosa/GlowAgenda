import { C } from '@/lib/design'

interface IconProps {
  name: keyof typeof PATHS
  size?: number
  stroke?: string
  sw?: number
  fill?: string
  style?: React.CSSProperties
}

const p = (stroke: string, sw: number) => ({
  fill: 'none' as const, stroke, strokeWidth: sw,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
})

const PATHS = {
  sparkle:     (s: string, sw: number) => <path d="M12 2.5c.5 4.2 2.3 6 6.5 6.5-4.2.5-6 2.3-6.5 6.5-.5-4.2-2.3-6-6.5-6.5 4.2-.5 6-2.3 6.5-6.5Z" {...p(s,sw)} />,
  calendar:    (s: string, sw: number) => <g {...p(s,sw)}><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M8 2.5v4M16 2.5v4"/></g>,
  clock:       (s: string, sw: number) => <g {...p(s,sw)}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></g>,
  check:       (s: string, sw: number) => <path d="M5 12.5l4.5 4.5L19 6.5" {...p(s,sw)} />,
  checkCircle: (s: string, sw: number) => <g {...p(s,sw)}><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.7 2.7L16 9.5"/></g>,
  chevron:     (s: string, sw: number) => <path d="M9 5l7 7-7 7" {...p(s,sw)} />,
  chevronL:    (s: string, sw: number) => <path d="M15 5l-7 7 7 7" {...p(s,sw)} />,
  chevronDown: (s: string, sw: number) => <path d="M5 9l7 7 7-7" {...p(s,sw)} />,
  x:           (s: string, sw: number) => <path d="M6 6l12 12M18 6L6 18" {...p(s,sw)} />,
  plus:        (s: string, sw: number) => <path d="M12 5v14M5 12h14" {...p(s,sw)} />,
  phone:       (s: string, sw: number) => <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L20 13l-1 5a16 16 0 01-14-14Z" {...p(s,sw)} />,
  user:        (s: string, sw: number) => <g {...p(s,sw)}><circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0115 0"/></g>,
  lock:        (s: string, sw: number) => <g {...p(s,sw)}><rect x="4.5" y="10" width="15" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 018 0v3"/></g>,
  mail:        (s: string, sw: number) => <g {...p(s,sw)}><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/></g>,
  gear:        (s: string, sw: number) => <g {...p(s,sw)}><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/></g>,
  ban:         (s: string, sw: number) => <g {...p(s,sw)}><circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/></g>,
  arrowR:      (s: string, sw: number) => <path d="M5 12h14M13 6l6 6-6 6" {...p(s,sw)} />,
  map:         (s: string, sw: number) => <g {...p(s,sw)}><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></g>,
  link:        (s: string, sw: number) => <g {...p(s,sw)}><path d="M9.5 14.5l5-5M8 12l-2 2a3.5 3.5 0 005 5l2-2M16 12l2-2a3.5 3.5 0 00-5-5l-2 2"/></g>,
  instagram:   (s: string, sw: number) => <g {...p(s,sw)}><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1" fill={s} stroke="none"/></g>,
}

export function Icon({ name, size = 20, stroke = C.cafe, sw = 1.6, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {PATHS[name](stroke, sw)}
    </svg>
  )
}

export type IconName = keyof typeof PATHS
