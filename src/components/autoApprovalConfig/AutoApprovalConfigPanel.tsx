import { useMemo, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  Info,
  Ruler,
  Save,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { configurableTestsByRule, registerConfigurableTests } from '../../data/configTests'
import type { ConfigurableTest, RuleCriterion, TestParameter } from '../../data/types'
import { Button } from '../Button'
import { Modal } from '../Modal'
import { SearchInput } from '../SearchInput'
import { StatusBadge } from '../StatusBadge'
import { Toggle } from '../Toggle'
import { cn } from '../../lib/cn'
import {
  AutoApprovalRangeTable,
  DeltaRangeTable,
  isRangeConfigurableParam,
  LinearityRangeTable,
  ToxicologyAutoApprovalTable,
} from './ConfigTables'

export type ConfigTabKey = 'auto-approval' | 'delta' | 'linearity'

interface AutoApprovalConfigPanelProps {
  ruleId: string
  domain: string
  serviceCount: number
  onCancel: () => void
  onSaved?: () => void
  layout?: 'modal' | 'page' | 'inline'
  /** When set, delta/linearity tabs are shown only for enabled checks. */
  criteria?: RuleCriterion[]
}

function isCheckEnabled(criteria: RuleCriterion[] | undefined, id: string): boolean {
  return criteria?.some((c) => c.id === id && c.enabled) ?? false
}

export function AutoApprovalConfigPanel({
  ruleId,
  domain,
  serviceCount,
  onCancel,
  onSaved,
  layout = 'modal',
  criteria,
}: AutoApprovalConfigPanelProps) {
  const initialTests = useMemo(
    () =>
      configurableTestsByRule[ruleId]?.map((t) => ({
        ...t,
        parameters: t.parameters.map((p) => ({ ...p })),
      })) ?? [],
    [ruleId],
  )

  const [tests, setTests] = useState<ConfigurableTest[]>(initialTests)
  const [tab, setTab] = useState<ConfigTabKey>('auto-approval')
  const [query, setQuery] = useState('')
  const [applyNormalRanges, setApplyNormalRanges] = useState(true)
  const [expanded, setExpanded] = useState<string[]>(initialTests.map((t) => t.id))
  const [saved, setSaved] = useState(false)

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tests
    return tests.filter(
      (t) => t.name.toLowerCase().includes(q) || t.department.toLowerCase().includes(q),
    )
  }, [tests, query])

  const toggleExpand = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const updateParam = (testId: string, paramId: string, patch: Partial<TestParameter>) => {
    setTests((prev) =>
      prev.map((t) =>
        t.id === testId
          ? { ...t, parameters: t.parameters.map((p) => (p.id === paramId ? { ...p, ...patch } : p)) }
          : t,
      ),
    )
  }

  const isToxicology = domain === 'Toxicology' || ruleId === 'toxicology-auto-approval'
  const showDeltaConfig = !isToxicology && isCheckEnabled(criteria, 'delta')
  const showLinearityConfig = !isToxicology && isCheckEnabled(criteria, 'linearity')

  const setAllParams = (testId: string, patch: Partial<TestParameter>) => {
    setTests((prev) =>
      prev.map((t) =>
        t.id === testId
          ? {
              ...t,
              parameters: t.parameters.map((p) =>
                isToxicology && activeTab === 'auto-approval' && !isRangeConfigurableParam(p)
                  ? p
                  : { ...p, ...patch },
              ),
            }
          : t,
      ),
    )
  }

  const setAllTests = (patch: Partial<TestParameter>) => {
    setTests((prev) =>
      prev.map((t) => ({
        ...t,
        parameters: t.parameters.map((p) =>
          isToxicology && !isRangeConfigurableParam(p) ? p : { ...p, ...patch },
        ),
      })),
    )
  }

  const autoRangeParams = tests.reduce(
    (s, t) =>
      s +
      t.parameters.filter((p) => isRangeConfigurableParam(p) && p.autoApprovalRangeEnabled).length,
    0,
  )
  const deltaParams = tests.reduce(
    (s, t) => s + t.parameters.filter((p) => p.deltaAllowed).length,
    0,
  )
  const linearityParams = tests.reduce(
    (s, t) => s + t.parameters.filter((p) => p.linearityEnabled).length,
    0,
  )

  const tabs: { key: ConfigTabKey; label: string; icon: typeof ShieldCheck; count: number }[] = [
    { key: 'auto-approval', label: 'Auto Approval Range', icon: ShieldCheck, count: autoRangeParams },
    ...(showDeltaConfig
      ? [{ key: 'delta' as const, label: 'Delta Range', icon: TrendingUp, count: deltaParams }]
      : []),
    ...(showLinearityConfig
      ? [{ key: 'linearity' as const, label: 'Linearity Ranges', icon: Ruler, count: linearityParams }]
      : []),
  ]

  const activeTab = tabs.some((t) => t.key === tab) ? tab : 'auto-approval'

  const handleSave = () => {
    registerConfigurableTests(ruleId, tests)
    onSaved?.()
    if (!onSaved && layout !== 'inline') setSaved(true)
  }

  const tabToggleField = (): keyof TestParameter => {
    switch (activeTab) {
      case 'delta':
        return 'deltaAllowed'
      case 'linearity':
        return 'linearityEnabled'
      default:
        return 'autoApprovalRangeEnabled'
    }
  }

  const tabToggleLabel = () => {
    switch (activeTab) {
      case 'delta':
        return 'Enable Delta Check'
      case 'linearity':
        return 'Enable Linearity'
      default:
        return 'Set as Normal Range'
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge tone="info">
            {serviceCount} {domain} {serviceCount === 1 ? 'Service' : 'Services'}
          </StatusBadge>
          {activeTab === 'auto-approval' && !isToxicology && (
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-slate-600">
              <input
                type="checkbox"
                checked={applyNormalRanges}
                onChange={(e) => {
                  const on = e.target.checked
                  setApplyNormalRanges(on)
                  if (on) setAllTests({ autoApprovalRangeEnabled: true })
                }}
                className="h-4 w-4 rounded border-slate-300 accent-brand-600"
              />
              Apply predefined normal ranges to all selected
            </label>
          )}
          {activeTab === 'auto-approval' && isToxicology && (
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-slate-600">
              <input
                type="checkbox"
                checked={applyNormalRanges}
                onChange={(e) => {
                  const on = e.target.checked
                  setApplyNormalRanges(on)
                  if (on) setAllTests({ autoApprovalRangeEnabled: true })
                }}
                className="h-4 w-4 rounded border-slate-300 accent-brand-600"
              />
              Apply predefined ranges to numeric parameters
            </label>
          )}
        </div>

        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search services by name…"
          className="w-full"
        />

        <div className="flex items-center gap-5 border-b border-slate-200">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = activeTab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  '-mb-px flex items-center gap-1.5 border-b-2 px-0.5 pb-2.5 pt-1 text-[13px] font-semibold transition-colors',
                  active
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] font-bold',
                    active ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          {filteredTests.map((test) => {
            const isOpen = expanded.includes(test.id)
            const field = tabToggleField()
            const rangeParams =
              isToxicology && activeTab === 'auto-approval'
                ? test.parameters.filter(isRangeConfigurableParam)
                : test.parameters
            const toggleParams = rangeParams.length > 0 ? rangeParams : test.parameters
            const allOn = toggleParams.every((p) => Boolean(p[field]))
            const onCount = toggleParams.filter((p) => Boolean(p[field])).length
            const showServiceToggle = !(isToxicology && activeTab === 'auto-approval' && rangeParams.length === 0)
            const numericCount = test.parameters.filter(isRangeConfigurableParam).length
            const paramSummary =
              isToxicology && numericCount === 0
                ? `${test.parameters.length} ${test.parameters.length === 1 ? 'param' : 'params'} · no ranges`
                : isToxicology && numericCount < test.parameters.length
                  ? `${test.parameters.length} params · ${numericCount} numeric`
                  : `${test.parameters.length} params`

            return (
              <div
                key={test.id}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow"
              >
                <div className="flex items-center gap-3 bg-[color:var(--color-nav)] px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(test.id)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform',
                        !isOpen && '-rotate-90',
                      )}
                    />
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white">
                      <FlaskConical className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-semibold text-white">{test.name}</h3>
                      <p className="text-[11px] text-slate-300">
                        {test.department} · {test.specimen} · {paramSummary}
                      </p>
                    </div>
                  </button>

                  {showServiceToggle && (
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className="hidden text-[11px] font-medium text-slate-300 sm:block">
                        {tabToggleLabel()}
                        <span className="ml-1 text-slate-400">
                          ({onCount}/{toggleParams.length})
                        </span>
                      </span>
                      <Toggle
                        checked={allOn}
                        onChange={(v) => setAllParams(test.id, { [field]: v } as Partial<TestParameter>)}
                        label={`Toggle all for ${test.name}`}
                      />
                    </div>
                  )}
                </div>

                {isOpen && (
                  <>
                    {activeTab === 'auto-approval' &&
                      (isToxicology ? (
                        <ToxicologyAutoApprovalTable test={test} onChange={updateParam} />
                      ) : (
                        <AutoApprovalRangeTable test={test} onChange={updateParam} />
                      ))}
                    {activeTab === 'delta' && (
                      <DeltaRangeTable test={test} onChange={updateParam} disabled={!allOn} />
                    )}
                    {activeTab === 'linearity' && (
                      <LinearityRangeTable test={test} onChange={updateParam} disabled={!allOn} />
                    )}
                  </>
                )}
              </div>
            )
          })}

          {filteredTests.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-[13px] text-slate-400">
              No services match your search.
            </div>
          )}
        </div>

        {layout === 'modal' && (
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
              Configurations saved here will enable auto-validation for these services.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {layout === 'inline' && (
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
              Save your range settings before continuing.
            </p>
            <Button variant="primary" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              Save Configuration
            </Button>
          </div>
        )}
      </div>

      {layout === 'page' ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:pl-[232px]">
          <ConfigFooter
            autoRangeParams={autoRangeParams}
            testCount={tests.length}
            onCancel={onCancel}
            onSave={handleSave}
          />
        </div>
      ) : null}

      <Modal
        open={saved && layout !== 'inline'}
        onClose={() => setSaved(false)}
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        title="Rule Activated"
        description="Your auto approval settings have been saved and the rule is now active."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaved(false)}>
              Keep Editing
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSaved(false)
                onCancel()
              }}
            >
              Done
            </Button>
          </>
        }
      >
        <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2.5">
          <span className="text-[13px] font-medium text-emerald-800">Status</span>
          <StatusBadge tone="active" dot>
            Active
          </StatusBadge>
        </div>
      </Modal>
    </>
  )
}

