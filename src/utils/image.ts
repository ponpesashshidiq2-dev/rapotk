export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca file'))
    reader.readAsDataURL(file)
  })
}

interface Loaded {
  drawable: CanvasImageSource
  width: number
  height: number
  release: () => void
}

async function toLoaded(file: File): Promise<Loaded> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { drawable: bmp, width: bmp.width, height: bmp.height, release: () => bmp.close() }
    } catch {
      /* lanjut ke fallback */
    }
  }
  const dataUrl = await readFileAsDataUrl(file)
  const img = new Image()
  img.decoding = 'async'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Gambar tidak dapat dibuka'))
    img.src = dataUrl
  })
  return {
    drawable: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    release: () => undefined,
  }
}

export async function compressImage(file: File, maxDim = 1400, quality = 0.76): Promise<string> {
  const loaded = await toLoaded(file)
  try {
    const { width, height } = loaded
    const scale = Math.min(1, maxDim / Math.max(width, height))
    const w = Math.max(1, Math.round(width * scale))
    const h = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return await readFileAsDataUrl(file)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(loaded.drawable, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    loaded.release()
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
