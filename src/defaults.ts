import type { AppState, Aspect, Capaian, LearningDomain, SchoolProfile, Student } from './types'
import { newId } from './utils/id'

function caps(aspekId: string, labels: string[]): Capaian[] {
  return labels.map((label, i) => ({ id: `${aspekId}-c${i + 1}`, label }))
}

function aspek(id: string, nama: string, labels: string[]): Aspect {
  return { id, nama, capaian: caps(id, labels) }
}

export const DEFAULT_PROFILE: SchoolProfile = {
  logo: '',
  namaSekolah: '',
  npsn: '',
  statusSekolah: '',
  jenjang: '',
  alamatJalan: '',
  rtRw: '',
  desa: '',
  kecamatan: '',
  kabupaten: '',
  provinsi: '',
  kodePos: '',
  telepon: '',
  email: '',
  kepalaSekolah: '',
  guruKelompok: '',
  footer: 'SAHABAT GURU',
}

export function createStudent(): Student {
  return {
    id: newId(),
    foto: '',
    namaLengkap: '',
    namaPanggilan: '',
    nisn: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    agama: '',
    anakKe: '',
    jumlahSaudara: '',
    kelompok: '',
    ayahNama: '',
    ayahPekerjaan: '',
    ibuNama: '',
    ibuPekerjaan: '',
    waliNama: '',
    alamat: { jalan: '', rtRw: '', desa: '', kecamatan: '', kabupaten: '', provinsi: '' },
  }
}

