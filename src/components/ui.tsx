import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { compressImage } from '../utils/image'

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

export function Btn({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...rest
}: {
  variant?: BtnVariant
  className?: string
  type?: 'button' | 'submit'
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}

export function Field({
  label,
  children,
  hint,
  stacked = false,
}: {
  label: string
  children: ReactNode
  hint?: string
  stacked?: boolean
}) {
  return (
    <label className={`field ${stacked ? 'field-stacked' : ''}`}>
      <span className="field-label">{label}</span>
      <span className="field-control">
        {children}
        {hint ? <small className="field-hint">{hint}</small> : null}
      </span>
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input className={`input ${className}`.trim()} {...rest} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return <textarea className={`textarea ${className}`.trim()} {...rest} />
}

export function Select({
  className = '',
  children,
  ...rest
}: { className?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`input select ${className}`.trim()} {...rest}>
      {children}
    </select>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  )
}

export function PhotoPicker({
  value,
  onChange,
  label,
  previewClass = '',
  accept = 'image/*',
}: {
  value: string
  onChange: (dataUrl: string) => void
  label: string
  previewClass?: string
  accept?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const busy = useRef(false)

  async function handleFile(file: File | undefined) {
    if (!file || busy.current) return
    busy.current = true
    try {
      const dataUrl = await compressImage(file, 1400, 0.78)
      onChange(dataUrl)
    } catch (err) {
      alert(`Gagal memproses gambar: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      busy.current = false
      if (ref.current) ref.current.value = ''
    }
  }

  return (
    <div className="photo-picker">
      <span className="photo-picker-label">{label}</span>
      <div className={`photo-preview ${previewClass}`.trim()}>
        {value ? <img src={value} alt={label} /> : <span className="photo-placeholder">Belum ada foto</span>}
      </div>
      <div className="photo-actions">
        <Btn variant="secondary" onClick={() => ref.current?.click()}>
          {value ? 'Ganti foto' : 'Pilih foto'}
        </Btn>
        {value ? (
          <Btn variant="ghost" onClick={() => onChange('')}>
            Hapus
          </Btn>
        ) : null}
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  )
}

export function SectionCard({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      <header className="card-head">
        <h3>{title}</h3>
        {actions ? <div className="card-actions">{actions}</div> : null}
      </header>
      <div className="card-body">{children}</div>
    </section>
  )
}
