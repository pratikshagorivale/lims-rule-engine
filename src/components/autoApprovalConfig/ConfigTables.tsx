import { cn } from '../../lib/cn'
import { Toggle } from '../Toggle'
import { ConfigNumberInput } from './ConfigNumberInput'
import type { ConfigurableTest, TestParameter } from '../../data/types'

export function isRangeConfigurableParam(p: TestParameter): boolean {
  return p.type === 'Numeric'
}

export function AutoApprovalRangeTable({
  test,
  onChange,
}: {
  test: ConfigurableTest
  onChange: (testId: string, paramId: string, patch: Partial<TestParameter>) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-[13px]">
        <thead>
          <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2">Parameter</th>
            <th className="px-2.5 py-2">Type</th>
            <th className="px-2.5 py-2">AA Min</th>
            <th className="px-2.5 py-2">AA Max</th>
            <th className="px-2.5 py-2">Unit</th>
            <th className="px-4 py-2 text-center">Enable Range</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {test.parameters.map((p) => {
            const disabled = !p.autoApprovalRangeEnabled
            return (
              <tr key={p.id} className={cn('align-middle', disabled && 'bg-slate-50/50')}>
                <td className="px-4 py-2 font-semibold text-slate-800">{p.name}</td>
                <td className="px-2.5 py-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {p.type}
                  </span>
                </td>
                <td className="px-2.5 py-2">
                  <ConfigNumberInput
                    value={p.autoMin}
                    disabled={disabled}
                    onChange={(v) => onChange(test.id, p.id, { autoMin: v })}
                  />
                </td>
                <td className="px-2.5 py-2">
                  <ConfigNumberInput
                    value={p.autoMax}
                    disabled={disabled}
                    onChange={(v) => onChange(test.id, p.id, { autoMax: v })}
                  />
                </td>
                <td className="px-2.5 py-2 text-slate-500">{p.unit}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-center">
                    <Toggle
                      checked={p.autoApprovalRangeEnabled}
                      onChange={(v) => onChange(test.id, p.id, { autoApprovalRangeEnabled: v })}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ToxicologyAutoApprovalTable({
  test,
  onChange,
}: {
  test: ConfigurableTest
  onChange: (testId: string, paramId: string, patch: Partial<TestParameter>) => void
}) {
  const numericParams = test.parameters.filter(isRangeConfigurableParam)
  const nonNumericParams = test.parameters.filter((p) => !isRangeConfigurableParam(p))

  return (
    <div>
      {nonNumericParams.length > 0 && (
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Parameters
          </p>
          <ul className="space-y-1.5">
            {nonNumericParams.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="font-semibold text-slate-800">{p.name}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                  {p.type}
                </span>
              </li>
            ))}
          </ul>
          {numericParams.length === 0 && (
            <p className="mt-2 text-[12px] text-slate-500">Range configuration is not required.</p>
          )}
        </div>
      )}

      {numericParams.length > 0 && (
        <div className="overflow-x-auto">
          {nonNumericParams.length > 0 && (
            <p className="border-b border-slate-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Numeric parameters — range configuration
            </p>
          )}
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2">Parameter</th>
                <th className="px-2.5 py-2">AA Min</th>
                <th className="px-2.5 py-2">AA Max</th>
                <th className="px-2.5 py-2">Unit</th>
                <th className="px-4 py-2 text-center">Enable Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {numericParams.map((p) => {
                const disabled = !p.autoApprovalRangeEnabled
                return (
                  <tr key={p.id} className={cn('align-middle', disabled && 'bg-slate-50/50')}>
                    <td className="px-4 py-2 font-semibold text-slate-800">{p.name}</td>
                    <td className="px-2.5 py-2">
                      <ConfigNumberInput
                        value={p.autoMin}
                        disabled={disabled}
                        onChange={(v) => onChange(test.id, p.id, { autoMin: v })}
                      />
                    </td>
                    <td className="px-2.5 py-2">
                      <ConfigNumberInput
                        value={p.autoMax}
                        disabled={disabled}
                        onChange={(v) => onChange(test.id, p.id, { autoMax: v })}
                      />
                    </td>
                    <td className="px-2.5 py-2 text-slate-500">{p.unit}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center">
                        <Toggle
                          checked={p.autoApprovalRangeEnabled}
                          onChange={(v) => onChange(test.id, p.id, { autoApprovalRangeEnabled: v })}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function DeltaRangeTable({
  test,
  onChange,
  disabled = false,
}: {
  test: ConfigurableTest
  onChange: (testId: string, paramId: string, patch: Partial<TestParameter>) => void
  disabled?: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px] text-[13px]">
        <thead>
          <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2">Parameter</th>
            <th className="px-2.5 py-2">Unit</th>
            <th className="px-2.5 py-2">Delta %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {test.parameters.map((p) => (
            <tr key={p.id} className={cn('align-middle', disabled && 'bg-slate-50/50')}>
              <td className="px-4 py-2 font-semibold text-slate-800">{p.name}</td>
              <td className="px-2.5 py-2 text-slate-500">{p.unit}</td>
              <td className="px-2.5 py-2">
                <ConfigNumberInput
                  value={p.deltaPercent}
                  suffix="%"
                  disabled={disabled}
                  onChange={(v) => onChange(test.id, p.id, { deltaPercent: v })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LinearityRangeTable({
  test,
  onChange,
  disabled = false,
}: {
  test: ConfigurableTest
  onChange: (testId: string, paramId: string, patch: Partial<TestParameter>) => void
  disabled?: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-[13px]">
        <thead>
          <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2">Parameter</th>
            <th className="px-2.5 py-2">Unit</th>
            <th className="px-2.5 py-2">Linear Range Min</th>
            <th className="px-2.5 py-2">Linear Range Max</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {test.parameters.map((p) => (
            <tr key={p.id} className={cn('align-middle', disabled && 'bg-slate-50/50')}>
              <td className="px-4 py-2 font-semibold text-slate-800">{p.name}</td>
              <td className="px-2.5 py-2 text-slate-500">{p.unit}</td>
              <td className="px-2.5 py-2">
                <ConfigNumberInput
                  value={p.autoMin}
                  disabled={disabled}
                  onChange={(v) => onChange(test.id, p.id, { autoMin: v })}
                />
              </td>
              <td className="px-2.5 py-2">
                <ConfigNumberInput
                  value={p.autoMax !== null ? p.autoMax * 10 : null}
                  disabled={disabled}
                  onChange={(v) => onChange(test.id, p.id, { autoMax: v !== null ? v / 10 : null })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
