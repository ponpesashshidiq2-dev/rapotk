import type { DomainScore, LearningDomain, SchoolProfile, Student } from '../types'
import { FlowerTitle, ReportPage } from '../components/ReportFrame'
import { hitungUsia } from '../utils/tanggal'

export function DomainPage({
  student,
  domain,
  score,
  profile,
  tahunAjaran,
}: {
  student: Student
  domain: LearningDomain
  score: DomainScore
  profile: SchoolProfile
  tahunAjaran: string
}) {
  const foto = [0, 1].map((i) => score.foto[i] ?? { src: '', keterangan: '' })

  return (
    <ReportPage footer={profile.footer}>
      <div className="dp">
        <div className="dp-meta">
          <div className="dp-meta-row">
            <span className="dp-meta-label">Nama Anak</span>
            <span className="rp-colon">:</span>
            <span className="dp-meta-value">{student.namaLengkap}</span>
            <span className="dp-meta-label dp-meta-label-right">Kelompok</span>
            <span className="rp-colon">:</span>
            <span className="dp-meta-value">{student.kelompok}</span>
          </div>
          <div className="dp-meta-row">
            <span className="dp-meta-label">Usia</span>
            <span className="rp-colon">:</span>
            <span className="dp-meta-value">{hitungUsia(student.tanggalLahir)}</span>
            <span className="dp-meta-label dp-meta-label-right">Tahun Ajaran</span>
            <span className="rp-colon">:</span>
            <span className="dp-meta-value">{tahunAjaran}</span>
          </div>
        </div>

        <FlowerTitle>{domain.nama}</FlowerTitle>

        <div className="dp-aspek">
          {domain.aspek.map((a, idx) => {
            const tone = idx % 2 === 0 ? 'pink' : 'blue'
            const text = score.aspek[a.id]?.deskripsi ?? ''
            return (
              <div className="dp-block" key={a.id}>
                <div className={`dp-bar dp-bar-${tone}`}>{a.nama}</div>
                <div className={`dp-box dp-box-${tone}`}>
                  {text ? (
                    <p>{text}</p>
                  ) : (
                    <p className="dp-empty">Deskripsi perkembangan belum diisi.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="dp-doc">
          <FlowerTitle tone="blue">DOKUMENTASI KEGIATAN ANAK</FlowerTitle>
          <div className="dp-photos">
            {foto.map((f, i) => (
              <figure className="dp-photo" key={i}>
                <div className="dp-photo-box">
                  {f.src ? <img src={f.src} alt={`Dokumentasi ${i + 1}`} /> : <span>Foto kegiatan {i + 1}</span>}
                </div>
                <figcaption>Keterangan: {f.keterangan}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </ReportPage>
  )
}
