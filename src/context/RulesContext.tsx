import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { defaultRules } from '../data/rules'
import {
  buildConfigurableTestsFromMapped,
  registerConfigurableTests,
  unregisterConfigurableTests,
} from '../data/configTests'
import type { RuleDefinition, RuleStatus } from '../data/types'

interface RulesContextValue {
  allRules: RuleDefinition[]
  getRuleById: (id: string) => RuleDefinition | undefined
  addCustomRule: (rule: RuleDefinition) => void
  updateCustomRule: (rule: RuleDefinition) => void
  deleteCustomRule: (ruleId: string) => void
  setRuleStatus: (ruleId: string, status: RuleStatus) => void
}

const RulesContext = createContext<RulesContextValue | null>(null)

const STORAGE_KEY = 'lims-custom-rules'
const STATUS_OVERRIDES_KEY = 'lims-rule-status-overrides'

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

function loadStatusOverrides(): Record<string, RuleStatus> {
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, RuleStatus>
  } catch {
    return {}
  }
}

function saveStatusOverrides(overrides: Record<string, RuleStatus>) {
  try {
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides))
  } catch {
    // localStorage may be unavailable
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
  const [statusOverrides, setStatusOverrides] = useState<Record<string, RuleStatus>>(
    () => loadStatusOverrides(),
  )

  const allRules = useMemo(
    () => [
      ...defaultRules.map((rule) => ({
        ...rule,
        status: statusOverrides[rule.id] ?? rule.status,
      })),
      ...customRules,
    ],
    [customRules, statusOverrides],
  )

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

  const deleteCustomRule = useCallback((ruleId: string) => {
    unregisterConfigurableTests(ruleId)
    setCustomRules((prev) => {
      const next = prev.filter((r) => r.id !== ruleId)
      saveCustomRules(next)
      return next
    })
  }, [])

  const setRuleStatus = useCallback((ruleId: string, status: RuleStatus) => {
    const isDefault = defaultRules.some((r) => r.id === ruleId)
    if (isDefault) {
      setStatusOverrides((prev) => {
        const next = { ...prev, [ruleId]: status }
        saveStatusOverrides(next)
        return next
      })
      return
    }

    setCustomRules((prev) => {
      const next = prev.map((r) => (r.id === ruleId ? { ...r, status } : r))
      saveCustomRules(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ allRules, getRuleById, addCustomRule, updateCustomRule, deleteCustomRule, setRuleStatus }),
    [allRules, getRuleById, addCustomRule, updateCustomRule, deleteCustomRule, setRuleStatus],
  )

  return <RulesContext.Provider value={value}>{children}</RulesContext.Provider>
}

export function useRules() {
  const ctx = useContext(RulesContext)
  if (!ctx) throw new Error('useRules must be used within RulesProvider')
  return ctx
}
