import { cn } from '../../lib/cn'

const STEPS = [
  'Rule Details',
  'Select Rules',
  'Apply To',
  'Map Tests',
  'Run Simulation',
  'Enable Rule',
] as const

const SHORT_LABELS = ['Details', 'Rules', 'Apply', 'Tests', 'Simulate', 'Enable'] as const

export function WizardStepper({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        {STEPS.map((label, idx) => {
          const n = idx + 1
          const active = step === n
          const done = step > n
          return (
            <div key={label} className="flex flex-col items-center gap-1.5 px-0.5 text-center">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                  active && 'bg-brand-600 text-white shadow-sm ring-4 ring-brand-100',
                  done && !active && 'bg-emerald-500 text-white',
                  !active && !done && 'bg-slate-100 text-slate-400',
                )}
              >
                {done && !active ? '✓' : n}
              </span>
              <span
                className={cn(
                  'hidden text-[10px] font-semibold leading-tight sm:block',
                  active && 'text-brand-700',
                  done && !active && 'text-slate-600',
                  !active && !done && 'text-slate-400',
                )}
              >
                {SHORT_LABELS[idx]}
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-[12px] font-semibold text-slate-700 sm:hidden">
        Step {step} of {STEPS.length}: {STEPS[step - 1]}
      </p>
    </div>
  )
}
