export interface SchoolProfile {
  logo: string
  namaSekolah: string
  npsn: string
  statusSekolah: string
  jenjang: string
  alamatJalan: string
  rtRw: string
  desa: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  kodePos: string
  telepon: string
  email: string
  kepalaSekolah: string
  guruKelompok: string
  footer: string
}

export interface Address {
  jalan: string
  rtRw: string
  desa: string
  kecamatan: string
  kabupaten: string
  provinsi: string
}

export interface Student {
  id: string
  foto: string
  namaLengkap: string
  namaPanggilan: string
  nisn: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: string
  agama: string
  anakKe: string
  jumlahSaudara: string
  kelompok: string
  ayahNama: string
  ayahPekerjaan: string
  ibuNama: string
  ibuPekerjaan: string
  waliNama: string
  alamat: Address
}

export interface Capaian {
  id: string
  label: string
}

export interface Aspect {
  id: string
  nama: string
  capaian: Capaian[]
}

export interface LearningDomain {
  id: string
  nama: string
  aspek: Aspect[]
}

export interface PhotoDoc {
  src: string
  keterangan: string
}

export interface AspectScore {
  capaianIds: string[]
  deskripsi: string
}

export interface DomainScore {
  aspek: Record<string, AspectScore>
  foto: PhotoDoc[]
}

export interface StudentReport {
  studentId: string
  domains: Record<string, DomainScore>
}

export interface Settings {
  tahunAjaran: string
}

export interface AppState {
  version: number
  profile: SchoolProfile
  students: Student[]
  domains: LearningDomain[]
  reports: StudentReport[]
  settings: Settings
}
