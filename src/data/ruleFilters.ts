export interface AccountOption {
  id: string
  name: string
  type: string
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

export const departmentOptions: Record<string, string[]> = {
  Pathology: ['Hematology', 'Biochemistry', 'Immunoassay', 'Microbiology', 'Serology'],
  Toxicology: ['Toxicology'],
}

export function createDefaultFilters() {
  return {
    ageGroup: { enabled: false, from: null as number | null, to: null as number | null },
    gender: { enabled: false, male: true, female: true, other: false },
    accounts: { enabled: false, selectedIds: [] as string[] },
    department: { enabled: false, selected: [] as string[] },
    patientType: { enabled: false, ipd: true, opd: true },
  }
}
