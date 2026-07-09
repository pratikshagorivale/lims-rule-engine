export interface AccountOption {
  id: string
  name: string
  type: string
}

export interface ProviderOption {
  id: string
  name: string
  specialty: string
}

export interface InsuranceOption {
  id: string
  name: string
}

export interface IcdCodeOption {
  id: string
  code: string
  description: string
}

export const accountOptions: AccountOption[] = [
  { id: 'acc-1', name: 'City General Hospital', type: 'Hospital' },
  { id: 'acc-2', name: 'Metro Diagnostics Lab', type: 'Reference Lab' },
  { id: 'acc-3', name: 'Sunrise Medical Center', type: 'Hospital' },
  { id: 'acc-4', name: 'BioScience Research Institute', type: 'Research' },
  { id: 'acc-5', name: 'Valley Health Network', type: 'Health Network' },
  { id: 'acc-6', name: 'Premier Pathology Partners', type: 'Reference Lab' },
  { id: 'acc-7', name: 'Northside Clinic', type: 'Clinic' },
  { id: 'acc-8', name: 'Lakeside Toxicology Services', type: 'Specialty Lab' },
]

export const providerOptions: ProviderOption[] = [
  { id: 'prov-1', name: 'Dr. Sarah Chen', specialty: 'Internal Medicine' },
  { id: 'prov-2', name: 'Dr. James Wilson', specialty: 'Pathology' },
  { id: 'prov-3', name: 'Dr. Maria Lopez', specialty: 'Emergency Medicine' },
  { id: 'prov-4', name: 'Dr. Robert Kim', specialty: 'Family Medicine' },
  { id: 'prov-5', name: 'Dr. Emily Patel', specialty: 'Pediatrics' },
  { id: 'prov-6', name: 'Dr. Michael Torres', specialty: 'Toxicology' },
]

export const insuranceOptions: InsuranceOption[] = [
  { id: 'ins-1', name: 'BlueCross BlueShield' },
  { id: 'ins-2', name: 'Aetna' },
  { id: 'ins-3', name: 'UnitedHealthcare' },
  { id: 'ins-4', name: 'Cigna' },
  { id: 'ins-5', name: 'Medicare' },
  { id: 'ins-6', name: 'Medicaid' },
  { id: 'ins-7', name: 'Self-Pay / Uninsured' },
]

export const icdCodeOptions: IcdCodeOption[] = [
  { id: 'icd-1', code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { id: 'icd-2', code: 'I10', description: 'Essential (primary) hypertension' },
  { id: 'icd-3', code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
  { id: 'icd-4', code: 'N18.3', description: 'Chronic kidney disease, stage 3' },
  { id: 'icd-5', code: 'R79.89', description: 'Other specified abnormal findings of blood chemistry' },
  { id: 'icd-6', code: 'Z00.00', description: 'Encounter for general adult medical examination' },
  { id: 'icd-7', code: 'F11.20', description: 'Opioid dependence, uncomplicated' },
  { id: 'icd-8', code: 'D64.9', description: 'Anemia, unspecified' },
]

export const instrumentOptions = [
  'Cobas 6000',
  'Architect ci8200',
  'Sysmex XN-1000',
  'Alinity ci',
  'DXI 800',
  'Vitros 5600',
  'Mass Spectrometer LC-MS/MS',
  'Immunoassay Analyzer',
]

export function createDefaultFilters() {
  return {
    ageGroup: { enabled: false, from: null as number | null, to: null as number | null },
    gender: { enabled: false, male: true, female: true, other: false },
    patientType: { enabled: false, ipd: true, opd: true },
    icdCodes: { enabled: false, selectedIds: [] as string[] },
    accounts: { enabled: false, selectedIds: [] as string[] },
    providers: { enabled: false, selectedIds: [] as string[] },
    insurance: { enabled: false, selectedIds: [] as string[] },
    instruments: { enabled: false, selected: [] as string[] },
  }
}

/** Merge saved filters with defaults for backward compatibility. */
export function mergeFilters(saved?: Partial<ReturnType<typeof createDefaultFilters>>) {
  const defaults = createDefaultFilters()
  if (!saved) return defaults
  return {
    ageGroup: { ...defaults.ageGroup, ...saved.ageGroup },
    gender: { ...defaults.gender, ...saved.gender },
    patientType: { ...defaults.patientType, ...saved.patientType },
    icdCodes: { ...defaults.icdCodes, ...saved.icdCodes },
    accounts: { ...defaults.accounts, ...saved.accounts },
    providers: { ...defaults.providers, ...saved.providers },
    insurance: { ...defaults.insurance, ...saved.insurance },
    instruments: { ...defaults.instruments, ...saved.instruments },
  }
}
