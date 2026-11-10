import type { ReactNode } from 'react'

function Waves({ variant }: { variant: 'tr' | 'bl' }) {
  const color = variant === 'tr' ? '#9cc7ec' : '#f4b9cd'
  const paths = [0, 14, 28, 42]
  return (
    <svg
      className={`rp-waves rp-waves-${variant}`}
      viewBox="0 0 220 130"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {paths.map((o, i) => (
        <path
          key={o}
          d={`M-10 ${34 + o} C 45 ${10 + o}, 80 ${64 + o}, 130 ${34 + o} S 210 ${6 + o}, 230 ${30 + o}`}
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          opacity={0.75 - i * 0.12}
        />
      ))}
    </svg>
  )
}

export function ReportPage({ children, footer }: { children: ReactNode; footer?: string }) {
  return (
    <section className="rp-page">
      <Waves variant="tr" />
      <Waves variant="bl" />
      <div className="rp-inner">
        <div className="rp-header">☆ ✦ LAPORAN PERKEMBANGAN ANAK DIDIK ✦ ☆</div>
        <div className="rp-content">{children}</div>
        <div className="rp-footer">{footer || 'SAHABAT GURU'}</div>
      </div>
    </section>
  )
}

export function FlowerTitle({ children, tone = 'pink' }: { children: ReactNode; tone?: 'pink' | 'blue' }) {
  return (
    <h2 className={`rp-title rp-title-${tone}`}>
      <span>❀</span>
      <span>{children}</span>
      <span>❀</span>
    </h2>
  )
}
