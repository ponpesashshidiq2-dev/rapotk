import { useRef, useState } from 'react'
import { useApp } from '../state/AppContext'
import { exportToJson, parseImported, readImportFile } from '../storage/exportImport'
import { Btn, Field, Input, SectionCard } from '../components/ui'
import type { View } from '../components/Sidebar'

export function Beranda({ go }: { go: (v: View) => void }) {
  const { state, dispatch, ready, savedAt } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pesan, setPesan] = useState<string | null>(null)

  const totalAspek = state.domains.reduce((n, d) => n + d.aspek.length, 0)
  const totalCapaian = state.domains.reduce(
    (n, d) => n + d.aspek.reduce((m, a) => m + a.capaian.length, 0),
    0,
  )
  const terisi = state.reports.filter((r) => Object.keys(r.domains).length > 0).length

  const stats = [
    { label: 'Peserta didik', value: state.students.length },
    { label: 'Capaian pembelajaran', value: state.domains.length },
    { label: 'Aspek / dimensi', value: totalAspek },
    { label: 'Butir capaian', value: totalCapaian },
    { label: 'Anak terdata nilainya', value: terisi },
  ]

  async function handleImport(file: File | undefined) {
    if (!file) return
    try {
      const text = await readImportFile(file)
      const parsed = parseImported(text)
      const ok = window.confirm(
        `Impor "${file.name}"?\n\n` +
          `${parsed.students.length} peserta didik, ${parsed.domains.length} capaian pembelajaran.\n` +
          'Data saat ini akan ditimpa.',
      )
      if (!ok) return
      dispatch({ type: 'state/replace', state: parsed })
      setPesan(`Berhasil mengimpor ${file.name}`)
    } catch (err) {
      setPesan(`Gagal mengimpor: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleReset() {
    const ok = window.confirm('Kembalikan seluruh data ke kondisi awal?\n\nSemua data anak, penilaian, dan foto akan dihapus.')
    if (!ok) return
    dispatch({ type: 'state/reset' })
    setPesan('Data dikembalikan ke kondisi awal.')
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Beranda</h1>
          <p className="page-sub">Aplikasi Raport TK — Laporan Perkembangan Anak Didik</p>
        </div>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h2>Siapkan raport dalam beberapa langkah</h2>
          <ol className="steps">
            <li>Isi <strong>Profil Sekolah</strong> dan unggah logo.</li>
            <li>Masukkan data peserta didik di <strong>Data Anak</strong>.</li>
            <li>Sesuaikan daftar capaian di <strong>Master Capaian</strong> (bisa ditambah).</li>
            <li>Centang capaian, buat deskripsi, unggah 2 foto di <strong>Penilaian</strong>.</li>
            <li>Selesai — buka <strong>Cetak Raport</strong>.</li>
          </ol>
        </div>
        <div className="hero-actions">
          <Btn onClick={() => go('penilaian')} disabled={!state.students.length}>
            Mulai menilai
          </Btn>
          <Btn variant="secondary" onClick={() => go('cetak')} disabled={!state.students.length}>
            Cetak raport
          </Btn>
        </div>
      </section>

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <SectionCard title="Tahun Ajaran">
          <Field label="Tahun Ajaran" hint="Contoh: 2026/2027. Dipakai pada halaman raport.">
            <Input
              value={state.settings.tahunAjaran}
              onChange={(e) => dispatch({ type: 'settings/patch', patch: { tahunAjaran: e.target.value } })}
              placeholder="2026/2027"
            />
          </Field>
          <p className="muted small">
            {ready ? (savedAt ? 'Perubahan tersimpan otomatis di browser.' : 'Menyimpan…') : 'Memuat data…'}
          </p>
        </SectionCard>

        <SectionCard title="Cadangan & Pemulihan">
          <div className="btn-row">
            <Btn variant="success" onClick={() => exportToJson(state)}>
              Ekspor JSON
            </Btn>
            <Btn variant="secondary" onClick={() => fileRef.current?.click()}>
              Impor JSON
            </Btn>
            <Btn variant="danger" onClick={handleReset}>
              Reset data
            </Btn>
          </div>
          <p className="muted small">
            Ekspor berisi seluruh profil, data anak, penilaian, dan foto. Simpan file cadangan secara berkala.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => void handleImport(e.target.files?.[0])}
          />
          {pesan ? <p className="notice">{pesan}</p> : null}
        </SectionCard>
      </div>
    </div>
  )
}
