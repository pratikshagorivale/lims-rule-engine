import { CheckCircle2, ListChecks, ShieldCheck, XCircle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { StatusBadge } from './StatusBadge'
import { cn } from '../lib/cn'
import { buildSimulationChecks } from '../lib/simulationChecks'
import type { ReportStatus, SimulationReportRow } from '../data/types'

interface SimulationStatusModalProps {
  report: SimulationReportRow | null
  ruleId: string
  onClose: () => void
}

function reportStatusTone(status: ReportStatus) {
  switch (status) {
    case 'Approved':
      return 'success' as const
    case 'Completed':
      return 'info' as const
    case 'Pending Approval':
    case 'Awaiting Review':
      return 'warning' as const
    case 'In Progress':
      return 'neutral' as const
  }
}

export function SimulationStatusModal({ report, ruleId, onClose }: SimulationStatusModalProps) {
  if (!report) return null

  const autoApproved = report.status === 'Auto Approved'
  const checks = buildSimulationChecks(report, ruleId)

  return (
    <Modal
      open={!!report}
      onClose={onClose}
      icon={<ShieldCheck className="h-4 w-4" />}
      title="Simulation Status"
      description={`Accession No: ${report.accession}  |  Patient: ${report.patient} · ${report.mrn} (${report.sex} · ${report.age} yrs)`}
      maxWidth="max-w-2xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Service name + report status */}
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="text-slate-500">Service Name:</span>
          <span className="font-semibold text-slate-900">{report.test}</span>
          <StatusBadge tone={reportStatusTone(report.reportStatus)}>
            {report.reportStatus}
          </StatusBadge>
        </div>

        {/* Final decision banner */}
        <div
          className={cn(
            'flex items-start gap-2.5 rounded-lg border px-3.5 py-3',
            autoApproved
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-rose-200 bg-rose-50',
          )}
        >
          {autoApproved ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          )}
          <div>
            <p
              className={cn(
                'text-[13px] font-bold',
                autoApproved ? 'text-emerald-800' : 'text-rose-800',
              )}
            >
              Simulated Decision: {autoApproved ? 'Auto Approved' : 'Review Required'}
            </p>
            <p
              className={cn(
                'mt-0.5 text-[12px] leading-relaxed',
                autoApproved ? 'text-emerald-700/90' : 'text-rose-700/90',
              )}
            >
              {autoApproved
                ? 'This report would be auto-approved because all configured validation checks passed successfully.'
                : 'This report would be routed for manual review because one or more validation checks did not pass.'}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2.5 flex items-center gap-1.5">
            <ListChecks className="h-4 w-4 text-slate-500" />
            <h3 className="text-[13px] font-semibold text-slate-900">Rule Evaluation Breakdown</h3>
          </div>
          <div className="space-y-2">
            {checks.map((c) => (
              <div key={c.id} className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[13px] font-semibold text-slate-800">{c.label}</h4>
                  <StatusBadge tone={c.passed ? 'success' : 'danger'}>
                    {c.passed ? 'Passed' : 'Failed'}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
