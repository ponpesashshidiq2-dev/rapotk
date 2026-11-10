import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../state/AppContext'
import { Btn, EmptyState, SectionCard } from '../components/ui'
import { ReportDocument } from '../report/ReportDocument'
import type { Student } from '../types'

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          }),
    ),
  )
}

export function Cetak() {
  const { state } = useApp()
  const [picked, setPicked] = useState<string[] | null>(null)
  const [showCover, setShowCover] = useState(true)
  const [printing, setPrinting] = useState(false)
  const [busy, setBusy] = useState(false)

  const selectedStudents: Student[] = useMemo(() => {
    if (!picked) return state.students
    return state.students.filter((s) => picked.includes(s.id))
  }, [state.students, picked])

  const totalHalaman =
    (showCover ? 1 : 0) + selectedStudents.length * (1 + state.domains.length)

  useEffect(() => {
    if (picked === null) return
    const valid = new Set(state.students.map((s) => s.id))
    const next = picked.filter((id) => valid.has(id))
    if (next.length !== picked.length) setPicked(next)
  }, [state.students, picked])

  function toggle(id: string) {
    if (picked === null) {
      setPicked(state.students.filter((s) => s.id !== id).map((s) => s.id))
      return
    }
    setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id])
  }

  async function doPrint() {
    if (!selectedStudents.length) {
      alert('Pilih minimal satu peserta didik.')
      return
    }
    setBusy(true)
    setPrinting(true)
    await new Promise((r) => setTimeout(r, 80))
    const el = document.getElementById('report-print-root')
    if (el) await waitForImages(el)
    document.body.classList.add('printing')
    setBusy(false)
    window.print()
    document.body.classList.remove('printing')
    setTimeout(() => setPrinting(false), 300)
  }

  useEffect(() => () => document.body.classList.remove('printing'), [])

  if (state.students.length === 0) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <h1>Cetak Raport</h1>
            <p className="page-sub">Pratinjau A4 sebelum dicetak atau disimpan sebagai PDF.</p>
          </div>
        </header>
        <EmptyState title="Belum ada data anak" description="Tambahkan peserta didik di menu Data Anak." />
      </div>
    )
  }

  return (
    <div className="page page-wide">
      <header className="page-head no-print">
        <div>
          <h1>Cetak Raport</h1>
          <p className="page-sub">
            Periksa hasilnya di bawah, lalu tekan Cetak. Pada dialog print, pilih <strong>Save as PDF</strong> untuk
            menyimpan file PDF.
          </p>
        </div>
        <div className="page-head-actions">
          <Btn variant="primary" onClick={() => void doPrint()} disabled={busy || selectedStudents.length === 0}>
            {busy ? 'Menyiapkan…' : 'Cetak / Simpan PDF'}
          </Btn>
        </div>
      </header>

      <div className="cetak-toolbar no-print">
        <SectionCard
          title={`Peserta didik terpilih — ${selectedStudents.length} dari ${state.students.length}`}
          actions={
            <>
              <Btn variant="ghost" onClick={() => setPicked(null)}>
                Pilih semua
              </Btn>
              <Btn variant="ghost" onClick={() => setPicked([])}>
                Kosongkan
              </Btn>
            </>
          }
        >
          <div className="pick-grid">
            {state.students.map((s) => {
              const on = picked === null || picked.includes(s.id)
              return (
                <label className={`pick ${on ? 'on' : ''}`} key={s.id}>
                  <input type="checkbox" checked={on} onChange={() => toggle(s.id)} />
                  <span>
                    {s.namaLengkap} <em>· {s.kelompok || 'tanpa kelompok'}</em>
                  </span>
                </label>
              )
            })}
          </div>

          <div className="btn-row">
            <label className={`pick ${showCover ? 'on' : ''}`}>
              <input type="checkbox" checked={showCover} onChange={(e) => setShowCover(e.target.checked)} />
              <span>Sertakan sampul (identitas sekolah)</span>
            </label>
            <span className="muted small">Perkiraan halaman: {totalHalaman} halaman A4</span>
          </div>
        </SectionCard>
      </div>

      <div className="report-preview no-print">
        <ReportDocument state={state} students={selectedStudents} showCover={showCover} />
      </div>

      {printing
        ? createPortal(
            <div id="report-print-root" className="report-print">
              <ReportDocument state={state} students={selectedStudents} showCover={showCover} />
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
