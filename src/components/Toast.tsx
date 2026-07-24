import type { ToastMessage } from '../types'

interface Props {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export default function Toast({ toasts, onDismiss }: Props) {
  return (
    <div className="toast-stack" aria-live="polite" role="status">
      {toasts.map((t) => (
        <button key={t.id} type="button" className={`toast ${t.level}`} onClick={() => onDismiss(t.id)}>
          <span aria-hidden="true">{t.level === 'warning' ? '⚠️' : '✅'}</span> {t.text}
        </button>
      ))}
    </div>
  )
}
