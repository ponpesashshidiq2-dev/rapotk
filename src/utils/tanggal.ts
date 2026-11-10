const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

function parse(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatTanggalIndo(iso: string): string {
  const d = parse(iso)
  if (!d) return iso || '-'
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

export function formatTanggalPanjang(date: Date): string {
  return `${date.getDate()} ${BULAN[date.getMonth()]} ${date.getFullYear()}`
}

export function hitungUsia(iso: string, ref: Date = new Date()): string {
  const d = parse(iso)
  if (!d) return '-'
  let years = ref.getFullYear() - d.getFullYear()
  let months = ref.getMonth() - d.getMonth()
  if (ref.getDate() < d.getDate()) months -= 1
  if (months < 0) {
    months += 12
    years -= 1
  }
  if (years < 0) return '-'
  return `${years} tahun ${months} bulan`
}

export function usiaTahun(iso: string, ref: Date = new Date()): string {
  const d = parse(iso)
  if (!d) return '-'
  const years = Math.floor((ref.getTime() - d.getTime()) / (365.25 * 24 * 3600 * 1000))
  return years < 0 ? '-' : `${years} tahun`
}
