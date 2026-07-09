import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Lock, Pencil, PlayCircle, Settings2, Trash2, UserRound } from 'lucide-react'
import { extraTestsByRule, testsByDomain } from '../data/testCatalog'
import { accountOptions, icdCodeOptions, insuranceOptions, providerOptions } from '../data/ruleFilters'
import type { MappedTest, RuleCriterion, RuleDefinition, SimulationInput, SimulationResult } from '../data/types'
import { runSimulation } from '../data/simulation'
import { useRules, isCustomRule } from '../context/RulesContext'
import { buildTestClaimMap } from '../lib/testMapping'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { StatusBadge } from '../components/StatusBadge'
import { Button } from '../components/Button'
import { Toggle } from '../components/Toggle'
import { MappedTests } from '../components/MappedTests'
import { RunSimulationModal } from '../components/RunSimulationModal'
import { SimulationResults } from '../components/SimulationResults'
import { ConfigureAutoApprovalModal } from '../components/autoApprovalConfig/AutoApprovalConfigPanel'
import { AddNewRuleWizard } from '../components/addRule/AddNewRuleWizard'
import { Modal } from '../components/Modal'
import { cn } from '../lib/cn'

export function RuleDetailsPage() {
  const { ruleId = '' } = useParams()
  const navigate = useNavigate()
  const { getRuleById, updateCustomRule, deleteCustomRule, setRuleStatus, allRules } = useRules()
  const rule = getRuleById(ruleId)

  const [mapped, setMapped] = useState<MappedTest[]>([])
  const [criteria, setCriteria] = useState<RuleCriterion[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [rangeLabel, setRangeLabel] = useState('')

  const catalog = useMemo<MappedTest[]>(() => {
    if (!rule) return []
    if (isCustomRule(rule)) return testsByDomain(rule.domain)
    const originals = rule.mappedTests
    const extras = extraTestsByRule[ruleId] ?? []
    return [...originals, ...extras]
  }, [rule, ruleId])

  const testClaims = useMemo(
    () => buildTestClaimMap(allRules, ruleId),
    [allRules, ruleId],
  )

  useEffect(() => {
    if (!rule) return
    setMapped(rule.mappedTests)
    setCriteria(rule.criteria)
  }, [rule?.id])

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

  const isCustom = isCustomRule(rule)
  const isToxicology = rule.domain === 'Toxicology'
  const activeCriteria = criteria.filter((c) => c.enabled).length

  const persistCustom = (nextMapped: MappedTest[], nextCriteria: RuleCriterion[]) => {
    if (!isCustom) return
    updateCustomRule({ ...rule, mappedTests: nextMapped, criteria: nextCriteria })
  }

  const addTest = (test: MappedTest) => {
    if (testClaims.has(test.id)) return
    const newlyAdded: MappedTest = {
      ...test,
      autoApprovalRange: false,
      deltaCheck: false,
      linearityCheck: false,
    }
    setMapped((prev) => {
      if (prev.some((t) => t.id === test.id)) return prev
      const next = [...prev, newlyAdded]
      persistCustom(next, criteria)
      return next
    })
  }

  const removeTest = (id: string) => {
    setMapped((prev) => {
      const next = prev.filter((t) => t.id !== id)
      persistCustom(next, criteria)
      return next
    })
  }

  const toggleCriterion = (id: string, enabled: boolean) => {
    setCriteria((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, enabled } : c))
      persistCustom(mapped, next)
      return next
    })
  }

  const handleRuleUpdated = (updated: RuleDefinition) => {
    setMapped(updated.mappedTests)
    setCriteria(updated.criteria)
  }

  const handleDeleteRule = () => {
    if (!isCustom) return
    deleteCustomRule(rule.id)
    setDeleteOpen(false)
    navigate('/', { replace: true })
  }

  const handleRun = (input: SimulationInput) => {
    setRunning(true)
    const span =
      input.fromDate === input.toDate
        ? formatDate(input.fromDate)
        : `${formatDate(input.fromDate)} – ${formatDate(input.toDate)}`
    const label = `${input.rangeLabel} · ${span}`
    setTimeout(() => {
      setResult(runSimulation(rule.id, input, rule.domain))
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

      <div className="mt-2.5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[18px] font-bold tracking-tight text-slate-900">{rule.name}</h1>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold',
                isCustom
                  ? 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/20'
                  : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/15',
              )}
            >
              {isCustom ? (
                <UserRound className="h-2.5 w-2.5" />
              ) : (
                <Lock className="h-2.5 w-2.5" />
              )}
              {isCustom ? 'Custom Rule' : 'System Default'}
            </span>
            <StatusBadge tone={rule.status === 'Active' ? 'active' : 'inactive'} dot>
              {rule.status}
            </StatusBadge>
          </div>
          <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-slate-500">
            {rule.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {isCustom ? (
            <>
              <Button
                variant="secondary"
                className="text-rose-700 ring-rose-200 hover:bg-rose-50 hover:ring-rose-300"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Rule
              </Button>
              <Button variant="secondary" onClick={() => setUpdateOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Update Rule
              </Button>
            </>
          ) : null}
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

      {rule.filters && <RuleFiltersSummary filters={rule.filters} domain={rule.domain} />}

      <section className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 card-shadow sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-900">{rule.name}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
              {rule.status === 'Active'
                ? 'This rule is actively auto-approving qualifying reports.'
                : 'Auto approval is paused — reports will require manual review until re-enabled.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <span
              className={cn(
                'text-[11px] font-semibold',
                rule.status === 'Active' ? 'text-emerald-600' : 'text-slate-400',
              )}
            >
              {rule.status === 'Active' ? 'Active' : 'Inactive'}
            </span>
            <Toggle
              checked={rule.status === 'Active'}
              onChange={(active) => setRuleStatus(rule.id, active ? 'Active' : 'Inactive')}
              label="Toggle auto approval for this rule"
            />
          </div>
        </div>
      </section>

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
              {activeCriteria} of {criteria.length} active
            </span>
          )}
        </div>

        <div className="space-y-2">
          {(isCustom ? criteria : rule.criteria).map((c) => {
            const editable = isCustom && !c.locked
            const checked = c.enabled
            return (
              <div
                key={c.id}
                className={cn(
                  'rounded-lg border border-slate-200 bg-white px-3.5 py-3 card-shadow',
                  rule.criteriaReadOnly ? 'bg-slate-50/40' : 'flex items-center gap-3',
                )}
              >
                {rule.criteriaReadOnly ? (
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900">{c.label}</h3>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{c.description}</p>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                        checked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400',
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13px] font-semibold text-slate-900">{c.label}</h3>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{c.description}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5">
                      <span
                        className={cn(
                          'w-8 text-right text-[11px] font-semibold',
                          checked ? 'text-emerald-600' : 'text-slate-400',
                        )}
                      >
                        {checked ? 'On' : 'Off'}
                      </span>
                      <Toggle
                        checked={checked}
                        disabled={!editable}
                        onChange={(v) => toggleCriterion(c.id, v)}
                        label={`Toggle ${c.label}`}
                      />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-6">
        <MappedTests
          mapped={mapped}
          catalog={catalog}
          claimedByOther={testClaims}
          onAdd={addTest}
          onRemove={removeTest}
          showDeltaLinearity={!isToxicology}
        />
      </section>

      {result && (
        <section id="sim-results" className="mt-6 scroll-mt-4">
          <SimulationResults
            result={result}
            rangeLabel={rangeLabel}
            ruleName={rule.name}
            ruleId={rule.id}
            domain={rule.domain}
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
        criteria={isCustom ? criteria : rule.criteria}
      />

      <AddNewRuleWizard
        open={updateOpen && isCustom}
        onClose={() => setUpdateOpen(false)}
        ruleToEdit={isCustom ? rule : undefined}
        onUpdated={handleRuleUpdated}
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete custom rule?"
        description="This action cannot be undone."
        icon={<AlertTriangle className="h-4 w-4" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300"
              onClick={handleDeleteRule}
            >
              Delete Rule
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-slate-600">
          You are about to permanently delete <span className="font-semibold text-slate-900">{rule.name}</span>.
          Mapped tests, scope filters, and simulation history for this rule will be removed.
        </p>
      </Modal>
    </div>
  )
}

const MAX_FILTER_CHIPS = 2

function RuleFiltersSummary({
  filters,
  domain,
}: {
  filters: NonNullable<import('../data/types').RuleDefinition['filters']>
  domain: string
}) {
  const rows: { label: string; values: string[] }[] = []

  if (filters.ageGroup.enabled && filters.ageGroup.from !== null && filters.ageGroup.to !== null) {
    rows.push({
      label: 'Age group',
      values: [`${filters.ageGroup.from}–${filters.ageGroup.to} years`],
    })
  }
  if (filters.gender.enabled) {
    const genders = [
      filters.gender.male && 'Male',
      filters.gender.female && 'Female',
      filters.gender.other && 'Other',
    ].filter(Boolean) as string[]
    if (genders.length) rows.push({ label: 'Gender', values: genders })
  }
  if (filters.patientType.enabled) {
    const types = [filters.patientType.ipd && 'IPD', filters.patientType.opd && 'OPD'].filter(Boolean) as string[]
    if (types.length) rows.push({ label: 'Patient type', values: types })
  }
  if (filters.icdCodes?.enabled && filters.icdCodes.selectedIds.length) {
    const codes = filters.icdCodes.selectedIds
      .map((id) => icdCodeOptions.find((c) => c.id === id)?.code)
      .filter(Boolean) as string[]
    if (codes.length) rows.push({ label: 'ICD codes', values: codes })
  }
  if (filters.accounts.enabled) {
    const names = filters.accounts.selectedIds
      .map((id) => accountOptions.find((a) => a.id === id)?.name)
      .filter(Boolean) as string[]
    if (names.length) rows.push({ label: 'Accounts', values: names })
  }
  if (filters.providers?.enabled && filters.providers.selectedIds.length) {
    const names = filters.providers.selectedIds
      .map((id) => providerOptions.find((p) => p.id === id)?.name)
      .filter(Boolean) as string[]
    if (names.length) rows.push({ label: 'Providers', values: names })
  }
  if (filters.insurance?.enabled && filters.insurance.selectedIds.length) {
    const names = filters.insurance.selectedIds
      .map((id) => insuranceOptions.find((i) => i.id === id)?.name)
      .filter(Boolean) as string[]
    if (names.length) rows.push({ label: 'Insurance', values: names })
  }
  if (filters.instruments?.enabled && filters.instruments.selected.length) {
    rows.push({ label: 'Instruments', values: filters.instruments.selected })
  }

  if (rows.length === 0) return null

  return (
    <section className="mt-4 rounded-lg border border-brand-100 bg-brand-50/50 px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h2 className="text-[13px] font-semibold text-brand-900">Applies To</h2>
        <p className="text-[11px] text-brand-700/70">
          {domain} reports · {rows.length} scope {rows.length === 1 ? 'filter' : 'filters'}
        </p>
      </div>
      <dl className="mt-2.5 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
            <dt className="w-28 shrink-0 text-[11px] font-medium text-brand-800/70">{row.label}</dt>
            <dd className="min-w-0 flex-1">
              <FilterValueChips values={row.values} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function FilterValueChips({ values }: { values: string[] }) {
  const visible = values.slice(0, MAX_FILTER_CHIPS)
  const hiddenCount = values.length - visible.length
  const hiddenValues = values.slice(MAX_FILTER_CHIPS)

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((value) => (
        <span
          key={value}
          className="inline-flex max-w-full truncate rounded bg-white/80 px-1.5 py-0.5 text-[11px] font-medium text-brand-900 ring-1 ring-inset ring-brand-200"
        >
          {value}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span
          className="inline-flex rounded bg-brand-100 px-1.5 py-0.5 text-[11px] font-medium text-brand-700"
          title={hiddenValues.join(', ')}
        >
          +{hiddenCount} more
        </span>
      ) : null}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
