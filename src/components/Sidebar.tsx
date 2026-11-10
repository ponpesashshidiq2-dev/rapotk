export type View = 'beranda' | 'profil' | 'anak' | 'capaian' | 'penilaian' | 'cetak'

const ICONS: Record<View, string> = {
  beranda: 'M3 11.2 12 3.6l9 7.6V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  profil: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h4',
  anak: 'M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.5 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M17 11.5a2.5 2.5 0 1 0 0-5M16 14.6c3 .3 5.5 2.3 5.5 5.4',
  capaian: 'M4 6h2M4 12h2M4 18h2M9 6h11M9 12h11M9 18h11',
  penilaian: 'M5 3h14v18H5zM8.5 12.5l2.5 2.5 4.5-5',
  cetak: 'M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7z',
}

const LABELS: Record<View, string> = {
  beranda: 'Beranda',
  profil: 'Profil Sekolah',
  anak: 'Data Anak',
  capaian: 'Master Capaian',
  penilaian: 'Penilaian',
  cetak: 'Cetak Raport',
}

const ORDER: View[] = ['beranda', 'profil', 'anak', 'capaian', 'penilaian', 'cetak']

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Sidebar({
  view,
  onChange,
  jumlahAnak,
  savedAt,
}: {
  view: View
  onChange: (v: View) => void
  jumlahAnak: number
  savedAt: number | null
}) {
  return (
    <aside className="sidebar no-print">
      <div className="brand">
        <span className="brand-mark">RT</span>
        <span className="brand-text">
          <strong>Raport TK</strong>
          <small>Laporan Perkembangan Anak</small>
        </span>
      </div>

      <nav className="nav">
        {ORDER.map((v) => (
          <button
            key={v}
            type="button"
            className={`nav-item ${view === v ? 'active' : ''}`}
            onClick={() => onChange(v)}
          >
            <Icon path={ICONS[v]} />
            <span>{LABELS[v]}</span>
            {v === 'anak' && jumlahAnak > 0 ? <em className="badge">{jumlahAnak}</em> : null}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <span className={`dot ${savedAt ? 'ok' : ''}`} />
        {savedAt
          ? `Tersimpan otomatis · ${new Date(savedAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}`
          : 'Menyiapkan penyimpanan…'}
      </div>
    </aside>
  )
}