export const DEFAULT_DOMAINS: LearningDomain[] = [
  {
    id: 'cp-agama',
    nama: 'Nilai Agama dan Budi Pekerti',
    aspek: [
      aspek('as-agama-ibadah', 'Pembiasaan ibadah dan doa', [
        'berdoa sebelum dan sesudah kegiatan',
        'mengikuti ibadah sesuai keyakinan',
        'mengucapkan syukur',
        'mengenal dan membaca doa harian',
        'mengikuti kegiatan keagamaan dengan tertib',
      ]),
      aspek('as-agama-perilaku', 'Perilaku baik dan kepedulian', [
        'berkata jujur',
        'menggunakan kata-kata santun',
        'mengucapkan terima kasih dan meminta maaf',
        'menghargai guru dan teman',
        'berbagi alat bermain',
        'membantu teman',
        'menjaga barang bersama',
      ]),
    ],
  },
  {
    id: 'cp-jatidiri',
    nama: 'Jati Diri',
    aspek: [
      aspek('as-jd-identitas', 'Identitas diri dan percaya diri', [
        'menyebutkan nama lengkap',
        'mengenali ciri diri',
        'menyampaikan pilihan',
        'berani mencoba pengalaman baru',
        'menyampaikan pendapat',
      ]),
      aspek('as-jd-kemandirian', 'Kemandirian dan tanggung jawab', [
        'menyimpan tas dan sepatu',
        'mencuci tangan sendiri',
        'makan dan minum mandiri',
        'merapikan alat bermain',
        'menggunakan perlengkapan pribadi',
        'buang air di toilet',
      ]),
      aspek('as-jd-emosional', 'Emosional dan hubungan sosial', [
        'berbagi',
        'menunggu giliran',
        'bekerja sama dengan teman',
        'mengungkapkan perasaan dengan tepat',
        'menyelesaikan percekcokan sederhana',
        'bermain bersama teman',
        'menghibur teman yang sedang bersedih',
      ]),
      aspek('as-jd-kesehatan', 'Kesehatan dan keselamatan diri', [
        'mencuci tangan sebelum makan',
        'mengenal bagian tubuh',
        'makan makanan bergizi',
        'berhati-hati dengan benda tajam dan panas',
        'bermain dengan aman',
        'mengenal aturan keselamatan lalu lintas',
      ]),
    ],
  },
  {
    id: 'cp-literasi',
    nama: 'Dasar-dasar Literasi, Matematika, Sains, Teknologi, Rekayasa, dan Seni',
    aspek: [
      aspek('as-lit-kom', 'Literasi dan komunikasi', [
        'menyimak cerita',
        'melihat buku bergambar',
        'bercakap-cakap dan menyampaikan pengalaman',
        'menjawab pertanyaan sederhana',
        'menyebutkan tokoh atau benda yang dilihat',
        'mengenal coretan bermakna',
      ]),
      aspek('as-lit-mat', 'Matematika awal', [
        'menghitung benda',
        'membandingkan banyak dan sedikit',
        'mengenali bentuk dan warna',
        'mengelompokkan benda',
        'melanjutkan pola sederhana',
        'mengenal angka 1 sampai 10',
      ]),
      aspek('as-lit-sains', 'Sains dan eksplorasi', [
        'mengamati objek dan kejadian',
        'membandingkan sifat benda',
        'bereksperimen sederhana',
        'merawat tanaman dan hewan',
        'menyampaikan hasil pengamatan',
      ]),
      aspek('as-lit-teknologi', 'Teknologi, rekayasa, dan keterampilan', [
        'menggunakan alat sederhana',
        'memecahkan masalah sederhana',
        'membuat karya dari bahan bekas',
        'merancang dan menguji hasil karya',
        'mengenal teknologi dalam kegiatan sehari-hari',
      ]),
      aspek('as-lit-seni', 'Seni dan kreativitas', [
        'bernyanyi',
        'menari',
        'menggambar dan mewarnai',
        'membuat kolase dan karya tiga dimensi',
        'bermain peran',
        'memainkan alat musik sederhana',
      ]),
    ],
  },
  {
    id: 'cp-kemuhammadiyah',
    nama: 'Kemuhammadiyah',
    aspek: [
      aspek('as-km-kegiatan', 'Kegiatan dan hari besar Muhammadiyah', [
        'mengikuti kegiatan sekolah dengan tertib',
        'mengikuti kegiatan sosial dan bakti',
        'mengenal hari besar Muhammadiyah',
        'mengikuti kegiatan kepramukaan dan pandu',
      ]),
      aspek('as-km-sosial', 'Kepedulian sosial dan amal', [
        'berinfak dan bersedekah',
        'menolong teman dan orang yang membutuhkan',
        'menjaga kebersihan lingkungan sekolah',
        'memilah sampah',
        'berbagi dengan sesama',
      ]),
      aspek('as-km-adab', 'Adab dan norma dalam kehidupan', [
        'sopan santun kepada guru dan tamu',
        'berterima kasih dan meminta maaf',
        'menjaga ketertiban kelompok',
        'mengenal lambang dan mars Muhammadiyah',
      ]),
    ],
  },
  {
    id: 'cp-aik',
    nama: 'AIK (Al-Islam dan Kemuhammadiyah)',
    aspek: [
      aspek('as-aik-islam', 'Al-Islam: ibadah dan adab', [
        'berwudu dan shalat berjamaah',
        'mengucapkan kalimat thayyibah',
        'mengamalkan adab sehari-hari',
        'membaca basmalah dan hamdalah',
      ]),
      aspek('as-aik-quran', "Al-Qur'an dan doa harian", [
        'membaca surah pendek juz 30',
        'menghafal doa sebelum dan sesudah kegiatan',
        'mengenal huruf hijaiyah',
        'mengikuti murajaah dengan lancar',
      ]),
      aspek('as-aik-akhlak', 'Akhlak dan keteladanan', [
        'jujur dan amanah',
        'menyayangi orang tua dan guru',
        'memuliakan tamu',
        'meneladani akhlak Rasulullah',
      ]),
    ],
  },
]

export const DEFAULT_TAHUN_AJARAN = (() => {
  const now = new Date()
  const y = now.getFullYear()
  return now.getMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`
})()

export function createInitialState(): AppState {
  return {
    version: 1,
    profile: { ...DEFAULT_PROFILE },
    students: [],
    domains: DEFAULT_DOMAINS.map((d) => ({
      ...d,
      aspek: d.aspek.map((a) => ({ ...a, capaian: a.capaian.map((c) => ({ ...c })) })),
    })),
    reports: [],
    settings: { tahunAjaran: DEFAULT_TAHUN_AJARAN },
  }
}
