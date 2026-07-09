import type { RuleCriterion, RuleDomain } from './types'

export const criteriaCatalogByDomain: Record<RuleDomain, RuleCriterion[]> = {
  Pathology: [
    {
      id: 'range',
      label: 'Auto Approval Range Check',
      description:
        'Confirms every result falls inside the approved reference range configured for the test before it is released.',
      enabled: false,
    },
    {
      id: 'exception',
      label: 'Critical Value / Exception Check',
      description:
        'Holds any report that carries a flagged exception, critical value or pending remark for manual review.',
      enabled: false,
    },
    {
      id: 'delta',
      label: 'Delta Check',
      description:
        'Compares the current result with the patient’s previous result and flags unexpected shifts beyond the allowed variation.',
      enabled: false,
    },
    {
      id: 'linearity',
      label: 'Linearity Check',
      description:
        'Verifies results measured near instrument limits stay within the validated linear reporting range.',
      enabled: false,
    },
    {
      id: 'previous-report',
      label: 'Previous Report Comparison',
      description:
        'Evaluates whether the current report is consistent with the patient’s most recent comparable report.',
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
    enabled: enabledIds.has(c.id),
  }))
}
