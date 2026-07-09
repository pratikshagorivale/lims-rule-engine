import type { RuleDefinition } from '../data/types'

export interface TestClaim {
  ruleId: string
  ruleName: string
}

/** Map each test id to the rule that currently owns it. */
export function buildTestClaimMap(
  rules: RuleDefinition[],
  excludeRuleId?: string,
): Map<string, TestClaim> {
  const map = new Map<string, TestClaim>()
  for (const rule of rules) {
    if (excludeRuleId && rule.id === excludeRuleId) continue
    for (const test of rule.mappedTests) {
      map.set(test.id, { ruleId: rule.id, ruleName: rule.name })
    }
  }
  return map
}

export function countAddableTests(
  catalog: { id: string }[],
  mappedIds: Set<string>,
  claims: Map<string, TestClaim>,
): number {
  return catalog.filter((t) => !mappedIds.has(t.id) && !claims.has(t.id)).length
}
