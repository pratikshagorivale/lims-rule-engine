import { useState } from 'react'
import {
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Download,
  Eye,
  FileBarChart,
  RotateCcw,
} from 'lucide-react'
import type { ReportStatus, SimulationResult, SimulationReportRow } from '../data/types'
import { exportSimulationReport } from '../lib/exportSimulationReport'
import { StatusBadge } from './StatusBadge'
import { SearchInput } from './SearchInput'
import { FailureBarChart } from './FailureBarChart'
import { Button } from './Button'
import { SimulationStatusModal } from './SimulationStatusModal'
import { cn } from '../lib/cn'

type Tone = 'success' | 'info' | 'warning' | 'neutral' | 'danger'

function reportStatusTone(status: ReportStatus): Tone {
  switch (status) {
    case 'Approved':
      return 'success'
    case 'Completed':
      return 'info'
    case 'Pending Approval':
    case 'Awaiting Review':
      return 'warning'
    case 'In Progress':
      return 'neutral'
  }
}

interface SimulationResultsProps {
  result: SimulationResult
  rangeLabel: string
  ruleName: string
  ruleId: string
  onReRun: () => void
}

export function SimulationResults({ result, rangeLabel, ruleName, ruleId, onReRun }: SimulationResultsProps) {
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState<SimulationReportRow | null>(null)

  const rows = result.rows.filter((r) => {
    const q = query.toLowerCase()
    return (
      r.patient.toLowerCase().includes(q) ||
      r.test.toLowerCase().includes(q) ||
      r.accession.toLowerCase().includes(q)
    )
  })

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-600">
            <FileBarChart className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-slate-900">Simulation Results</h2>
            <p className="text-[11px] text-slate-400">{rangeLabel}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportSimulationReport({ result, rangeLabel, ruleName, ruleId })}
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </Button>
          <Button variant="secondary" size="sm" onClick={onReRun}>
            <RotateCcw className="h-3.5 w-3.5" />
            Re-run Simulation
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Reports"
          value={result.totalReports}
          icon={<ClipboardList className="h-4 w-4" />}
          tone="slate"
          hint="Historical reports in scope"
        />
        <SummaryCard
          label="Eligible for Auto Approval"
          value={result.eligible}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
          hint={`${result.eligibleRate}% of total reports`}
        />
        <SummaryCard
          label="Requires Manual Review"
          value={result.manualReview}
          icon={<Eye className="h-4 w-4" />}
          tone="rose"
          hint={`${(100 - result.eligibleRate).toFixed(1)}% of total reports`}
        />
      </div>

      {/* Failure reason chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 card-shadow">
        <h3 className="text-[13px] font-semibold text-slate-800">Reasons for Manual Review</h3>
        <p className="mb-4 text-[11px] text-slate-400">
          Why {result.manualReview.toLocaleString()} reports did not qualify for auto approval
        </p>
        <FailureBarChart data={result.failureBreakdown} />
      </div>

      {/* Breakdown table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow">
        <div className="flex flex-col gap-2.5 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-800">Report Breakdown</h3>
            <p className="text-[11px] text-slate-400">
              Representative sample of reports in this simulation
            </p>
          </div>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search patients, tests, accession…"
            className="w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2">Patient Name</th>
                <th className="px-4 py-2">Test</th>
                <th className="px-4 py-2">Accession Number</th>
                <th className="px-4 py-2">Report Status</th>
                <th className="px-4 py-2">Auto Approval Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setDetail(r)}
                  className="cursor-pointer transition-colors hover:bg-slate-50/70"
                >
                  <td className="whitespace-nowrap px-4 py-2">
                    <div className="font-semibold text-slate-800">{r.patient}</div>
                    <div className="text-[11px] text-slate-400">{r.mrn}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-600">{r.test}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-medium tabular-nums text-slate-700">
                    {r.accession}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge tone={reportStatusTone(r.reportStatus)}>
                      {r.reportStatus}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge tone={r.status === 'Auto Approved' ? 'success' : 'danger'} dot>
                      {r.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDetail(r)
                      }}
                    >
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      Review Report
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-slate-400">
                    No reports match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulation status modal */}
      <SimulationStatusModal report={detail} ruleId={ruleId} onClose={() => setDetail(null)} />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
  hint,
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone: 'slate' | 'emerald' | 'rose'
  hint: string
}) {
  const tones = {
    slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3.5 card-shadow">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-slate-500">{label}</p>
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', tones[tone].bg, tones[tone].text)}>
          {icon}
        </div>
      </div>
      <p className="mt-2 text-[24px] font-bold tracking-tight text-slate-900 tabular-nums">
        {value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>
    </div>
  )
}

