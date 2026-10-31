import { useEffect, useId, useState } from 'react'
import { Button, Textarea } from '../ui'

// Diálogo modal simple. Con `conComentario` muestra un campo opcional que se
// pasa a onConfirm(comentario). El contenido se monta al abrir, así el
// comentario empieza vacío cada vez.
export function ConfirmDialog(props) {
  if (!props.open) return null
  return <DialogContent {...props} />
}

function DialogContent({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Volver',
  variant = 'primary',
  conComentario = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  const titleId = useId()
  const [comentario, setComentario] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !loading && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loading, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {description && <div className="mt-2 text-sm text-slate-600">{description}</div>}
        {conComentario && (
          <Textarea
            className="mt-4"
            label="Motivo (opcional)"
            rows={2}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={300}
          />
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} loading={loading} onClick={() => onConfirm(comentario)} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
