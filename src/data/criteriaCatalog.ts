import type { RuleCriterion, RuleDomain } from './types'

export const criteriaCatalogByDomain: Record<RuleDomain, RuleCriterion[]> = {
  Pathology: [
    {
      id: 'range',
      label: 'Auto Approval Range Check',
      description: 'All parameters must be within defined auto approval range',
      enabled: true,
      locked: true,
    },
    {
      id: 'exception',
      label: 'Exceptions Check',
      description: 'No exceptions present (On Hold, QC Fail, In Question, Not Performed)',
      enabled: false,
    },
    {
      id: 'delta',
      label: 'Delta Check',
      description: 'Compare with previous values for the same patient',
      enabled: false,
    },
    {
      id: 'linearity',
      label: 'Linearity Check',
      description: 'Verify result falls within instrument linearity range',
      enabled: false,
    },
    {
      id: 'instrument-flags',
      label: 'Instrument Flags',
      description: 'Verifies if instrument has sent any flags and needs review',
      enabled: false,
    },
  ],
  Toxicology: [
    {
      id: 'prescription',
      label: 'Prescription Check',
      description:
        'Auto-approve only if detected drugs are consistent with prescribed drugs (if prescription data is available).',
      enabled: false,
    },
    {
      id: 'history',
      label: 'History Check',
      description:
        'Auto approves the report only if current screening results are consistent with patient\'s historical screening results.',
      enabled: false,
    },
    {
      id: 'correlation',
      label: 'Correlation Check',
      description:
        'Auto-approve only if screening and confirmation results are concordant for all applicable drugs.',
      enabled: false,
    },
    {
      id: 'range',
      label: 'Auto Approval Range Check',
      description:
        'Applies configured numeric ranges for toxicology parameters where range validation is required.',
      enabled: false,
    },
  ],
}

export function cloneCriteriaForDomain(domain: RuleDomain): RuleCriterion[] {
  return criteriaCatalogByDomain[domain].map((c) => ({ ...c }))
}

/** Rebuild full criteria list when editing, merging saved enabled state into the catalog. */
export function mergeCriteriaForEdit(
  domain: RuleDomain,
  savedCriteria: RuleCriterion[],
): RuleCriterion[] {
  const enabledIds = new Set(savedCriteria.map((c) => c.id))
  return cloneCriteriaForDomain(domain).map((c) => ({
    ...c,
    enabled: c.locked ? true : enabledIds.has(c.id),
  }))
}
