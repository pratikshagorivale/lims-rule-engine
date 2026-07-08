import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, PlayCircle, Settings2 } from 'lucide-react'
import { getRuleById } from '../data/rules'
import { extraTestsByRule } from '../data/testCatalog'
import type { MappedTest, SimulationInput, SimulationResult } from '../data/types'
import { runSimulation } from '../data/simulation'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { StatusBadge } from '../components/StatusBadge'
import { Button } from '../components/Button'
import { Toggle } from '../components/Toggle'
import { MappedTests } from '../components/MappedTests'
import { RunSimulationModal } from '../components/RunSimulationModal'
import { SimulationResults } from '../components/SimulationResults'
import { ConfigureAutoApprovalModal } from '../components/autoApprovalConfig/AutoApprovalConfigPanel'
import { cn } from '../lib/cn'

export function RuleDetailsPage() {
  const { ruleId = '' } = useParams()
  const rule = getRuleById(ruleId)

  const [mapped, setMapped] = useState<MappedTest[]>(rule?.mappedTests ?? [])
  const [modalOpen, setModalOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [rangeLabel, setRangeLabel] = useState('')

  // Full catalog of tests available for this rule's domain (originals + extras).
  const catalog = useMemo<MappedTest[]>(() => {
    const originals = rule?.mappedTests ?? []
    const extras = extraTestsByRule[ruleId] ?? []
    return [...originals, ...extras]
  }, [rule, ruleId])

  if (!rule) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-[15px] font-semibold text-slate-700">Rule not found</p>
        <Link to="/" className="mt-2 inline-block text-[13px] font-medium text-brand-600">
          Back to Rule Engine
        </Link>
      </div>
    )
  }

  const addTest = (test: MappedTest) => {
    // Newly mapped tests are unconfigured — their auto approval ranges (and
    // delta/linearity settings) are not sent until configured & activated.
    const newlyAdded: MappedTest = {
      ...test,
      autoApprovalRange: false,
      deltaCheck: false,
      linearityCheck: false,
    }
    setMapped((prev) => (prev.some((t) => t.id === test.id) ? prev : [...prev, newlyAdded]))
  }

  const removeTest = (id: string) => {
    setMapped((prev) => prev.filter((t) => t.id !== id))
  }

  const handleRun = (input: SimulationInput) => {
    setRunning(true)
    const span =
      input.fromDate === input.toDate
        ? formatDate(input.fromDate)
        : `${formatDate(input.fromDate)} – ${formatDate(input.toDate)}`
    const label = `${input.rangeLabel} · ${span}`
    setTimeout(() => {
      setResult(runSimulation(rule.id, input))
      setRangeLabel(label)
      setRunning(false)
      setModalOpen(false)
      setTimeout(() => {
        document.getElementById('sim-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }, 1000)
  }

  return (
    <div className="mx-auto w-full max-w-[1360px] px-6 py-5">
      <Breadcrumbs items={[{ label: 'Rule Engine', to: '/' }, { label: rule.name }]} />

      {/* Title bar */}
      <div className="mt-2.5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-bold tracking-tight text-slate-900">{rule.name}</h1>
            <StatusBadge tone="active" dot>
              {rule.status}
            </StatusBadge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">
              System Default
            </span>
            <span className="text-slate-400">{rule.domain}</span>
          </div>
          <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-slate-500">
            {rule.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            <PlayCircle className="h-3.5 w-3.5" />
            Run Simulation
          </Button>
          <Button variant="primary" onClick={() => setConfigOpen(true)}>
            <Settings2 className="h-3.5 w-3.5" />
            Enable Auto Approval
          </Button>
        </div>
      </div>

      {/* Rule Logic */}
      <section className="mt-5">
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-slate-900">
              {rule.ruleLogicHeading ?? 'Rule Logic'}
            </h2>
            {(rule.ruleLogicSubheading ??
              (!rule.ruleLogicHeading
                ? 'Criteria a report must satisfy before it is approved automatically.'
                : undefined)) && (
              <p className="text-[12px] text-slate-500">
                {rule.ruleLogicSubheading ??
                  'Criteria a report must satisfy before it is approved automatically.'}
              </p>
            )}
          </div>
          {!rule.criteriaReadOnly && (
            <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
              {rule.criteria.length} of {rule.criteria.length} active
            </span>
          )}
        </div>

        <div className="space-y-2">
          {rule.criteria.map((c) => (
            <div
              key={c.id}
              className={cn(
                'rounded-lg border border-slate-200 bg-white px-3.5 py-3 card-shadow',
                rule.criteriaReadOnly
                  ? 'bg-slate-50/40'
                  : 'flex items-center gap-3',
              )}
            >
              {rule.criteriaReadOnly ? (
                <div>
                  <h3 className="text-[13px] font-semibold text-slate-900">{c.label}</h3>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{c.description}</p>
                </div>
              ) : (
                <>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-semibold text-slate-900">{c.label}</h3>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{c.description}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="w-8 text-right text-[11px] font-semibold text-emerald-600">On</span>
                    <Toggle checked={true} disabled label={`Toggle ${c.label}`} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Mapped Tests */}
      <section className="mt-6">
        <MappedTests
          mapped={mapped}
          catalog={catalog}
          onAdd={addTest}
          onRemove={removeTest}
          showDeltaLinearity={rule.id !== 'toxicology-auto-approval'}
        />
      </section>

      {/* Simulation results */}
      {result && (
        <section id="sim-results" className="mt-6 scroll-mt-4">
          <SimulationResults
            result={result}
            rangeLabel={rangeLabel}
            ruleName={rule.name}
            ruleId={rule.id}
            onReRun={() => setModalOpen(true)}
          />
        </section>
      )}

      <RunSimulationModal
        open={modalOpen}
        onClose={() => !running && setModalOpen(false)}
        mappedTests={mapped}
        running={running}
        onRun={handleRun}
      />

      <ConfigureAutoApprovalModal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        ruleId={rule.id}
        ruleName={rule.name}
        domain={rule.domain}
        serviceCount={mapped.length}
      />
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
