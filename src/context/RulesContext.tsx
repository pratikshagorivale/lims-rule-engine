import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { defaultRules } from '../data/rules'
import {
  buildConfigurableTestsFromMapped,
  registerConfigurableTests,
} from '../data/configTests'
import type { RuleDefinition } from '../data/types'

interface RulesContextValue {
  allRules: RuleDefinition[]
  getRuleById: (id: string) => RuleDefinition | undefined
  addCustomRule: (rule: RuleDefinition) => void
  updateCustomRule: (rule: RuleDefinition) => void
}

const RulesContext = createContext<RulesContextValue | null>(null)

const STORAGE_KEY = 'lims-custom-rules'

let ruleCounter = 1

function nextRuleCounter(rules: RuleDefinition[]): number {
  return rules.reduce((m, r) => {
    const match = r.id.match(/^custom-rule-(\d+)$/)
    return match ? Math.max(m, Number(match[1])) : m
  }, 0)
}

function saveCustomRules(rules: RuleDefinition[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
  } catch {
    // localStorage may be unavailable in private mode or when quota is exceeded
  }
}

function loadCustomRules(): RuleDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RuleDefinition[]
    ruleCounter = nextRuleCounter(parsed)
    parsed.forEach((rule) => {
      registerConfigurableTests(
        rule.id,
        buildConfigurableTestsFromMapped(rule.mappedTests, rule.domain),
      )
    })
    return parsed.map((r) => ({ ...r, isCustom: true }))
  } catch {
    return []
  }
}

export function isCustomRule(rule: RuleDefinition): boolean {
  if (rule.isCustom || rule.id.startsWith('custom-rule-')) return true
  return !defaultRules.some((d) => d.id === rule.id)
}

export function generateCustomRuleId(existing: RuleDefinition[] = []): string {
  ruleCounter = Math.max(ruleCounter, nextRuleCounter(existing)) + 1
  return `custom-rule-${ruleCounter}`
}

export function RulesProvider({ children }: { children: ReactNode }) {
  const [customRules, setCustomRules] = useState<RuleDefinition[]>(() => loadCustomRules())

  const allRules = useMemo(() => [...defaultRules, ...customRules], [customRules])

  const getRuleById = useCallback(
    (id: string) => allRules.find((r) => r.id === id),
    [allRules],
  )

  const addCustomRule = useCallback((rule: RuleDefinition) => {
    const saved: RuleDefinition = { ...rule, isCustom: true }
    registerConfigurableTests(
      saved.id,
      buildConfigurableTestsFromMapped(saved.mappedTests, saved.domain),
    )
    setCustomRules((prev) => {
      const next = [...prev.filter((r) => r.id !== saved.id), saved]
      saveCustomRules(next)
      return next
    })
  }, [])

  const updateCustomRule = useCallback((rule: RuleDefinition) => {
    const saved: RuleDefinition = { ...rule, isCustom: true }
    registerConfigurableTests(
      saved.id,
      buildConfigurableTestsFromMapped(saved.mappedTests, saved.domain),
    )
    setCustomRules((prev) => {
      const next = prev.map((r) => (r.id === saved.id ? saved : r))
      saveCustomRules(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ allRules, getRuleById, addCustomRule, updateCustomRule }),
    [allRules, getRuleById, addCustomRule, updateCustomRule],
  )

  return <RulesContext.Provider value={value}>{children}</RulesContext.Provider>
}

export function useRules() {
  const ctx = useContext(RulesContext)
  if (!ctx) throw new Error('useRules must be used within RulesProvider')
  return ctx
}
