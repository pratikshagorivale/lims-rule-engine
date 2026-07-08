import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  icon?: React.ReactNode
  maxWidth?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  icon,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative my-auto flex w-full max-h-[min(90dvh,calc(100vh-2rem))] flex-col overflow-hidden rounded-lg bg-white card-shadow-lg animate-scale-in',
            maxWidth,
          )}
        >
          <div className="flex shrink-0 items-start gap-3 border-b border-slate-200 px-5 py-3.5">
            {icon && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
              {description && (
                <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            {children}
          </div>

          {footer && (
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
