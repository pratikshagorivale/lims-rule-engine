import { cn } from '../../lib/cn'

export function ConfigNumberInput({
  value,
  onChange,
  disabled,
  suffix,
  className,
}: {
  value: number | null
  onChange: (v: number | null) => void
  disabled?: boolean
  suffix?: string
  className?: string
}) {
  return (
    <div className={cn('relative w-24', className)}>
      <input
        type="number"
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className={cn(
          'h-7 w-full rounded border px-2 text-[13px] tabular-nums transition-colors focus:outline-none focus:ring-2',
          suffix ? 'pr-6' : '',
          disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            : 'border-slate-300 bg-white text-slate-800 focus:border-brand-500 focus:ring-brand-100',
        )}
      />
      {suffix && (
        <span
          className={cn(
            'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium',
            disabled ? 'text-slate-300' : 'text-slate-400',
          )}
        >
          {suffix}
        </span>
      )}
    </div>
  )
}
