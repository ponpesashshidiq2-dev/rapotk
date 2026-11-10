import { useMemo, useState, type FormEvent } from 'react'
import { useApp, domainScoreOf, findReport } from '../state/AppContext'
import { Btn, EmptyState, Field, Input, TextArea } from '../components/ui'
import { generateDeskripsi } from '../utils/deskripsi'
import { compressImage } from '../utils/image'
import type { Aspect, LearningDomain, PhotoDoc, Student } from '../types'

function AddRow({ placeholder, onAdd }: { placeholder: string; onAdd: (value: string) => void }) {
  const [value, setValue] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    const t = value.trim()
    if (!t) return
    onAdd(t)
    setValue('')
  }
  return (
    <form className="add-row" onSubmit={submit}>
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
      <Btn type="submit">+ Tambah</Btn>
    </form>
  )
}

export function Penilaian() {
  const { state } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = useMemo(
    () => state.students.find((s) => s.id === selectedId) ?? state.students[0] ?? null,
    [state.students, selectedId],
  )

  if (state.students.length === 0) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <h1>Penilaian</h1>
            <p className="page-sub">Centang capaian, buat deskripsi, dan unggah dokumentasi tiap CP.</p>
          </div>
        </header>
        <EmptyState
          title="Belum ada data anak"
          description="Tambahkan peserta didik terlebih dahulu di menu Data Anak."
        />
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Penilaian</h1>
          <p className="page-sub">Pilih anak, centang capaian per aspek, lalu buat deskripsi otomatis.</p>
        </div>
      </header>

      <div className="nilai-layout">
        <aside className="nilai-rail no-print">
          {state.students.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`rail-item ${selected?.id === s.id ? 'active' : ''}`}
              onClick={() => setSelectedId(s.id)}
            >
              <span className="rail-avatar">{s.foto ? <img src={s.foto} alt="" /> : s.namaLengkap.slice(0, 1)}</span>
              <span className="rail-text">
                <strong>{s.namaLengkap}</strong>
                <small>{s.kelompok || '—'}</small>
              </span>
            </button>
          ))}
        </aside>

        <div className="nilai-main">
          {selected ? (
            <>
              <div className="nilai-student">
                <strong>{selected.namaLengkap}</strong>
                <span>Kelompok {selected.kelompok || '—'}</span>
                <span>Tahun Ajaran {state.settings.tahunAjaran}</span>
              </div>
              {state.domains.map((d) => (
                <DomainCard key={d.id} student={selected} domain={d} />
              ))}
            </>
          ) : (
            <p className="muted">Pilih anak pada daftar di samping.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function DomainCard({ student, domain }: { student: Student; domain: LearningDomain }) {
  const { state, dispatch } = useApp()
  const report = findReport(state, student.id)
  const score = domainScoreOf(report, domain.id)

  const terisi = domain.aspek.filter((a) => (score.aspek[a.id]?.deskripsi ?? '').trim()).length
  const fotoAktif = score.foto.filter((f) => f.src).length

  function photos(): PhotoDoc[] {
    return [0, 1].map((i) => score.foto[i] ?? { src: '', keterangan: '' })
  }

  function updatePhoto(index: number, patch: Partial<PhotoDoc>) {
    const next = photos()
    next[index] = { ...next[index], ...patch }
    dispatch({ type: 'photos/set', studentId: student.id, domainId: domain.id, foto: next })
  }

  function handlePhotoFile(index: number, file: File | undefined) {
    if (!file) return
    void compressImage(file, 1400, 0.76)
      .then((src) => updatePhoto(index, { src }))
      .catch((err: unknown) => alert(`Gagal memproses foto: ${err instanceof Error ? err.message : String(err)}`))
  }

  function generate(aspek: Aspect) {
    const current = score.aspek[aspek.id]
    dispatch({
      type: 'score/patch',
      studentId: student.id,
      domainId: domain.id,
      aspekId: aspek.id,
      patch: { deskripsi: generateDeskripsi(student.namaLengkap, aspek, current?.capaianIds ?? []) },
    })
  }

  function generateAll() {
    domain.aspek.forEach((aspek) => {
      const current = score.aspek[aspek.id]
      const teks = generateDeskripsi(student.namaLengkap, aspek, current?.capaianIds ?? [])
      if (!teks) return
      dispatch({
        type: 'score/patch',
        studentId: student.id,
        domainId: domain.id,
        aspekId: aspek.id,
        patch: { deskripsi: teks },
      })
    })
  }

  return (
    <section className="card nilai-card">
      <header className="card-head">
        <h3>{domain.nama}</h3>
        <div className="card-actions">
          <span className="pill">{terisi}/{domain.aspek.length} deskripsi</span>
          <span className={`pill ${fotoAktif === 2 ? 'ok' : ''}`}>{fotoAktif}/2 foto</span>
          <Btn variant="secondary" onClick={generateAll} disabled={domain.aspek.length === 0}>
            Buat semua deskripsi
          </Btn>
        </div>
      </header>

      <div className="card-body">
        {domain.aspek.map((a, idx) => {
          const current = score.aspek[a.id] ?? { capaianIds: [], deskripsi: '' }
          const tone = idx % 2 === 0 ? 'pink' : 'blue'
          return (
            <div className={`aspek-block tone-${tone}`} key={a.id}>
              <div className="aspek-block-head">
                <h4>{a.nama}</h4>
                <span className="muted small">{current.capaianIds.length} capaian dipilih</span>
              </div>

              <div className="pick-grid">
                {a.capaian.map((c) => {
                  const on = current.capaianIds.includes(c.id)
                  return (
                    <label className={`pick ${on ? 'on' : ''}`} key={c.id}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() =>
                          dispatch({
                            type: 'score/toggle',
                            studentId: student.id,
                            domainId: domain.id,
                            aspekId: a.id,
                            capaianId: c.id,
                          })
                        }
                      />
                      <span>{c.label}</span>
                    </label>
                  )
                })}
                {a.capaian.length === 0 ? <p className="muted small">Belum ada capaian pada aspek ini.</p> : null}
              </div>

              <AddRow
                placeholder="Tambah capaian baru untuk aspek ini…"
                onAdd={(label) =>
                  dispatch({ type: 'capaian/add', domainId: domain.id, aspekId: a.id, label })
                }
              />

              <Field label="Deskripsi perkembangan" stacked>
                <TextArea
                  rows={4}
                  value={current.deskripsi}
                  placeholder="Deskripsi akan dibuat dari capaian yang dicentang…"
                  onChange={(e) =>
                    dispatch({
                      type: 'score/patch',
                      studentId: student.id,
                      domainId: domain.id,
                      aspekId: a.id,
                      patch: { deskripsi: e.target.value },
                    })
                  }
                />
              </Field>
              <div className="btn-row">
                <Btn variant="secondary" onClick={() => generate(a)} disabled={!current.capaianIds.length}>
                  Buat deskripsi dari capaian
                </Btn>
              </div>
            </div>
          )
        })}

        <div className="foto-block">
          <div className="aspek-block-head">
            <h4>Dokumentasi kegiatan anak</h4>
            <span className="muted small">Unggah 2 foto kegiatan + keterangan</span>
          </div>

          <div className="foto-grid">
            {photos().map((f, i) => (
              <div className="foto-slot" key={i}>
                <div className="foto-box">
                  {f.src ? (
                    <img src={f.src} alt={`Foto kegiatan ${i + 1}`} />
                  ) : (
                    <span>Foto kegiatan {i + 1}</span>
                  )}
                </div>
                <div className="foto-actions">
                  <label className="btn btn-secondary btn-file">
                    {f.src ? 'Ganti' : 'Unggah foto'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        handlePhotoFile(i, e.target.files?.[0])
                        e.target.value = ''
                      }}
                    />
                  </label>
                  {f.src ? (
                    <Btn variant="ghost" onClick={() => updatePhoto(i, { src: '' })}>
                      Hapus
                    </Btn>
                  ) : null}
                </div>
                <Input
                  value={f.keterangan}
                  placeholder="Keterangan: sedang bermain balok"
                  onChange={(e) => updatePhoto(i, { keterangan: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
