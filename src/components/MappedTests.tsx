import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, FlaskConical, Minus, Search, Trash2, X } from 'lucide-react'
import type { MappedTest } from '../data/types'
import { cn } from '../lib/cn'

interface MappedTestsProps {
  mapped: MappedTest[]
  catalog: MappedTest[]
  onAdd: (test: MappedTest) => void
  onRemove: (id: string) => void
  /** Tests already mapped to a different rule — cannot be added here. */
  claimedByOther?: Map<string, { ruleName: string }>
  /** Pathology shows delta & linearity columns; toxicology does not */
  showDeltaLinearity?: boolean
}

export function MappedTests({
  mapped,
  catalog,
  onAdd,
  onRemove,
  claimedByOther,
  showDeltaLinearity = true,
}: MappedTestsProps) {
  const [expanded, setExpanded] = useState(true)
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const mappedIds = useMemo(() => new Set(mapped.map((m) => m.id)), [mapped])
  const availableCount = useMemo(
    () => catalog.filter((t) => !mappedIds.has(t.id) && !claimedByOther?.has(t.id)).length,
    [catalog, mappedIds, claimedByOther],
  )

  const q = query.trim().toLowerCase()
  const results = useMemo(
    () =>
      catalog.filter(
        (t) => !q || t.name.toLowerCase().includes(q) || t.department.toLowerCase().includes(q),
      ),
    [catalog, q],
  )

  // Close the results dropdown when clicking outside the add-tests area.
  useEffect(() => {
    if (!dropdownOpen) return
    const onDocMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [dropdownOpen])

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white card-shadow">
      {/* Header — click to expand/collapse */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50/60',
          expanded && 'border-b border-slate-200',
        )}
        aria-expanded={expanded}
      >
        <ChevronDown
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform',
            !expanded && '-rotate-90',
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-slate-900">Mapped Tests</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
              {mapped.length}
            </span>
          </div>
          <p className="text-[12px] text-slate-500">
            Tests governed by this rule
            {showDeltaLinearity ? ' and their configured checks.' : '.'}
          </p>
        </div>
      </button>

      {expanded && (
        <>
          {/* Add tests */}
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="add-test" className="text-[12px] font-semibold text-slate-700">
                Add Tests to this Rule
              </label>
              <span className="text-[11px] text-slate-400">{availableCount} available</span>
            </div>

            <div ref={wrapRef} className="relative max-w-md">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                id="add-test"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setDropdownOpen(true)
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search tests to add…"
                className="h-8 w-full rounded-md border border-slate-300 bg-white pl-8 pr-8 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Results dropdown — checkbox selection */}
              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 card-shadow-lg">
                  {results.length === 0 ? (
                    <div className="px-3 py-3 text-center text-[12px] text-slate-400">
                      No matching tests found.
                    </div>
                  ) : (
                    results.map((t) => {
                      const checked = mappedIds.has(t.id)
                      const claim = claimedByOther?.get(t.id)
                      const disabled = Boolean(claim) && !checked
                      return (
                        <label
                          key={t.id}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 transition-colors',
                            disabled
                              ? 'cursor-not-allowed bg-slate-50/80 opacity-70'
                              : 'cursor-pointer hover:bg-brand-50',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => {
                              if (disabled) return
                              if (checked) onRemove(t.id)
                              else onAdd(t)
                            }}
                            className="h-4 w-4 shrink-0 rounded border-slate-300 accent-brand-600 disabled:cursor-not-allowed"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium text-slate-800">
                              {t.name}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {claim ? `Mapped to ${claim.ruleName}` : t.department}
                            </span>
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2">Test Name</th>
              <th className="px-4 py-2 text-center">Auto Approval Range Configured</th>
              {showDeltaLinearity && (
                <>
                  <th className="px-4 py-2 text-center">Delta Check Enabled</th>
                  <th className="px-4 py-2 text-center">Linearity Check Enabled</th>
                </>
              )}
              <th className="w-10 px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mapped.map((t) => (
              <tr key={t.id} className="group transition-colors hover:bg-slate-50/70">
                <td className="px-4 py-2">
                  <div className="font-semibold text-slate-800">{t.name}</div>
                  <div className="text-[11px] text-slate-400">{t.department}</div>
                </td>
                <td className="px-4 py-2 text-center">
                  <CheckCell on={t.autoApprovalRange} />
                </td>
                {showDeltaLinearity && (
                  <>
                    <td className="px-4 py-2 text-center">
                      <CheckCell on={t.deltaCheck} />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <CheckCell on={t.linearityCheck} />
                    </td>
                  </>
                )}
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => onRemove(t.id)}
                    title="Remove test from rule"
                    className="rounded p-1 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 group-hover:text-slate-400"
                    aria-label={`Remove ${t.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {mapped.length === 0 && (
              <tr>
                <td colSpan={showDeltaLinearity ? 5 : 3} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FlaskConical className="h-5 w-5" />
                    </div>
                    <p className="mt-2.5 text-[13px] font-semibold text-slate-700">
                      No tests mapped
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-400">
                      This rule has no tests mapped yet. Use the search above to add tests.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-400">
        {mapped.length} {mapped.length === 1 ? 'test' : 'tests'} mapped to this rule
      </div>
        </>
      )}
    </div>
  )
}

function CheckCell({ on }: { on: boolean }) {
  if (on) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <CheckCircle2 className="h-3 w-3" />
        Enabled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-500/10">
      <Minus className="h-3 w-3" />
      Not set
    </span>
  )
}
