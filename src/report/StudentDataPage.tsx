import type { SchoolProfile, Student } from '../types'
import { FlowerTitle, ReportPage } from '../components/ReportFrame'
import { formatTanggalIndo } from '../utils/tanggal'

interface Row {
  label: string
  value: string
}

export function StudentDataPage({ student, profile }: { student: Student; profile: SchoolProfile }) {
  const dataAnak: Row[] = [
    { label: 'Nama lengkap', value: student.namaLengkap },
    { label: 'Nama panggilan', value: student.namaPanggilan },
    { label: 'NISN / NIS', value: student.nisn },
    { label: 'Tempat, tanggal lahir', value: joinTempatTanggal(student.tempatLahir, student.tanggalLahir) },
    { label: 'Jenis kelamin', value: student.jenisKelamin },
    { label: 'Agama', value: student.agama },
    { label: 'Anak ke-', value: student.anakKe },
    { label: 'Jumlah saudara', value: student.jumlahSaudara },
    { label: 'Kelompok / rombel', value: student.kelompok },
  ]

  const dataOrangTua: Row[] = [
    { label: 'Nama ayah', value: student.ayahNama },
    { label: 'Pekerjaan ayah', value: student.ayahPekerjaan },
    { label: 'Nama ibu', value: student.ibuNama },
    { label: 'Pekerjaan ibu', value: student.ibuPekerjaan },
    { label: 'Nama wali (jika ada)', value: student.waliNama },
  ]

  const alamat: Row[] = [
    { label: 'Jalan / Dusun', value: student.alamat.jalan },
    { label: 'RT / RW', value: student.alamat.rtRw },
    { label: 'Desa / Kelurahan', value: student.alamat.desa },
    { label: 'Kecamatan', value: student.alamat.kecamatan },
    { label: 'Kabupaten / Kota', value: student.alamat.kabupaten },
    { label: 'Provinsi', value: student.alamat.provinsi },
  ]

  return (
    <ReportPage footer={profile.footer}>
      <div className="sd">
        <FlowerTitle tone="blue">DATA PESERTA DIDIK</FlowerTitle>
        <p className="sd-sub">KETERANGAN DIRI ANAK</p>

        <div className="rp-bar rp-bar-pink">DATA ANAK</div>
        <KvList rows={dataAnak} />

        <div className="rp-bar rp-bar-pink">DATA ORANG TUA / WALI</div>
        <KvList rows={dataOrangTua} />

        <div className="rp-bar rp-bar-yellow">ALAMAT TEMPAT TINGGAL</div>
        <KvList rows={alamat} />

        <div className="sd-bottom">
          <div className="sd-photo">
            <div className="sd-photo-box">
              {student.foto ? <img src={student.foto} alt={student.namaLengkap} /> : <span>3x4</span>}
            </div>
            <p className="pemisah">· · · · Pemisah · · · ·</p>
          </div>

          <div className="sd-sign">
            <p className="sd-sign-place">_________________, ________________</p>
            <p className="sd-sign-role">Kepala Satuan PAUD</p>
            <p className="sd-sign-name">( ________________________________________ )</p>
            <p className="sd-sign-nama">{profile.kepalaSekolah}</p>
          </div>
        </div>
      </div>
    </ReportPage>
  )
}

function KvList({ rows }: { rows: Row[] }) {
  return (
    <dl className="rp-kv">
      {rows.map((r) => (
        <div className="rp-kv-row" key={r.label}>
          <dt>{r.label}</dt>
          <span className="rp-colon">:</span>
          <dd>{r.value || ''}</dd>
        </div>
      ))}
    </dl>
  )
}

function joinTempatTanggal(tempat: string, tanggal: string): string {
  const t = tempat.trim()
  const d = tanggal ? formatTanggalIndo(tanggal) : ''
  if (t && d) return `${t}, ${d}`
  return t || d
}
