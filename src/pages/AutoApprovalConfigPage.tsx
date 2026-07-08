import { Link, useParams } from 'react-router-dom'
import { getRuleById } from '../data/rules'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { AutoApprovalConfigPanel } from '../components/autoApprovalConfig/AutoApprovalConfigPanel'
import { configurableTestsByRule } from '../data/configTests'
import { useMemo } from 'react'

export function AutoApprovalConfigPage() {
  const { ruleId = '' } = useParams()
  const rule = getRuleById(ruleId)

  const initialTests = useMemo(
    () =>
      configurableTestsByRule[ruleId]?.map((t) => ({
        ...t,
        parameters: t.parameters.map((p) => ({ ...p })),
      })) ?? [],
    [ruleId],
  )

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

  return (
    <div className="mx-auto w-full max-w-[1360px] px-6 py-5 pb-20">
      <Breadcrumbs
        items={[
          { label: 'Rule Engine', to: '/' },
          { label: rule.name, to: `/rules/${rule.id}` },
          { label: 'Configure Auto Approval' },
        ]}
      />

      <div className="mt-2.5 border-b border-slate-200 pb-4">
        <h1 className="text-[18px] font-bold tracking-tight text-slate-900">Configure Auto Approval</h1>
        <p className="mt-0.5 max-w-2xl text-[13px] text-slate-500">
          Set approval ranges, delta limits and linearity settings for each test parameter under{' '}
          <span className="font-semibold text-slate-700">{rule.name}</span>.
        </p>
      </div>

      <div className="mt-4">
        <AutoApprovalConfigPanel
          ruleId={rule.id}
          domain={rule.domain}
          serviceCount={initialTests.length}
          onCancel={() => window.history.back()}
          layout="page"
        />
      </div>
    </div>
  )
}
