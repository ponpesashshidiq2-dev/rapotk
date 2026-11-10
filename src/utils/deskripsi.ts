import type { Aspect } from '../types'

export function labelsFor(aspek: Aspect, capaianIds: string[]): string[] {
  const picked: string[] = []
  for (const id of capaianIds) {
    const item = aspek.capaian.find((c) => c.id === id)
    if (item && item.label.trim()) picked.push(item.label.trim())
  }
  return picked
}

/**
 * Format: "Ananda <nama> <capaian1>, <capaian2>, <capaian3>."
 */
export function generateDeskripsi(namaAnak: string, aspek: Aspect, capaianIds: string[]): string {
  const labels = labelsFor(aspek, capaianIds)
  if (!labels.length) return ''
  const nama = namaAnak.trim()
  const kepala = nama ? `Ananda ${nama}` : 'Ananda'
  return `${kepala} ${labels.join(', ')}.`
}
