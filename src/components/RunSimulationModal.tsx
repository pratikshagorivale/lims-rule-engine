import { useState } from 'react'
import { CalendarDays, FlaskConical, Info, Loader2, PlayCircle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import type { DateRangePreset, MappedTest, SimulationInput } from '../data/types'

interface RunSimulationModalProps {
  open: boolean
  onClose: () => void
  mappedTests: MappedTest[]
  running: boolean
  onRun: (input: SimulationInput) => void
}

const RANGE_OPTIONS: { key: DateRangePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'this-week', label: 'This Week' },
  { key: 'last-week', label: 'Last Week' },
  { key: 'this-month', label: 'This Month' },
  { key: 'last-month', label: 'Last Month' },
]

const fieldClass =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[13px] text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function resolveRange(key: DateRangePreset): { from: Date; to: Date } {
  const today = startOfDay(new Date())
  const mondayOffset = (today.getDay() + 6) % 7
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - mondayOffset)

  switch (key) {
    case 'today':
      return { from: today, to: today }
    case 'yesterday': {
      const y = new Date(today)
      y.setDate(today.getDate() - 1)
      return { from: y, to: y }
    }
    case 'this-week': {
      const end = new Date(weekStart)
      end.setDate(weekStart.getDate() + 6)
      return { from: weekStart, to: end }
    }
    case 'last-week': {
      const start = new Date(weekStart)
      start.setDate(weekStart.getDate() - 7)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return { from: start, to: end }
    }
    case 'this-month':
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      }
    case 'last-month':
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      }
  }
}

function toISO(d: Date): string {
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function RunSimulationModal({ open, onClose, mappedTests, running, onRun }: RunSimulationModalProps) {
  const [rangeKey, setRangeKey] = useState<DateRangePreset>('this-month')

  const { from, to } = resolveRange(rangeKey)
  const previewLabel =
    from.getTime() === to.getTime()
      ? formatDate(from)
      : `${formatDate(from)} – ${formatDate(to)}`

  const unconfigured = mappedTests.filter((t) => !t.autoApprovalRange).length
  const noTests = mappedTests.length === 0

  const handleRun = () => {
    const opt = RANGE_OPTIONS.find((o) => o.key === rangeKey)!
    onRun({ rangeKey, rangeLabel: opt.label, fromDate: toISO(from), toDate: toISO(to) })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<PlayCircle className="h-4 w-4" />}
      title="Run Simulation"
      description="Run this rule against historical reports to estimate how many reports would qualify for automatic approval."
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={running}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRun} disabled={running || noTests}>
            {running ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <PlayCircle className="h-3.5 w-3.5" />
                Run Simulation
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Date range preset */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            Date Range
          </div>
          <select value={rangeKey} onChange={(e) => setRangeKey(e.target.value as DateRangePreset)} className={fieldClass}>
            {RANGE_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-slate-400">{previewLabel}</p>
        </div>

        {/* Scope */}
        <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
          <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <p className="text-[12px] leading-relaxed text-slate-600">
            {noTests ? (
              <>No tests are mapped to this rule. Add tests before running a simulation.</>
            ) : (
              <>
                This simulation runs on all{' '}
                <span className="font-semibold text-slate-800">{mappedTests.length}</span>{' '}
                {mappedTests.length === 1 ? 'test' : 'tests'} mapped to this rule.
              </>
            )}
          </p>
        </div>

        {/* Normal-range note for newly added tests */}
        {unconfigured > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50/70 px-3 py-2.5">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
            <p className="text-[12px] leading-relaxed text-brand-900/80">
              <span className="font-semibold">{unconfigured}</span> newly added{' '}
              {unconfigured === 1 ? 'test does' : 'tests do'} not have auto approval ranges
              configured yet — their results will be evaluated against the defined normal ranges.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