export function ConfigFooter({
  autoRangeParams,
  testCount,
  onCancel,
  onSave,
}: {
  autoRangeParams: number
  testCount: number
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-6 py-2.5">
      <div className="hidden items-center gap-1.5 text-[12px] text-slate-500 sm:flex">
        <Activity className="h-3.5 w-3.5 text-brand-500" />
        <span>
          <span className="font-semibold text-slate-700">{autoRangeParams}</span> parameters set for
          auto approval across <span className="font-semibold text-slate-700">{testCount}</span> tests
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="success" size="lg" onClick={onSave}>
          <Save className="h-3.5 w-3.5" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}

interface ConfigureAutoApprovalModalProps {
  open: boolean
  onClose: () => void
  ruleId: string
  ruleName: string
  domain: string
  serviceCount: number
  criteria?: RuleCriterion[]
  onSaved?: () => void
}

export function ConfigureAutoApprovalModal({
  open,
  onClose,
  ruleId,
  ruleName,
  domain,
  serviceCount,
  criteria,
  onSaved,
}: ConfigureAutoApprovalModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<ShieldCheck className="h-4 w-4" />}
      title="Configure Auto Approval for Selected Services"
      description={
        ruleId === 'toxicology-auto-approval' || domain === 'Toxicology'
          ? `Review mapped tests and configure ranges only where numeric parameters apply for ${ruleName}.`
          : `Set ranges for ${ruleName} after reviewing simulation results.`
      }
      maxWidth="max-w-5xl"
    >
      {open && (
        <AutoApprovalConfigPanel
          ruleId={ruleId}
          domain={domain}
          serviceCount={serviceCount}
          criteria={criteria}
          onCancel={onClose}
          onSaved={onSaved}
          layout="modal"
        />
      )}
    </Modal>
  )
}
