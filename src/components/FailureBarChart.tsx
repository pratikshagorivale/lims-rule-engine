import type { FailureReasonKey } from '../data/types'

interface FailureBarChartProps {
  data: { key: FailureReasonKey; count: number }[]
}

export function FailureBarChart({ data }: FailureBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100
        const share = total > 0 ? Math.round((d.count / total) * 100) : 0
        return (
          <div key={d.key} className="flex items-center gap-3">
            <div className="w-40 shrink-0 text-[12px] font-medium text-slate-600 sm:w-48">{d.key}</div>
            <div className="flex flex-1 items-center gap-2.5">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-500 animate-grow-x"
                  style={{ width: `${pct}%`, animationDelay: `${i * 80}ms` }}
                />
              </div>
              <div className="w-16 shrink-0 text-right text-[12px] tabular-nums">
                <span className="font-semibold text-slate-800">{d.count.toLocaleString()}</span>
                <span className="ml-1 text-[10px] text-slate-400">{share}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
