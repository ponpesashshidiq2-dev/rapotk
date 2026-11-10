import type { SchoolProfile } from '../types'
import { FlowerTitle, ReportPage } from '../components/ReportFrame'

const COVER_ROWS: { label: string; key: keyof SchoolProfile }[] = [
  { label: 'Nama Sekolah / Satuan PAUD', key: 'namaSekolah' },
  { label: 'NPSN', key: 'npsn' },
  { label: 'Status Sekolah', key: 'statusSekolah' },
  { label: 'Jenjang / Bentuk Satuan', key: 'jenjang' },
  { label: 'Alamat Jalan', key: 'alamatJalan' },
  { label: 'RT / RW', key: 'rtRw' },
  { label: 'Desa / Kelurahan', key: 'desa' },
  { label: 'Kecamatan', key: 'kecamatan' },
  { label: 'Kabupaten / Kota', key: 'kabupaten' },
  { label: 'Provinsi', key: 'provinsi' },
  { label: 'Kode Pos', key: 'kodePos' },
  { label: 'Nomor Telepon', key: 'telepon' },
  { label: 'Email Sekolah', key: 'email' },
  { label: 'Nama Kepala Sekolah', key: 'kepalaSekolah' },
  { label: 'Nama Guru Kelompok', key: 'guruKelompok' },
]

export function CoverPage({ profile }: { profile: SchoolProfile }) {
  return (
    <ReportPage footer={profile.footer}>
      <div className="cover">
        <FlowerTitle tone="blue">DATA SATUAN PENDIDIKAN</FlowerTitle>
        <p className="cover-sub">IDENTITAS SEKOLAH</p>

        <div className="cover-logo">
          {profile.logo ? (
            <img src={profile.logo} alt="Logo satuan pendidikan" />
          ) : (
            <div className="logo-placeholder">
              <span>LOGO</span>
              <small>unggah di menu<br />Profil Sekolah</small>
            </div>
          )}
        </div>

        <div className="rp-bar rp-bar-blue">IDENTITAS SATUAN PENDIDIKAN</div>

        <dl className="rp-kv">
          {COVER_ROWS.map((row) => (
            <div className="rp-kv-row" key={row.key}>
              <dt>{row.label}</dt>
              <span className="rp-colon">:</span>
              <dd>{profile[row.key] || ''}</dd>
            </div>
          ))}
        </dl>

        <p className="pemisah">· · · · · · Pemisah · · · · · ·</p>
      </div>
    </ReportPage>
  )
}
