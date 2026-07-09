import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  FlaskConical,
  Lock,
  Pencil,
  PlayCircle,
  Plus,
} from 'lucide-react'
import { Modal } from '../Modal'
import { Button } from '../Button'
import { Toggle } from '../Toggle'
import { MultiSelectDropdown } from '../MultiSelectDropdown'
import { SearchInput } from '../SearchInput'
import { RunSimulationForm } from '../RunSimulationModal'
import { SimulationResults } from '../SimulationResults'
import { AutoApprovalConfigPanel } from '../autoApprovalConfig/AutoApprovalConfigPanel'
import { WizardStepper } from './WizardStepper'
import { cloneCriteriaForDomain, mergeCriteriaForEdit } from '../../data/criteriaCatalog'
import { accountOptions, createDefaultFilters, icdCodeOptions, insuranceOptions, instrumentOptions, mergeFilters, providerOptions } from '../../data/ruleFilters'
import { testsByDomain } from '../../data/testCatalog'
import { registerConfigurableTests, buildConfigurableTestsFromMapped, configurableTestsByRule } from '../../data/configTests'
import { runSimulation } from '../../data/simulation'
import { generateCustomRuleId, useRules } from '../../context/RulesContext'
import { buildTestClaimMap, countAddableTests } from '../../lib/testMapping'
import type {
  MappedTest,
  RuleCriterion,
  RuleDefinition,
  RuleDomain,
  RuleFilters,
  SimulationInput,
  SimulationResult,
} from '../../data/types'
import { cn } from '../../lib/cn'

interface AddNewRuleWizardProps {
  open: boolean
  onClose: () => void
  /** When set, the wizard opens in update mode for an existing custom rule. */
  ruleToEdit?: RuleDefinition
  onUpdated?: (rule: RuleDefinition) => void
}

const fieldClass =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[13px] text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

