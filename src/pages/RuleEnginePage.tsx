import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, Lock, Plus, TestTubes } from 'lucide-react'
import { rules } from '../data/rules'
import { StatusBadge } from '../components/StatusBadge'
import { Button } from '../components/Button'

const domainStyles: Record<string, { icon: typeof FlaskConical; ring: string; bg: string; text: string }> = {
  Pathology: { icon: FlaskConical, ring: 'ring-brand-100', bg: 'bg-brand-50', text: 'text-brand-600' },
  Toxicology: { icon: TestTubes, ring: 'ring-violet-100', bg: 'bg-violet-50', text: 'text-violet-600' },
}

export function RuleEnginePage() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-6 py-5">
      {/* Page title bar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">Rule Engine</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">View and manage automation rules.</p>
        </div>

        <div className="relative">
          <Button variant="primary" size="md" disabled className="opacity-100">
            <Plus className="h-3.5 w-3.5" />
            Add New Rule
          </Button>
          <span className="absolute -right-1.5 -top-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-600/20">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Rule list */}
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Default Rules
        </h2>
        <span className="text-[11px] font-medium text-slate-400">
          System-defined · {rules.length} active
        </span>
      </div>

      <div className="mt-2.5 space-y-3">
        {rules.map((rule) => {
          const style = domainStyles[rule.domain] ?? domainStyles.Pathology
          const Icon = style.icon
          const activeChecks = rule.criteria.filter((c) => c.enabled).length
          return (
            <Link
              key={rule.id}
              to={`/rules/${rule.id}`}
              className="group flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 card-shadow transition-all duration-150 hover:border-brand-300 hover:card-shadow-lg sm:flex-row sm:items-center"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${style.bg} ${style.text} ring-1 ring-inset ${style.ring}`}>
                <Icon className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[14px] font-semibold leading-snug text-slate-900">{rule.name}</h3>
                  <StatusBadge tone="active" dot>
                    {rule.status}
                  </StatusBadge>
                </div>
                <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-slate-500">
                  {rule.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">
                    <Lock className="h-2.5 w-2.5" />
                    System Default
                  </span>
                  <span className="text-slate-400">
                    <span className="font-bold text-slate-700">{rule.mappedTests.length}</span> tests mapped
                  </span>
                  <span className="text-slate-400">
                    <span className="font-bold text-slate-700">{activeChecks}</span> active checks
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
    </div>
  )
}
