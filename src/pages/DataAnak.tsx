import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { Btn, EmptyState, Field, Input, Modal, PhotoPicker, SectionCard, Select } from '../components/ui'
import { createStudent } from '../defaults'
import { hitungUsia } from '../utils/tanggal'
import type { Student } from '../types'

const JENIS_KELAMIN = ['', 'Laki-laki', 'Perempuan']
const AGAMA = ['', 'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Kepercayaan']

export function DataAnak() {
  const { state, dispatch } = useApp()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Student>(() => createStudent())
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return state.students
    return state.students.filter(
      (s) =>
        s.namaLengkap.toLowerCase().includes(needle) ||
        s.namaPanggilan.toLowerCase().includes(needle) ||
        s.kelompok.toLowerCase().includes(needle),
    )
  }, [state.students, q])

  function set<K extends keyof Student>(key: K, value: Student[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function setAlamat(key: keyof Student['alamat'], value: string) {
    setDraft((d) => ({ ...d, alamat: { ...d.alamat, [key]: value } }))
  }

  function openNew() {
    setDraft(createStudent())
    setOpen(true)
  }

  function openEdit(s: Student) {
    setDraft({ ...s, alamat: { ...s.alamat } })
    setOpen(true)
  }

  function save() {
    if (!draft.namaLengkap.trim()) {
      alert('Nama lengkap wajib diisi.')
      return
    }
    const exists = state.students.some((s) => s.id === draft.id)
    dispatch({ type: exists ? 'student/update' : 'student/add', student: draft })
    setOpen(false)
  }

  function remove(s: Student) {
    const ok = window.confirm(`Hapus data ${s.namaLengkap} beserta seluruh penilaian dan fotonya?`)
    if (!ok) return
    dispatch({ type: 'student/delete', id: s.id })
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Data Anak</h1>
          <p className="page-sub">Data peserta didik yang tampil pada halaman raport.</p>
        </div>
        <div className="page-head-actions">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / kelompok…" />
          <Btn onClick={openNew}>+ Tambah Anak</Btn>
        </div>
      </header>

      {state.students.length === 0 ? (
        <EmptyState
          title="Belum ada data anak"
          description="Tambahkan peserta didik untuk mulai membuat raport."
          action={<Btn onClick={openNew}>+ Tambah Anak</Btn>}
        />
      ) : (
        <div className="student-grid">
          {list.map((s) => (
            <article className="student-card" key={s.id}>
              <div className="student-photo">
                {s.foto ? <img src={s.foto} alt={s.namaLengkap} /> : <span>3x4</span>}
              </div>
              <div className="student-info">
                <strong>{s.namaLengkap}</strong>
                <span>{s.kelompok || 'Kelompok belum diisi'}</span>
                <small>{hitungUsia(s.tanggalLahir)}</small>
              </div>
              <div className="student-actions">
                <Btn variant="secondary" onClick={() => openEdit(s)}>
                  Ubah
                </Btn>
                <Btn variant="danger" onClick={() => remove(s)}>
                  Hapus
                </Btn>
              </div>
            </article>
          ))}
          {list.length === 0 ? <p className="muted">Tidak ada anak yang cocok dengan pencarian.</p> : null}
        </div>
      )}

      <Modal
        open={open}
        title={state.students.some((s) => s.id === draft.id) ? 'Ubah Data Anak' : 'Tambah Data Anak'}
        onClose={() => setOpen(false)}
        wide
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Btn>
            <Btn onClick={save}>Simpan</Btn>
          </>
        }
      >
        <div className="modal-grid">
          <div className="modal-photo">
            <PhotoPicker
              label="Foto 3x4"
              value={draft.foto}
              onChange={(foto) => set('foto', foto)}
              previewClass="foto34-preview"
              accept="image/*"
            />
          </div>

          <div className="modal-forms">
            <SectionCard title="Data Anak">
              <div className="grid-2">
                <Field label="Nama lengkap">
                  <Input value={draft.namaLengkap} onChange={(e) => set('namaLengkap', e.target.value)} />
                </Field>
                <Field label="Nama panggilan">
                  <Input value={draft.namaPanggilan} onChange={(e) => set('namaPanggilan', e.target.value)} />
                </Field>
                <Field label="NISN / NIS">
                  <Input value={draft.nisn} onChange={(e) => set('nisn', e.target.value)} />
                </Field>
                <Field label="Tempat lahir">
                  <Input value={draft.tempatLahir} onChange={(e) => set('tempatLahir', e.target.value)} />
                </Field>
                <Field label="Tanggal lahir">
                  <Input
                    type="date"
                    value={draft.tanggalLahir}
                    onChange={(e) => set('tanggalLahir', e.target.value)}
                  />
                </Field>
                <Field label="Jenis kelamin">
                  <Select value={draft.jenisKelamin} onChange={(e) => set('jenisKelamin', e.target.value)}>
                    {JENIS_KELAMIN.map((v) => (
                      <option key={v} value={v}>
                        {v || '— pilih —'}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Agama">
                  <Select value={draft.agama} onChange={(e) => set('agama', e.target.value)}>
                    {AGAMA.map((v) => (
                      <option key={v} value={v}>
                        {v || '— pilih —'}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Kelompok / rombel">
                  <Input value={draft.kelompok} onChange={(e) => set('kelompok', e.target.value)} placeholder="Melati" />
                </Field>
                <Field label="Anak ke-">
                  <Input
                    type="number"
                    min={0}
                    value={draft.anakKe}
                    onChange={(e) => set('anakKe', e.target.value)}
                  />
                </Field>
                <Field label="Jumlah saudara">
                  <Input
                    type="number"
                    min={0}
                    value={draft.jumlahSaudara}
                    onChange={(e) => set('jumlahSaudara', e.target.value)}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Data Orang Tua / Wali">
              <div className="grid-2">
                <Field label="Nama ayah">
                  <Input value={draft.ayahNama} onChange={(e) => set('ayahNama', e.target.value)} />
                </Field>
                <Field label="Pekerjaan ayah">
                  <Input value={draft.ayahPekerjaan} onChange={(e) => set('ayahPekerjaan', e.target.value)} />
                </Field>
                <Field label="Nama ibu">
                  <Input value={draft.ibuNama} onChange={(e) => set('ibuNama', e.target.value)} />
                </Field>
                <Field label="Pekerjaan ibu">
                  <Input value={draft.ibuPekerjaan} onChange={(e) => set('ibuPekerjaan', e.target.value)} />
                </Field>
                <Field label="Nama wali (jika ada)">
                  <Input value={draft.waliNama} onChange={(e) => set('waliNama', e.target.value)} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Alamat Tempat Tinggal">
              <div className="grid-2">
                <Field label="Jalan / Dusun">
                  <Input value={draft.alamat.jalan} onChange={(e) => setAlamat('jalan', e.target.value)} />
                </Field>
                <Field label="RT / RW">
                  <Input value={draft.alamat.rtRw} onChange={(e) => setAlamat('rtRw', e.target.value)} />
                </Field>
                <Field label="Desa / Kelurahan">
                  <Input value={draft.alamat.desa} onChange={(e) => setAlamat('desa', e.target.value)} />
                </Field>
                <Field label="Kecamatan">
                  <Input value={draft.alamat.kecamatan} onChange={(e) => setAlamat('kecamatan', e.target.value)} />
                </Field>
                <Field label="Kabupaten / Kota">
                  <Input value={draft.alamat.kabupaten} onChange={(e) => setAlamat('kabupaten', e.target.value)} />
                </Field>
                <Field label="Provinsi">
                  <Input value={draft.alamat.provinsi} onChange={(e) => setAlamat('provinsi', e.target.value)} />
                </Field>
              </div>
            </SectionCard>
          </div>
        </div>
      </Modal>
    </div>
  )
}
