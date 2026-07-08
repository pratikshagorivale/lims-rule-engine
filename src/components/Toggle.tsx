import { cn } from '../lib/cn'

interface ToggleProps {
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  label?: string
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
}: ToggleProps) {
  const dims =
    size === 'sm'
      ? { track: 'h-4 w-7', knob: 'h-3 w-3', on: 'translate-x-3.5', off: 'translate-x-0.5' }
      : { track: 'h-5 w-9', knob: 'h-4 w-4', on: 'translate-x-4', off: 'translate-x-0.5' }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
        dims.track,
        checked ? 'bg-brand-600' : 'bg-slate-300',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'inline-block transform rounded-full bg-white shadow-sm transition-transform duration-200',
          dims.knob,
          checked ? dims.on : dims.off,
        )}
      />
    </button>
  )
}