export function AddNewRuleWizard({ open, onClose, ruleToEdit, onUpdated }: AddNewRuleWizardProps) {
  const navigate = useNavigate()
  const { addCustomRule, updateCustomRule, allRules } = useRules()
  const isEditMode = Boolean(ruleToEdit)

  const [step, setStep] = useState(1)
  const [draftRuleId, setDraftRuleId] = useState(() => generateCustomRuleId())

  const [name, setName] = useState('')
  const [domain, setDomain] = useState<RuleDomain>('Pathology')
  const [description, setDescription] = useState('')
  const [criteria, setCriteria] = useState<RuleCriterion[]>(() => cloneCriteriaForDomain('Pathology'))
  const [filters, setFilters] = useState<RuleFilters>(() => createDefaultFilters())
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([])
  const [testQuery, setTestQuery] = useState('')

  const [running, setRunning] = useState(false)
  const [simResult, setSimResult] = useState<SimulationResult | null>(null)
  const [rangeLabel, setRangeLabel] = useState('')
  const [enableRule, setEnableRule] = useState(true)
  const [configSaved, setConfigSaved] = useState(false)

  const catalog = useMemo(() => testsByDomain(domain), [domain])
  const testClaims = useMemo(
    () => buildTestClaimMap(allRules, isEditMode ? ruleToEdit?.id : undefined),
    [allRules, isEditMode, ruleToEdit?.id],
  )
  const addableTestCount = useMemo(
    () => countAddableTests(catalog, new Set(selectedTestIds), testClaims),
    [catalog, selectedTestIds, testClaims],
  )
  const filteredCatalog = useMemo(() => {
    const q = testQuery.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter(
      (t) => t.name.toLowerCase().includes(q) || t.department.toLowerCase().includes(q),
    )
  }, [catalog, testQuery])

  const mappedTests = useMemo<MappedTest[]>(() => {
    const rangeOn = criteria.some((c) => c.id === 'range' && c.enabled)
    const deltaOn = criteria.some((c) => c.id === 'delta' && c.enabled)
    const linearityOn = criteria.some((c) => c.id === 'linearity' && c.enabled)
    return selectedTestIds
      .map((id) => catalog.find((t) => t.id === id))
      .filter(Boolean)
      .map((test) => ({
        ...test!,
        autoApprovalRange: rangeOn,
        deltaCheck: deltaOn,
        linearityCheck: linearityOn,
      }))
  }, [selectedTestIds, catalog, criteria])

  const needsRangeConfig = criteria.some(
    (c) => c.enabled && ['range', 'delta', 'linearity'].includes(c.id),
  )
  const hasActiveFilters = Object.values(filters).some((f) => f.enabled)
  const enabledCriteriaCount = criteria.filter((c) => c.enabled).length

  useEffect(() => {
    if (!open) return

    if (ruleToEdit) {
      setDraftRuleId(ruleToEdit.id)
      setStep(1)
      setName(ruleToEdit.name)
      setDomain(ruleToEdit.domain)
      setDescription(ruleToEdit.description)
      setCriteria(mergeCriteriaForEdit(ruleToEdit.domain, ruleToEdit.criteria))
      setFilters(mergeFilters(ruleToEdit.filters))
      setSelectedTestIds(ruleToEdit.mappedTests.map((t) => t.id))
      setTestQuery('')
      setSimResult(null)
      setRangeLabel('')
      setEnableRule(ruleToEdit.status === 'Active')
      const hasConfig = Boolean(configurableTestsByRule[ruleToEdit.id]?.length)
      setConfigSaved(hasConfig)
    } else {
      reset()
      setDraftRuleId(generateCustomRuleId())
    }
  }, [open, ruleToEdit])

  useEffect(() => {
    if ((step === 5 || step === 6) && mappedTests.length > 0) {
      registerConfigurableTests(
        draftRuleId,
        buildConfigurableTestsFromMapped(mappedTests, domain),
      )
    }
  }, [step, mappedTests, domain, draftRuleId])

  const reset = () => {
    setStep(1)
    setName('')
    setDomain('Pathology')
    setDescription('')
    setCriteria(cloneCriteriaForDomain('Pathology'))
    setFilters(createDefaultFilters())
    setSelectedTestIds([])
    setTestQuery('')
    setSimResult(null)
    setRangeLabel('')
    setEnableRule(true)
    setConfigSaved(false)
  }

  const handleClose = () => {
    onClose()
    reset()
  }

  const handleDomainChange = (next: RuleDomain) => {
    setDomain(next)
    setCriteria(cloneCriteriaForDomain(next))
    setSelectedTestIds([])
    setFilters(createDefaultFilters())
  }

  const toggleCriterion = (id: string, enabled: boolean) => {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id !== id || c.locked) return c
        return { ...c, enabled }
      }),
    )
  }

  const toggleTest = (id: string) => {
    setSelectedTestIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (testClaims.has(id)) return prev
      return [...prev, id]
    })
  }

  const canGoNext = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0
      case 2:
        return enabledCriteriaCount > 0
      case 3:
        if (filters.ageGroup.enabled) {
          const { from, to } = filters.ageGroup
          if (from === null || to === null || from > to) return false
        }
        if (
          filters.gender.enabled &&
          !filters.gender.male &&
          !filters.gender.female &&
          !filters.gender.other
        )
          return false
        if (filters.patientType.enabled && !filters.patientType.ipd && !filters.patientType.opd)
          return false
        if (filters.icdCodes.enabled && filters.icdCodes.selectedIds.length === 0) return false
        if (filters.accounts.enabled && filters.accounts.selectedIds.length === 0) return false
        if (filters.providers.enabled && filters.providers.selectedIds.length === 0) return false
        if (filters.insurance.enabled && filters.insurance.selectedIds.length === 0) return false
        if (filters.instruments.enabled && filters.instruments.selected.length === 0) return false
        return true
      case 4:
        return selectedTestIds.length > 0
      case 5:
        return true
      default:
        return true
    }
  }

  const handleRunSimulation = (input: SimulationInput) => {
    setRunning(true)
    const span =
      input.fromDate === input.toDate
        ? formatDate(input.fromDate)
        : `${formatDate(input.fromDate)} – ${formatDate(input.toDate)}`
    setTimeout(() => {
      setSimResult(runSimulation(draftRuleId, input, domain))
      setRangeLabel(`${input.rangeLabel} · ${span}`)
      setRunning(false)
    }, 900)
  }

  const handleFinish = () => {
    const rule: RuleDefinition = {
      id: draftRuleId,
      name: name.trim(),
      domain,
      description: description.trim() || `Custom ${domain.toLowerCase()} automation rule.`,
      status: enableRule ? 'Active' : 'Inactive',
      criteria: criteria.filter((c) => c.enabled),
      mappedTests,
      isCustom: true,
      filters: hasActiveFilters ? filters : undefined,
    }

    registerConfigurableTests(draftRuleId, buildConfigurableTestsFromMapped(mappedTests, domain))

    if (isEditMode) {
      updateCustomRule(rule)
      onUpdated?.(rule)
      handleClose()
    } else {
      addCustomRule(rule)
      handleClose()
      navigate(`/rules/${draftRuleId}`)
    }
  }

  const stepTitle = () => {
    const prefix = isEditMode ? 'Update' : 'Add'
    switch (step) {
      case 1:
        return `${prefix} Rule Details`
      case 2:
        return isEditMode ? 'Update Rules for Custom Rule' : 'Select Rules for Custom Rule'
      case 3:
        return 'Apply Rule To'
      case 4:
        return 'Map Tests'
      case 5:
        return 'Run Simulation'
      case 6:
        return 'Enable Rule'
      default:
        return isEditMode ? 'Update Rule' : 'Add New Rule'
    }
  }

  const stepDescription = () => {
    switch (step) {
      case 1:
        return isEditMode
          ? 'Update the name and description for this custom rule.'
          : 'Name and describe the custom rule you want to create.'
      case 2:
        return 'Choose which checks should be evaluated when auto-validating reports.'
      case 3:
        return 'Optionally scope this rule to specific patient or report types. Leave all off to apply to every report.'
      case 4:
        return 'Select the tests this custom rule should govern.'
      case 5:
        return 'Optionally test this rule against historical reports before enabling it.'
      case 6:
        return 'Configure auto approval ranges if needed, then choose whether to activate the rule.'
      default:
        return ''
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        icon={isEditMode ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        title={stepTitle()}
        description={stepDescription()}
        maxWidth={step >= 5 ? 'max-w-5xl' : 'max-w-3xl'}
        footer={
          <>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {step < 6 ? (
              <Button variant="primary" disabled={!canGoNext()} onClick={() => setStep((s) => s + 1)}>
                {step === 5 && !simResult ? 'Skip & Continue' : 'Next'}
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={needsRangeConfig && !configSaved}
                onClick={handleFinish}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isEditMode
                  ? enableRule
                    ? 'Save & Enable Rule'
                    : 'Save Changes'
                  : enableRule
                    ? 'Save & Enable Rule'
                    : 'Save Rule'}
              </Button>
            )}
          </>
        }
      >
        <WizardStepper step={step} />

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-700">Rule Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pediatric CBC Auto Approval"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-700">Domain</label>
              <select
                value={domain}
                onChange={(e) => handleDomainChange(e.target.value as RuleDomain)}
                className={fieldClass}
              >
                <option value="Pathology">Auto approval for pathology reports</option>
                <option value="Toxicology">Auto approval for toxicology reports</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-700">
                Rule Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe when and why this rule should be used…"
                className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-[13px] text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            {criteria.map((c) => (
              <div
                key={c.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 card-shadow',
                  c.locked && 'border-slate-200 bg-slate-50/50',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-slate-900">{c.label}</h3>
                    {c.locked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-white">
                        <Lock className="h-2.5 w-2.5" />
                        Always ON
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{c.description}</p>
                </div>
                <Toggle
                  checked={c.enabled}
                  disabled={c.locked}
                  onChange={(v) => toggleCriterion(c.id, v)}
                  label={`Toggle ${c.label}`}
                />
              </div>
            ))}
            {enabledCriteriaCount === 0 && (
              <p className="text-[12px] text-amber-700">Enable at least one rule to continue.</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            {!hasActiveFilters && (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
                No conditions enabled — this rule will apply to <strong>all reports</strong>.
              </p>
            )}

            <FilterRow
              label="Age Group"
              enabled={filters.ageGroup.enabled}
              onToggle={(v) => setFilters((f) => ({ ...f, ageGroup: { ...f.ageGroup, enabled: v } }))}
            >
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={filters.ageGroup.from ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      ageGroup: {
                        ...f.ageGroup,
                        from: e.target.value === '' ? null : Number(e.target.value),
                      },
                    }))
                  }
                  placeholder="From"
                  className="h-8 w-20 rounded-md border border-slate-300 px-2 text-[13px]"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="number"
                  min={0}
                  value={filters.ageGroup.to ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      ageGroup: {
                        ...f.ageGroup,
                        to: e.target.value === '' ? null : Number(e.target.value),
                      },
                    }))
                  }
                  placeholder="To"
                  className="h-8 w-20 rounded-md border border-slate-300 px-2 text-[13px]"
                />
                <span className="text-[12px] text-slate-500">years</span>
              </div>
            </FilterRow>

            <FilterRow
              label="Gender"
              enabled={filters.gender.enabled}
              onToggle={(v) => setFilters((f) => ({ ...f, gender: { ...f.gender, enabled: v } }))}
            >
              <MultiSelectDropdown
                label="Select Gender"
                value={(['male', 'female', 'other'] as const).filter((key) => filters.gender[key])}
                onChange={(selected) =>
                  setFilters((f) => ({
                    ...f,
                    gender: {
                      ...f.gender,
                      male: selected.includes('male'),
                      female: selected.includes('female'),
                      other: selected.includes('other'),
                    },
                  }))
                }
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                placeholder="Select gender"
              />
            </FilterRow>

            <FilterRow
              label="Patient Type"
              enabled={filters.patientType.enabled}
              onToggle={(v) =>
                setFilters((f) => ({ ...f, patientType: { ...f.patientType, enabled: v } }))
              }
            >
              <MultiSelectDropdown
                label="Select Patient Type"
                value={(['ipd', 'opd'] as const).filter((key) => filters.patientType[key])}
                onChange={(selected) =>
                  setFilters((f) => ({
                    ...f,
                    patientType: {
                      ...f.patientType,
                      ipd: selected.includes('ipd'),
                      opd: selected.includes('opd'),
                    },
                  }))
                }
                options={[
                  { value: 'ipd', label: 'IPD' },
                  { value: 'opd', label: 'OPD' },
                ]}
                placeholder="Select patient type"
              />
            </FilterRow>

            <FilterRow
              label="ICD Codes"
              enabled={filters.icdCodes.enabled}
              onToggle={(v) => setFilters((f) => ({ ...f, icdCodes: { ...f.icdCodes, enabled: v } }))}
            >
              <MultiSelectDropdown
                label="Select ICD Codes"
                value={filters.icdCodes.selectedIds}
                onChange={(selected) =>
                  setFilters((f) => ({
                    ...f,
                    icdCodes: { ...f.icdCodes, selectedIds: selected },
                  }))
                }
                options={icdCodeOptions.map((icd) => ({
                  value: icd.id,
                  label: `${icd.code} — ${icd.description}`,
                }))}
                placeholder="Select ICD codes"
              />
            </FilterRow>

            <FilterRow
              label="Accounts"
              enabled={filters.accounts.enabled}
              onToggle={(v) => setFilters((f) => ({ ...f, accounts: { ...f.accounts, enabled: v } }))}
            >
              <MultiSelectDropdown
                label="Select Accounts"
                value={filters.accounts.selectedIds}
                onChange={(selected) =>
                  setFilters((f) => ({
                    ...f,
                    accounts: { ...f.accounts, selectedIds: selected },
                  }))
                }
                options={accountOptions.map((a) => ({
                  value: a.id,
                  label: `${a.name} (${a.type})`,
                }))}
                placeholder="Select accounts"
              />
            </FilterRow>

            <FilterRow
              label="Providers"
              enabled={filters.providers.enabled}
              onToggle={(v) => setFilters((f) => ({ ...f, providers: { ...f.providers, enabled: v } }))}
            >
              <MultiSelectDropdown
                label="Select Providers"
                value={filters.providers.selectedIds}
                onChange={(selected) =>
                  setFilters((f) => ({
                    ...f,
                    providers: { ...f.providers, selectedIds: selected },
                  }))
                }
                options={providerOptions.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.specialty})`,
                }))}
                placeholder="Select providers"
              />
            </FilterRow>

            <FilterRow
              label="Insurance"
              enabled={filters.insurance.enabled}
              onToggle={(v) => setFilters((f) => ({ ...f, insurance: { ...f.insurance, enabled: v } }))}
            >
              <MultiSelectDropdown
                label="Select Insurance"
                value={filters.insurance.selectedIds}
                onChange={(selected) =>
                  setFilters((f) => ({
                    ...f,
                    insurance: { ...f.insurance, selectedIds: selected },
                  }))
                }
                options={insuranceOptions.map((ins) => ({
                  value: ins.id,
                  label: ins.name,
                }))}
                placeholder="Select insurance"
              />
            </FilterRow>

            <FilterRow
              label="Instruments"
              enabled={filters.instruments.enabled}
              onToggle={(v) =>
                setFilters((f) => ({ ...f, instruments: { ...f.instruments, enabled: v } }))
              }
            >
              <MultiSelectDropdown
                label="Select Instruments"
                value={filters.instruments.selected}
                onChange={(selected) =>
                  setFilters((f) => ({
                    ...f,
                    instruments: { ...f.instruments, selected },
                  }))
                }
                options={instrumentOptions.map((instrument) => ({
                  value: instrument,
                  label: instrument,
                }))}
                placeholder="Select instruments"
              />
            </FilterRow>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <SearchInput
              value={testQuery}
              onChange={setTestQuery}
              placeholder="Search tests by name or department…"
              className="w-full"
            />
            <p className="text-[12px] text-slate-500">
              <span className="font-semibold text-slate-700">{selectedTestIds.length}</span> selected
              · <span className="font-semibold text-slate-700">{addableTestCount}</span> available to
              map
            </p>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {filteredCatalog.map((test) => {
                const checked = selectedTestIds.includes(test.id)
                const claim = testClaims.get(test.id)
                const disabled = Boolean(claim) && !checked
                return (
                  <label
                    key={test.id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 transition-colors',
                      disabled
                        ? 'cursor-not-allowed bg-slate-50/80 opacity-70'
                        : 'cursor-pointer hover:bg-slate-50',
                      checked && !disabled && 'bg-brand-50/40',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleTest(test.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-brand-600 disabled:cursor-not-allowed"
                    />
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                      <FlaskConical className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-800">{test.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {claim ? `Mapped to ${claim.ruleName}` : test.department}
                      </p>
                    </div>
                  </label>
                )
              })}
              {filteredCatalog.length === 0 && (
                <p className="px-3 py-6 text-center text-[13px] text-slate-400">No tests match your search.</p>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <RuleSummaryBanner
              name={name}
              domain={domain}
              testCount={mappedTests.length}
              ruleCount={enabledCriteriaCount}
            />

            <div className="rounded-xl border border-slate-200 bg-white p-5 card-shadow sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">Run simulation</p>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Choose a date range and run against historical reports.
                  </p>
                </div>
              </div>
              <RunSimulationForm
                mappedTests={mappedTests}
                running={running}
                onRun={handleRunSimulation}
              />
            </div>

            {simResult && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                <SimulationResults
                  result={simResult}
                  rangeLabel={rangeLabel}
                  ruleName={name}
                  ruleId={draftRuleId}
                  domain={domain}
                  onReRun={() => {}}
                  compact
                />
              </div>
            )}

            {!simResult && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
                Simulation is optional — run it to preview results, or use <strong>Skip & Continue</strong> to proceed.
              </p>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <RuleSummaryBanner
              name={name}
              domain={domain}
              testCount={mappedTests.length}
              ruleCount={enabledCriteriaCount}
              simDone={Boolean(simResult)}
            />

            {needsRangeConfig && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 card-shadow sm:p-6">
                <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                  <StepBadge done={configSaved}>1</StepBadge>
                  <p className="text-[14px] font-semibold text-slate-900">Configure Auto Approval</p>
                  {configSaved && <DoneBadge />}
                </div>
                <AutoApprovalConfigPanel
                  key={`${draftRuleId}-${mappedTests.length}`}
                  ruleId={draftRuleId}
                  domain={domain}
                  serviceCount={mappedTests.length}
                  criteria={criteria}
                  layout="inline"
                  onCancel={() => {}}
                  onSaved={() => setConfigSaved(true)}
                />
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-5 card-shadow sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StepBadge done={enableRule}>{needsRangeConfig ? '2' : '1'}</StepBadge>
                    <p className="text-[14px] font-semibold text-slate-900">Enable Rule</p>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                    Turn on to activate this rule immediately after saving.
                  </p>
                </div>
                <Toggle checked={enableRule} onChange={setEnableRule} label="Enable rule" />
              </div>
            </div>

            {needsRangeConfig && !configSaved && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
                Save your auto approval configuration above before saving the rule.
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

function RuleSummaryBanner({
  name,
  domain,
  testCount,
  ruleCount,
  simDone,
}: {
  name: string
  domain: RuleDomain
  testCount: number
  ruleCount: number
  simDone?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-slate-900">{name}</p>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {domain} · {testCount} tests · {ruleCount} rules
          </p>
        </div>
        {simDone && (
          <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            Simulation done
          </span>
        )}
      </div>
    </div>
  )
}

function StepBadge({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
        done ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700',
      )}
    >
      {done ? '✓' : children}
    </span>
  )
}

function DoneBadge() {
  return (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
      Done
    </span>
  )
}

function FilterRow({
  label,
  enabled,
  onToggle,
  children,
}: {
  label: string
  enabled: boolean
  onToggle: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-3 card-shadow">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-semibold text-slate-900">{label}</h3>
        <Toggle checked={enabled} onChange={onToggle} label={`Toggle ${label}`} />
      </div>
      {enabled && <div className="mt-3 border-t border-slate-100 pt-3">{children}</div>}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
