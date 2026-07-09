import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, Lock, Plus, TestTubes, UserRound } from 'lucide-react'
import { StatusBadge } from '../components/StatusBadge'
import { Button } from '../components/Button'
import { AddNewRuleWizard } from '../components/addRule/AddNewRuleWizard'
import { useRules, isCustomRule } from '../context/RulesContext'
import { cn } from '../lib/cn'

const domainStyles: Record<string, { icon: typeof FlaskConical; ring: string; bg: string; text: string }> = {
  Pathology: { icon: FlaskConical, ring: 'ring-brand-100', bg: 'bg-brand-50', text: 'text-brand-600' },
  Toxicology: { icon: TestTubes, ring: 'ring-violet-100', bg: 'bg-violet-50', text: 'text-violet-600' },
}

export function RuleEnginePage() {
  const { allRules } = useRules()
  const [wizardOpen, setWizardOpen] = useState(false)

  const activeCount = allRules.filter((r) => r.status === 'Active').length

  return (
    <div className="mx-auto w-full max-w-[1360px] px-6 py-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">Rule Engine</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">View and manage automation rules.</p>
        </div>

        <Button variant="primary" size="md" onClick={() => setWizardOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add New Rule
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <span className="text-[11px] font-medium text-slate-400">
          {activeCount} of {allRules.length} active
        </span>
      </div>

      <div className="mt-2.5 space-y-3">
        {allRules.map((rule) => {
          const custom = isCustomRule(rule)
          const style = domainStyles[rule.domain] ?? domainStyles.Pathology
          const Icon = style.icon
          const BadgeIcon = custom ? UserRound : Lock

          return (
            <Link
              key={rule.id}
              to={`/rules/${rule.id}`}
              className="group flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 card-shadow transition-all duration-150 hover:border-brand-300 hover:card-shadow-lg sm:flex-row sm:items-center"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${style.bg} ${style.text} ring-1 ring-inset ${style.ring}`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[14px] font-semibold leading-snug text-slate-900">{rule.name}</h3>
                  <StatusBadge tone={rule.status === 'Active' ? 'active' : 'inactive'} dot>
                    {rule.status}
                  </StatusBadge>
                </div>
                <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-slate-500">
                  {rule.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-semibold',
                      custom
                        ? 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/20'
                        : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    <BadgeIcon className="h-2.5 w-2.5" />
                    {custom ? 'Custom Rule' : 'System Default'}
                  </span>
                  <span className="text-slate-400">
                    <span className="font-bold text-slate-700">{rule.mappedTests.length}</span> tests mapped
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center sm:pl-3">
                <Button variant="secondary" size="sm" className="pointer-events-none w-full sm:w-auto">
                  View Rule
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </Link>
          )
        })}
      </div>

      <AddNewRuleWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  )
}
