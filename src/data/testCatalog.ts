import type { MappedTest, RuleDomain } from './types'
import { rules } from './rules'

// Additional laboratory tests available to map onto each default rule.
// These are the tests surfaced by the "add tests" search on the rule details
// page (the rule's already-mapped tests live in rules.ts).
export const extraTestsByRule: Record<string, MappedTest[]> = {
  'pathology-auto-approval': [
    { id: 't-cl', name: 'Chloride (Cl-)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-hco3', name: 'Bicarbonate (HCO3)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-bun', name: 'Blood Urea Nitrogen (BUN)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
    { id: 't-ca', name: 'Calcium (Total)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
    { id: 't-mg', name: 'Magnesium', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-po4', name: 'Phosphorus', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-tbil', name: 'Total Bilirubin', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
    { id: 't-dbil', name: 'Direct Bilirubin', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
    { id: 't-ast', name: 'Aspartate Transaminase (AST)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
    { id: 't-alp', name: 'Alkaline Phosphatase (ALP)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-ggt', name: 'Gamma-Glutamyl Transferase (GGT)', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-alb', name: 'Albumin', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-tp', name: 'Total Protein', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-ua', name: 'Uric Acid', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
    { id: 't-hba1c', name: 'HbA1c', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
    { id: 't-chol', name: 'Total Cholesterol', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-hdl', name: 'HDL Cholesterol', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-ldl', name: 'LDL Cholesterol', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-tg', name: 'Triglycerides', department: 'Biochemistry', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
    { id: 't-esr', name: 'Erythrocyte Sedimentation Rate (ESR)', department: 'Hematology', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 't-retic', name: 'Reticulocyte Count', department: 'Hematology', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
    { id: 't-ferr', name: 'Ferritin', department: 'Immunoassay', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
    { id: 't-vitd', name: 'Vitamin D (25-OH)', department: 'Immunoassay', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
    { id: 't-b12', name: 'Vitamin B12', department: 'Immunoassay', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
  ],
  'toxicology-auto-approval': [
    { id: 'x-bar', name: 'Barbiturates Screen', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 'x-bup', name: 'Buprenorphine', department: 'Toxicology', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
    { id: 'x-oxy', name: 'Oxycodone', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
    { id: 'x-tra', name: 'Tramadol', department: 'Toxicology', autoApprovalRange: true, deltaCheck: true, linearityCheck: false },
    { id: 'x-pcp', name: 'Phencyclidine (PCP)', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 'x-ket', name: 'Ketamine', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
    { id: 'x-mdma', name: 'MDMA (Ecstasy)', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 'x-etoh', name: 'Ethanol (Blood Alcohol)', department: 'Toxicology', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
    { id: 'x-6mam', name: '6-Monoacetylmorphine (6-MAM)', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: true },
    { id: 'x-cari', name: 'Carisoprodol', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 'x-pro', name: 'Propoxyphene', department: 'Toxicology', autoApprovalRange: true, deltaCheck: false, linearityCheck: false },
    { id: 'x-mor', name: 'Morphine (Confirmation)', department: 'Toxicology', autoApprovalRange: true, deltaCheck: true, linearityCheck: true },
  ],
}

/** All tests available when mapping tests in the custom-rule wizard. */
export function testsByDomain(domain: RuleDomain): MappedTest[] {
  const seen = new Set<string>()
  const merged: MappedTest[] = []

  for (const rule of rules) {
    if (rule.domain !== domain) continue
    for (const test of rule.mappedTests) {
      if (!seen.has(test.id)) {
        seen.add(test.id)
        merged.push(test)
      }
    }
    for (const test of extraTestsByRule[rule.id] ?? []) {
      if (!seen.has(test.id)) {
        seen.add(test.id)
        merged.push(test)
      }
    }
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name))
}

