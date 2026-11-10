import type { Aspect } from '../types'

function joinList(items: string[]): string {
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

export function labelsFor(aspek: Aspect, capaianIds: string[]): string[] {
  const picked: string[] = []
  for (const id of capaianIds) {
    const item = aspek.capaian.find((c) => c.id === id)
    if (item && item.label.trim()) picked.push(item.label.trim())
  }
  return picked
}

export function generateDeskripsi(namaAnak: string, aspek: Aspect, capaianIds: string[]): string {
  const labels = labelsFor(aspek, capaianIds)
  if (!labels.length) return ''
  const anak = namaAnak.trim() || 'Anak'
  const daftar = joinList(labels)
  const a = anak.charAt(0).toUpperCase() + anak.slice(1)
  return (
    `${a} menunjukkan perkembangan pada aspek ${aspek.nama.toLowerCase()}. ` +
    `Hal-hal yang sudah mulai dilakukan antara lain ${daftar}. ` +
    `Dalam kegiatan sehari-hari di sekolah, ${anak} mulai terbiasa melakukannya dengan pendampingan guru.`
  )
}
