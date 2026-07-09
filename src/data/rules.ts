import type { RuleDefinition } from './types'

export const rules: RuleDefinition[] = [
  {
    id: 'pathology-auto-approval',
    name: 'Auto Approval for Pathology Reporting',
    domain: 'Pathology',
    description:
      'Standard rule for automatic pathology report approval based on result ranges, report exceptions, delta check and linearity check.',
    status: 'Active',
    criteria: [
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
        enabled: true,
      },
      {
        id: 'delta',
        label: 'Delta Check',
        description: 'Compare with previous values for the same patient',
        enabled: true,
      },
      {
        id: 'linearity',
        label: 'Linearity Check',
        description: 'Verify result falls within instrument linearity range',
        enabled: true,
      },
    ],
    mappedTests: [
      { id: 't-hgb', name: 'Hemoglobin (Hb)', department: 'Hematology', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
      { id: 't-wbc', name: 'Total Leukocyte Count (WBC)', department: 'Hematology', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
      { id: 't-plt', name: 'Platelet Count', department: 'Hematology', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
      { id: 't-glu', name: 'Fasting Blood Glucose', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
      { id: 't-cre', name: 'Serum Creatinine', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
      { id: 't-na', name: 'Sodium (Na+)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
      { id: 't-k', name: 'Potassium (K+)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
      { id: 't-tsh', name: 'Thyroid Stimulating Hormone (TSH)', department: 'Immunoassay', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
      { id: 't-alt', name: 'Alanine Transaminase (ALT)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
      { id: 't-crp', name: 'C-Reactive Protein (CRP)', department: 'Immunoassay', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
    ],
  },
  {
    id: 'toxicology-auto-approval',
    name: 'Auto Approval for Toxicology Reporting',
    domain: 'Toxicology',
    description:
      'Standard rule for automatic toxicology report approval based on prescription, history and correlation checks.',
    status: 'Active',
    ruleLogicHeading: 'These rules will be evaluated while auto validating the report',
    criteriaReadOnly: true,
    criteria: [
      {
        id: 'prescription',
        label: 'Prescription Check',
        description:
          'Auto-approve only if detected drugs are consistent with prescribed drugs (if prescription data is available).',
        enabled: true,
      },
      {
        id: 'history',
        label: 'History Check',
        description:
          'Auto approves the report only if current screening results are consistent with patient\'s historical screening results.',
        enabled: true,
      },
      {
        id: 'correlation',
        label: 'Correlation Check',
        description:
          'Auto-approve only if screening and confirmation results are concordant for all applicable drugs.',
        enabled: true,
      },
    ],
    mappedTests: [
      { id: 'x-amp', name: 'Amphetamines Screen', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
      { id: 'x-opi', name: 'Opiates Confirmation', department: 'Toxicology', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
      { id: 'x-bzo', name: 'Benzodiazepines Screen', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
      { id: 'x-thc', name: 'Cannabinoids (THC-COOH)', department: 'Toxicology', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
      { id: 'x-coc', name: 'Cocaine Metabolite', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
      { id: 'x-etg', name: 'Ethyl Glucuronide (EtG)', department: 'Toxicology', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
      { id: 'x-met', name: 'Methadone (EDDP)', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
      { id: 'x-fen', name: 'Fentanyl Confirmation', department: 'Toxicology', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
    ],
  },
]

export function getRuleById(id: string): RuleDefinition | undefined {
  return rules.find((r) => r.id === id)
}

export const defaultRules = rules
