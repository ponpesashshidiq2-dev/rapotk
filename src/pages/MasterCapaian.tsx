import { useState, type FormEvent } from 'react'
import { useApp } from '../state/AppContext'
import { Btn, EmptyState, Input, SectionCard } from '../components/ui'
import { newId } from '../utils/id'
import type { LearningDomain } from '../types'

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
      <Btn type="submit">Tambah</Btn>
    </form>
  )
}

export function MasterCapaian() {
  const { state, dispatch } = useApp()

  function addDomain() {
    const domain: LearningDomain = { id: newId(), nama: 'Capaian Pembelajaran Baru', aspek: [] }
    dispatch({ type: 'domain/add', domain })
  }

  function removeDomain(d: LearningDomain) {
    const ok = window.confirm(`Hapus CP "${d.nama}" beserta seluruh aspek, capaian, dan nilainya?`)
    if (!ok) return
    dispatch({ type: 'domain/delete', id: d.id })
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Master Capaian</h1>
          <p className="page-sub">
            Struktur Capaian Pembelajaran → aspek/dimensi → butir capaian. Semua bisa ditambah atau dihapus.
          </p>
        </div>
        <div className="page-head-actions">
          <Btn onClick={addDomain}>+ Tambah CP</Btn>
        </div>
      </header>

      {state.domains.length === 0 ? (
        <EmptyState
          title="Belum ada capaian pembelajaran"
          description="Tambahkan CP untuk mulai menyusun raport."
          action={<Btn onClick={addDomain}>+ Tambah CP</Btn>}
        />
      ) : (
        <div className="domain-list">
          {state.domains.map((d, idx) => (
            <SectionCard
              key={d.id}
              title={`CP ${idx + 1}`}
              actions={
                <>
                  <Btn
                    variant="ghost"
                    title="Naikkan"
                    disabled={idx === 0}
                    onClick={() => dispatch({ type: 'domain/move', id: d.id, dir: -1 })}
                  >
                    ↑
                  </Btn>
                  <Btn
                    variant="ghost"
                    title="Turunkan"
                    disabled={idx === state.domains.length - 1}
                    onClick={() => dispatch({ type: 'domain/move', id: d.id, dir: 1 })}
                  >
                    ↓
                  </Btn>
                  <Btn variant="danger" onClick={() => removeDomain(d)}>
                    Hapus CP
                  </Btn>
                </>
              }
            >
              <div className="domain-head">
                <Input
                  className="domain-name"
                  value={d.nama}
                  onChange={(e) => dispatch({ type: 'domain/update', id: d.id, patch: { nama: e.target.value } })}
                  placeholder="Nama Capaian Pembelajaran"
                />
              </div>

              <div className="aspek-list">
                {d.aspek.map((a) => (
                  <div className="aspek-item" key={a.id}>
                    <div className="aspek-head">
                      <Input
                        className="aspek-name"
                        value={a.nama}
                        onChange={(e) =>
                          dispatch({
                            type: 'aspek/update',
                            domainId: d.id,
                            id: a.id,
                            patch: { nama: e.target.value },
                          })
                        }
                        placeholder="Nama aspek / dimensi"
                      />
                      <Btn
                        variant="ghost"
                        onClick={() => dispatch({ type: 'aspek/delete', domainId: d.id, id: a.id })}
                        title="Hapus aspek"
                      >
                        Hapus aspek
                      </Btn>
                    </div>

                    <div className="chip-wrap">
                      {a.capaian.map((c) => (
                        <span className="chip" key={c.id}>
                          {c.label}
                          <button
                            type="button"
                            className="chip-x"
                            aria-label={`Hapus ${c.label}`}
                            onClick={() =>
                              dispatch({ type: 'capaian/delete', domainId: d.id, aspekId: a.id, id: c.id })
                            }
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      {a.capaian.length === 0 ? <span className="muted small">Belum ada butir capaian.</span> : null}
                    </div>

                    <AddRow
                      placeholder="Tambah capaian detail…"
                      onAdd={(label) => dispatch({ type: 'capaian/add', domainId: d.id, aspekId: a.id, label })}
                    />
                  </div>
                ))}

                {d.aspek.length === 0 ? <p className="muted small">Belum ada aspek dalam CP ini.</p> : null}
              </div>

              <AddRow
                placeholder="Tambah aspek / dimensi…"
                onAdd={(nama) =>
                  dispatch({
                    type: 'aspek/add',
                    domainId: d.id,
                    aspek: { id: newId(), nama, capaian: [] },
                  })
                }
              />
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}
