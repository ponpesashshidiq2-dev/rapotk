import { useApp } from '../state/AppContext'
import { Field, Input, PhotoPicker, SectionCard } from '../components/ui'
import type { SchoolProfile } from '../types'

const SEKOLAH: { key: keyof SchoolProfile; label: string; placeholder?: string }[] = [
  { key: 'namaSekolah', label: 'Nama Sekolah / Satuan PAUD', placeholder: 'TK Islam Terpadu ...' },
  { key: 'npsn', label: 'NPSN', placeholder: '12345678' },
  { key: 'statusSekolah', label: 'Status Sekolah', placeholder: 'Swasta' },
  { key: 'jenjang', label: 'Jenjang / Bentuk Satuan', placeholder: 'TK / RA' },
]

const KONTAK: { key: keyof SchoolProfile; label: string; placeholder?: string; type?: string }[] = [
  { key: 'telepon', label: 'Nomor Telepon', placeholder: '0812xxxxxxx', type: 'tel' },
  { key: 'email', label: 'Email Sekolah', placeholder: 'sekolah@email.com', type: 'email' },
  { key: 'kodePos', label: 'Kode Pos', placeholder: '12345' },
]

const ALAMAT: { key: keyof SchoolProfile; label: string; placeholder?: string }[] = [
  { key: 'alamatJalan', label: 'Alamat Jalan', placeholder: 'Jl. Contoh No. 1' },
  { key: 'rtRw', label: 'RT / RW', placeholder: '001/002' },
  { key: 'desa', label: 'Desa / Kelurahan' },
  { key: 'kecamatan', label: 'Kecamatan' },
  { key: 'kabupaten', label: 'Kabupaten / Kota' },
  { key: 'provinsi', label: 'Provinsi' },
]

const PEJABAT: { key: keyof SchoolProfile; label: string; placeholder?: string }[] = [
  { key: 'kepalaSekolah', label: 'Nama Kepala Sekolah' },
  { key: 'guruKelompok', label: 'Nama Guru Kelompok' },
  { key: 'footer', label: 'Teks footer raport', placeholder: 'SAHABAT GURU' },
]

export function Profil() {
  const { state, dispatch } = useApp()
  const profile = state.profile

  function patch(key: keyof SchoolProfile, value: string) {
    dispatch({ type: 'profile/patch', patch: { [key]: value } as Partial<SchoolProfile> })
  }

  function renderFields(list: { key: keyof SchoolProfile; label: string; placeholder?: string; type?: string }[]) {
    return list.map((f) => (
      <Field key={f.key} label={f.label}>
        <Input
          type={f.type ?? 'text'}
          value={profile[f.key]}
          placeholder={f.placeholder ?? ''}
          onChange={(e) => patch(f.key, e.target.value)}
        />
      </Field>
    ))
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Profil Sekolah</h1>
          <p className="page-sub">Identitas satuan pendidikan — tampil pada sampul raport.</p>
        </div>
      </header>

      <div className="grid-2">
        <SectionCard title="Logo Satuan Pendidikan">
          <PhotoPicker
            label="Logo (disarankan PNG transparan, min. 400×400 px)"
            value={profile.logo}
            onChange={(logo) => dispatch({ type: 'profile/patch', patch: { logo } })}
            previewClass="logo-preview"
            accept="image/*"
          />
          <p className="muted small">Logo akan tampil di tengah halaman sampul raport.</p>
        </SectionCard>

        <SectionCard title="Data Satuan Pendidikan">{renderFields(SEKOLAH)}</SectionCard>
      </div>

      <SectionCard title="Alamat">{<div className="grid-3">{renderFields(ALAMAT)}</div>}</SectionCard>

      <div className="grid-2">
        <SectionCard title="Kontak">{renderFields(KONTAK)}</SectionCard>
        <SectionCard title="Pejabat & Footer">{renderFields(PEJABAT)}</SectionCard>
      </div>
    </div>
  )
}
