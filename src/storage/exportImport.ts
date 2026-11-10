import type { AppState } from '../types'
import { createInitialState } from '../defaults'

export const EXPORT_FILE_PREFIX = 'raport-tk'

export function exportToJson(state: AppState): void {
  const payload = { ...state, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `${EXPORT_FILE_PREFIX}-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

function sanitizeArray<T>(v: unknown, fn: (item: unknown) => T | null): T[] {
  if (!Array.isArray(v)) return []
  const out: T[] = []
  for (const item of v) {
    const parsed = fn(item)
    if (parsed) out.push(parsed)
  }
  return out
}

function sanitizeProfile(v: unknown): AppState['profile'] {
  const base = createInitialState().profile
  if (!isRecord(v)) return base
  const out = { ...base }
  for (const key of Object.keys(base) as (keyof typeof base)[]) {
    const val = v[key]
    if (typeof val === 'string') out[key] = val
  }
  return out
}

function sanitizeStudent(v: unknown): AppState['students'][number] | null {
  if (!isRecord(v) || typeof v.id !== 'string') return null
  const out: AppState['students'][number] = {
    id: v.id,
    foto: typeof v.foto === 'string' ? v.foto : '',
    namaLengkap: typeof v.namaLengkap === 'string' ? v.namaLengkap : '',
    namaPanggilan: typeof v.namaPanggilan === 'string' ? v.namaPanggilan : '',
    nisn: typeof v.nisn === 'string' ? v.nisn : '',
    tempatLahir: typeof v.tempatLahir === 'string' ? v.tempatLahir : '',
    tanggalLahir: typeof v.tanggalLahir === 'string' ? v.tanggalLahir : '',
    jenisKelamin: typeof v.jenisKelamin === 'string' ? v.jenisKelamin : '',
    agama: typeof v.agama === 'string' ? v.agama : '',
    anakKe: typeof v.anakKe === 'string' ? v.anakKe : '',
    jumlahSaudara: typeof v.jumlahSaudara === 'string' ? v.jumlahSaudara : '',
    kelompok: typeof v.kelompok === 'string' ? v.kelompok : '',
    ayahNama: typeof v.ayahNama === 'string' ? v.ayahNama : '',
    ayahPekerjaan: typeof v.ayahPekerjaan === 'string' ? v.ayahPekerjaan : '',
    ibuNama: typeof v.ibuNama === 'string' ? v.ibuNama : '',
    ibuPekerjaan: typeof v.ibuPekerjaan === 'string' ? v.ibuPekerjaan : '',
    waliNama: typeof v.waliNama === 'string' ? v.waliNama : '',
    alamat: isRecord(v.alamat)
      ? {
          jalan: typeof v.alamat.jalan === 'string' ? v.alamat.jalan : '',
          rtRw: typeof v.alamat.rtRw === 'string' ? v.alamat.rtRw : '',
          desa: typeof v.alamat.desa === 'string' ? v.alamat.desa : '',
          kecamatan: typeof v.alamat.kecamatan === 'string' ? v.alamat.kecamatan : '',
          kabupaten: typeof v.alamat.kabupaten === 'string' ? v.alamat.kabupaten : '',
          provinsi: typeof v.alamat.provinsi === 'string' ? v.alamat.provinsi : '',
        }
      : { jalan: '', rtRw: '', desa: '', kecamatan: '', kabupaten: '', provinsi: '' },
  }
  return out
}

function sanitizeDomain(v: unknown): AppState['domains'][number] | null {
  if (!isRecord(v) || typeof v.id !== 'string' || typeof v.nama !== 'string') return null
  return {
    id: v.id,
    nama: v.nama,
    aspek: sanitizeArray(v.aspek, (a) => {
      if (!isRecord(a) || typeof a.id !== 'string' || typeof a.nama !== 'string') return null
      return {
        id: a.id,
        nama: a.nama,
        capaian: sanitizeArray(a.capaian, (c) => {
          if (!isRecord(c) || typeof c.id !== 'string' || typeof c.label !== 'string') return null
          return { id: c.id, label: c.label }
        }),
      }
    }),
  }
}

function sanitizeReport(v: unknown): AppState['reports'][number] | null {
  if (!isRecord(v) || typeof v.studentId !== 'string') return null
  const domains: AppState['reports'][number]['domains'] = {}
  if (isRecord(v.domains)) {
    for (const [domainId, raw] of Object.entries(v.domains)) {
      if (!isRecord(raw)) continue
      const aspek: Record<string, { capaianIds: string[]; deskripsi: string }> = {}
      if (isRecord(raw.aspek)) {
        for (const [aspekId, s] of Object.entries(raw.aspek)) {
          if (!isRecord(s)) continue
          aspek[aspekId] = {
            capaianIds: Array.isArray(s.capaianIds)
              ? s.capaianIds.filter((x): x is string => typeof x === 'string')
              : [],
            deskripsi: typeof s.deskripsi === 'string' ? s.deskripsi : '',
          }
        }
      }
      const foto = sanitizeArray(raw.foto, (f) => {
        if (!isRecord(f) || typeof f.src !== 'string') return null
        return { src: f.src, keterangan: typeof f.keterangan === 'string' ? f.keterangan : '' }
      })
      domains[domainId] = { aspek, foto }
    }
  }
  return { studentId: v.studentId, domains }
}

export function parseImported(text: string): AppState {
  const raw: unknown = JSON.parse(text)
  if (!isRecord(raw)) throw new Error('Format file tidak valid')
  const base = createInitialState()
  const profile = sanitizeProfile(raw.profile)
  const students = sanitizeArray(raw.students, sanitizeStudent)
  const domains = sanitizeArray(raw.domains, sanitizeDomain)
  const reports = sanitizeArray(raw.reports, sanitizeReport)
  const tahun =
    isRecord(raw.settings) && typeof raw.settings.tahunAjaran === 'string'
      ? raw.settings.tahunAjaran
      : base.settings.tahunAjaran
  if (!students.length && !domains.length) throw new Error('File tidak berisi data raport')
  return {
    version: 1,
    profile,
    students,
    domains: domains.length ? domains : base.domains,
    reports,
    settings: { tahunAjaran: tahun },
  }
}

export function readImportFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca file'))
    reader.readAsText(file)
  })
}
