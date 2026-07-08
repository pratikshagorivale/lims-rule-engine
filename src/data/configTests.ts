import type { ConfigurableTest } from './types'

// Detailed, editable parameter configuration used on the "Enable Auto Approval" screen.
export const configurableTestsByRule: Record<string, ConfigurableTest[]> = {
  'pathology-auto-approval': [
    {
      id: 't-cbc',
      name: 'Complete Blood Count (CBC)',
      department: 'Hematology',
      specimen: 'Whole Blood (EDTA)',
      parameters: [
        { id: 'p-hgb', name: 'Hemoglobin', unit: 'g/dL', type: 'Numeric', autoMin: 12.0, autoMax: 17.5, deltaPercent: 15, deltaAllowed: true, linearityEnabled: true, autoApprovalRangeEnabled: true },
        { id: 'p-wbc', name: 'Total Leukocyte Count', unit: '10³/µL', type: 'Numeric', autoMin: 4.0, autoMax: 11.0, deltaPercent: 25, deltaAllowed: true, linearityEnabled: false, autoApprovalRangeEnabled: true },
        { id: 'p-plt', name: 'Platelet Count', unit: '10³/µL', type: 'Numeric', autoMin: 150, autoMax: 410, deltaPercent: 30, deltaAllowed: true, linearityEnabled: true, autoApprovalRangeEnabled: true },
        { id: 'p-hct', name: 'Hematocrit', unit: '%', type: 'Numeric', autoMin: 36, autoMax: 50, deltaPercent: 15, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: true },
      ],
    },
    {
      id: 't-mp',
      name: 'Metabolic Panel',
      department: 'Biochemistry',
      specimen: 'Serum',
      parameters: [
        { id: 'p-glu', name: 'Fasting Glucose', unit: 'mg/dL', type: 'Numeric', autoMin: 70, autoMax: 100, deltaPercent: 20, deltaAllowed: true, linearityEnabled: true, autoApprovalRangeEnabled: true },
        { id: 'p-cre', name: 'Creatinine', unit: 'mg/dL', type: 'Numeric', autoMin: 0.6, autoMax: 1.3, deltaPercent: 25, deltaAllowed: true, linearityEnabled: false, autoApprovalRangeEnabled: true },
        { id: 'p-na', name: 'Sodium', unit: 'mmol/L', type: 'Numeric', autoMin: 135, autoMax: 145, deltaPercent: 5, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: true },
        { id: 'p-k', name: 'Potassium', unit: 'mmol/L', type: 'Numeric', autoMin: 3.5, autoMax: 5.1, deltaPercent: 10, deltaAllowed: true, linearityEnabled: false, autoApprovalRangeEnabled: true },
      ],
    },
    {
      id: 't-thy',
      name: 'Thyroid Profile',
      department: 'Immunoassay',
      specimen: 'Serum',
      parameters: [
        { id: 'p-tsh', name: 'TSH', unit: 'µIU/mL', type: 'Numeric', autoMin: 0.4, autoMax: 4.0, deltaPercent: 30, deltaAllowed: true, linearityEnabled: true, autoApprovalRangeEnabled: true },
        { id: 'p-ft4', name: 'Free T4', unit: 'ng/dL', type: 'Numeric', autoMin: 0.8, autoMax: 1.8, deltaPercent: 20, deltaAllowed: true, linearityEnabled: true, autoApprovalRangeEnabled: false },
        { id: 'p-ft3', name: 'Free T3', unit: 'pg/mL', type: 'Numeric', autoMin: 2.3, autoMax: 4.2, deltaPercent: 20, deltaAllowed: true, linearityEnabled: false, autoApprovalRangeEnabled: false },
      ],
    },
  ],
  'toxicology-auto-approval': [
    {
      id: 'x-amp',
      name: 'Amphetamines Screen',
      department: 'Toxicology',
      specimen: 'Urine',
      parameters: [
        { id: 'p-amp', name: 'Amphetamines', unit: 'ng/mL', type: 'Numeric', autoMin: 0, autoMax: 500, deltaPercent: null, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: true },
      ],
    },
    {
      id: 'x-opi',
      name: 'Opiates Confirmation',
      department: 'Toxicology',
      specimen: 'Urine',
      parameters: [
        { id: 'p-opi', name: 'Opiates', unit: 'ng/mL', type: 'Numeric', autoMin: 0, autoMax: 2000, deltaPercent: null, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: true },
      ],
    },
    {
      id: 'x-bzo',
      name: 'Benzodiazepines Screen',
      department: 'Toxicology',
      specimen: 'Urine',
      parameters: [
        { id: 'p-bzo', name: 'Benzodiazepines', unit: '—', type: 'List Field', autoMin: null, autoMax: null, deltaPercent: null, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: false },
      ],
    },
    {
      id: 'x-thc',
      name: 'Cannabinoids (THC-COOH)',
      department: 'Toxicology',
      specimen: 'Urine',
      parameters: [
        { id: 'p-thc', name: 'THC-COOH', unit: 'ng/mL', type: 'Numeric', autoMin: 0, autoMax: 50, deltaPercent: null, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: true },
      ],
    },
    {
      id: 'x-coc',
      name: 'Cocaine Metabolite',
      department: 'Toxicology',
      specimen: 'Urine',
      parameters: [
        { id: 'p-coc', name: 'Cocaine Metabolite', unit: 'ng/mL', type: 'Numeric', autoMin: 0, autoMax: 150, deltaPercent: null, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: true },
      ],
    },
    {
      id: 'x-etg',
      name: 'Ethyl Glucuronide (EtG)',
      department: 'Toxicology',
      specimen: 'Urine',
      parameters: [
        { id: 'p-etg', name: 'Ethyl Glucuronide', unit: 'ng/mL', type: 'Numeric', autoMin: 0, autoMax: 500, deltaPercent: null, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: false },
      ],
    },
    {
      id: 'x-met',
      name: 'Methadone (EDDP)',
      department: 'Toxicology',
      specimen: 'Urine',
      parameters: [
        { id: 'p-met', name: 'EDDP', unit: 'ng/mL', type: 'Numeric', autoMin: 0, autoMax: 750, deltaPercent: null, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: true },
      ],
    },
    {
      id: 'x-fen',
      name: 'Fentanyl Confirmation',
      department: 'Toxicology',
      specimen: 'Serum',
      parameters: [
        { id: 'p-fen', name: 'Fentanyl', unit: 'ng/mL', type: 'Numeric', autoMin: 0, autoMax: 1, deltaPercent: null, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: true },
        { id: 'p-fen-q', name: 'Qualitative Result', unit: '—', type: 'List Field', autoMin: null, autoMax: null, deltaPercent: null, deltaAllowed: false, linearityEnabled: false, autoApprovalRangeEnabled: false },
      ],
    },
  ],
}
