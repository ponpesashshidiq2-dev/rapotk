import { useState } from 'react'
import { Sidebar, type View } from './components/Sidebar'
import { useApp } from './state/AppContext'
import { Beranda } from './pages/Beranda'
import { Profil } from './pages/Profil'
import { DataAnak } from './pages/DataAnak'
import { MasterCapaian } from './pages/MasterCapaian'
import { Penilaian } from './pages/Penilaian'
import { Cetak } from './pages/Cetak'

const VALID_VIEWS: View[] = ['beranda', 'profil', 'anak', 'capaian', 'penilaian', 'cetak']

export default function App() {
  const { state, ready, savedAt } = useApp()
  const [view, setView] = useState<View>(() => {
    const raw = new URLSearchParams(window.location.search).get('v')
    return (VALID_VIEWS as string[]).includes(raw ?? '') ? (raw as View) : 'beranda'
  })

  if (!ready) {
    return (
      <div className="boot">
        <span className="boot-mark">RT</span>
        <p>Memuat data raport…</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} onChange={setView} jumlahAnak={state.students.length} savedAt={savedAt} />
      <main className="app-main">
        {view === 'beranda' ? <Beranda go={setView} /> : null}
        {view === 'profil' ? <Profil /> : null}
        {view === 'anak' ? <DataAnak /> : null}
        {view === 'capaian' ? <MasterCapaian /> : null}
        {view === 'penilaian' ? <Penilaian /> : null}
        {view === 'cetak' ? <Cetak /> : null}
      </main>
    </div>
  )
}
