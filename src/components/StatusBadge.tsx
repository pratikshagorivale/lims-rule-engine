import { cn } from '../lib/cn'

type Tone = 'active' | 'inactive' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'

const toneStyles: Record<Tone, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

interface StatusBadgeProps {
  tone?: Tone
  children: React.ReactNode
  dot?: boolean
  className?: string
}

export function StatusBadge({ tone = 'neutral', children, dot = false, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        toneStyles[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            tone === 'active' || tone === 'success'
              ? 'bg-emerald-500'
              : tone === 'danger'
                ? 'bg-rose-500'
                : tone === 'warning'
                  ? 'bg-amber-500'
                  : tone === 'info'
                    ? 'bg-brand-500'
                    : 'bg-slate-400',
          )}
        />
      )}
      {children}
    </span>
  )
}
