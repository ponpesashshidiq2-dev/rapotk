import type { AppState } from '../types'

const DB_NAME = 'raport-tk'
const STORE = 'kv'
const KEY = 'state'
const LS_KEY = 'raport-tk-state'

function timed<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err: unknown) => {
        clearTimeout(timer)
        reject(err instanceof Error ? err : new Error(String(err)))
      },
    )
  })
}

function openDb(): Promise<IDBDatabase> {
  const open = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB tidak tersedia'))
      return
    }
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Gagal membuka database'))
    req.onblocked = () => reject(new Error('Database diblokir'))
  })
  return timed(open, 3000, 'IndexedDB tidak merespons')
}

function idbGet<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
  const read = new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
  return timed(read, 3000, 'Gagal membaca database')
}

function idbSet(db: IDBDatabase, key: string, value: unknown): Promise<void> {
  const write = new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  return timed(write, 5000, 'Gagal menulis database')
}

export async function loadState(): Promise<AppState | null> {
  try {
    const db = await openDb()
    const value = await idbGet<AppState>(db, KEY)
    db.close()
    if (value && typeof value === 'object') return value
  } catch {
    /* fallback ke localStorage */
  }
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AppState
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    const db = await openDb()
    await idbSet(db, KEY, state)
    db.close()
    return
  } catch {
    /* fallback ke localStorage */
  }
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch (err) {
    console.error('Gagal menyimpan data', err)
  }
}
