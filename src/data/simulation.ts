import type {
  FailureReasonKey,
  SimulationInput,
  SimulationReportRow,
  SimulationResult,
  ToxicologyFailureReasonKey,
} from './types'

// A curated pool of historical reports used to render the breakdown table.
const reportPools: Record<string, SimulationReportRow[]> = {
  'pathology-auto-approval': [
    { id: 'r1', reportId: 'RPT-104512', accession: '1042', patient: 'Aarav Mehta', mrn: 'MRN-88231', sex: 'M', age: 34, test: 'Complete Blood Count (CBC)', reportStatus: 'Completed', status: 'Auto Approved', reason: 'All parameters within range', reasonKey: 'Passed', collected: '2026-06-14' },
    { id: 'r2', reportId: 'RPT-104518', accession: '1048', patient: 'Sofia Rodriguez', mrn: 'MRN-88240', sex: 'F', age: 29, test: 'Metabolic Panel', reportStatus: 'Pending Approval', status: 'Review Required', reason: 'Potassium above approved range', reasonKey: 'Out of Range', collected: '2026-06-14' },
    { id: 'r3', reportId: 'RPT-104524', accession: '1054', patient: 'Liam O’Connor', mrn: 'MRN-88255', sex: 'M', age: 41, test: 'Thyroid Profile', reportStatus: 'Approved', status: 'Auto Approved', reason: 'All parameters within range', reasonKey: 'Passed', collected: '2026-06-15' },
    { id: 'r4', reportId: 'RPT-104531', accession: '1061', patient: 'Priya Nair', mrn: 'MRN-88267', sex: 'F', age: 37, test: 'Complete Blood Count (CBC)', reportStatus: 'Awaiting Review', status: 'Review Required', reason: 'Hemoglobin delta exceeded 15%', reasonKey: 'Delta Check Failed', collected: '2026-06-15' },
    { id: 'r5', reportId: 'RPT-104539', accession: '1069', patient: 'Noah Williams', mrn: 'MRN-88279', sex: 'M', age: 52, test: 'Metabolic Panel', reportStatus: 'Completed', status: 'Auto Approved', reason: 'All parameters within range', reasonKey: 'Passed', collected: '2026-06-16' },
    { id: 'r6', reportId: 'RPT-104544', accession: '1074', patient: 'Emma Johansson', mrn: 'MRN-88288', sex: 'F', age: 26, test: 'Thyroid Profile', reportStatus: 'Pending Approval', status: 'Review Required', reason: 'TSH beyond linearity limit', reasonKey: 'Linearity Check Failed', collected: '2026-06-16' },
    { id: 'r7', reportId: 'RPT-104550', accession: '1080', patient: 'Kabir Singh', mrn: 'MRN-88301', sex: 'M', age: 45, test: 'Complete Blood Count (CBC)', reportStatus: 'Approved', status: 'Auto Approved', reason: 'All parameters within range', reasonKey: 'Passed', collected: '2026-06-17' },
    { id: 'r8', reportId: 'RPT-104557', accession: '1087', patient: 'Chloe Dubois', mrn: 'MRN-88315', sex: 'F', age: 31, test: 'Metabolic Panel', reportStatus: 'Awaiting Review', status: 'Review Required', reason: 'Critical value flag present', reasonKey: 'Report Exception', collected: '2026-06-17' },
    { id: 'r9', reportId: 'RPT-104563', accession: '1093', patient: 'Ethan Brown', mrn: 'MRN-88322', sex: 'M', age: 58, test: 'Complete Blood Count (CBC)', reportStatus: 'Completed', status: 'Auto Approved', reason: 'All parameters within range', reasonKey: 'Passed', collected: '2026-06-18' },
    { id: 'r10', reportId: 'RPT-104571', accession: '1101', patient: 'Ananya Rao', mrn: 'MRN-88339', sex: 'F', age: 24, test: 'Metabolic Panel', reportStatus: 'Pending Approval', status: 'Review Required', reason: 'Glucose above approved range', reasonKey: 'Out of Range', collected: '2026-06-18' },
    { id: 'r11', reportId: 'RPT-104578', accession: '1108', patient: 'Lucas Meyer', mrn: 'MRN-88347', sex: 'M', age: 39, test: 'Thyroid Profile', reportStatus: 'Approved', status: 'Auto Approved', reason: 'All parameters within range', reasonKey: 'Passed', collected: '2026-06-19' },
    { id: 'r12', reportId: 'RPT-104585', accession: '1115', patient: 'Isabella Rossi', mrn: 'MRN-88358', sex: 'F', age: 33, test: 'Complete Blood Count (CBC)', reportStatus: 'In Progress', status: 'Auto Approved', reason: 'All parameters within range', reasonKey: 'Passed', collected: '2026-06-19' },
  ],
  'toxicology-auto-approval': [
    { id: 't1', reportId: 'TOX-52011', accession: '5201', patient: 'Marcus Lee', mrn: 'MRN-77102', sex: 'M', age: 40, test: 'Drugs of Abuse Panel', reportStatus: 'Completed', status: 'Auto Approved', reason: 'Consistent with prescription record', reasonKey: 'Passed', collected: '2026-06-12' },
    { id: 't2', reportId: 'TOX-52018', accession: '5208', patient: 'Fatima Khan', mrn: 'MRN-77118', sex: 'F', age: 35, test: 'Confirmatory Assays', reportStatus: 'Pending Approval', status: 'Review Required', reason: 'Screening and confirmation results are not concordant for fentanyl', reasonKey: 'Correlation Check Failed', collected: '2026-06-12' },
    { id: 't3', reportId: 'TOX-52025', accession: '5215', patient: 'Daniel Garcia', mrn: 'MRN-77129', sex: 'M', age: 47, test: 'Drugs of Abuse Panel', reportStatus: 'Awaiting Review', status: 'Review Required', reason: 'Substance not on prescription record', reasonKey: 'Prescription Check Failed', collected: '2026-06-13' },
    { id: 't4', reportId: 'TOX-52033', accession: '5223', patient: 'Grace Thompson', mrn: 'MRN-77141', sex: 'F', age: 28, test: 'Confirmatory Assays', reportStatus: 'Approved', status: 'Auto Approved', reason: 'Consistent with prescription record', reasonKey: 'Passed', collected: '2026-06-13' },
    { id: 't5', reportId: 'TOX-52040', accession: '5230', patient: 'Omar Haddad', mrn: 'MRN-77150', sex: 'M', age: 50, test: 'Drugs of Abuse Panel', reportStatus: 'Pending Approval', status: 'Review Required', reason: 'Current THC result inconsistent with historical screening', reasonKey: 'History Check Failed', collected: '2026-06-14' },
    { id: 't6', reportId: 'TOX-52047', accession: '5237', patient: 'Yuki Tanaka', mrn: 'MRN-77164', sex: 'F', age: 30, test: 'Confirmatory Assays', reportStatus: 'Completed', status: 'Auto Approved', reason: 'Consistent with prescription record', reasonKey: 'Passed', collected: '2026-06-14' },
    { id: 't7', reportId: 'TOX-52055', accession: '5245', patient: 'Hannah Cohen', mrn: 'MRN-77175', sex: 'F', age: 43, test: 'Drugs of Abuse Panel', reportStatus: 'Awaiting Review', status: 'Review Required', reason: 'Cocaine metabolite screening/confirmation mismatch', reasonKey: 'Correlation Check Failed', collected: '2026-06-15' },
    { id: 't8', reportId: 'TOX-52062', accession: '5252', patient: 'Diego Fernández', mrn: 'MRN-77188', sex: 'M', age: 36, test: 'Confirmatory Assays', reportStatus: 'Approved', status: 'Auto Approved', reason: 'Consistent with prescription record', reasonKey: 'Passed', collected: '2026-06-15' },
    { id: 't9', reportId: 'TOX-52070', accession: '5260', patient: 'Zara Ali', mrn: 'MRN-77199', sex: 'F', age: 27, test: 'Drugs of Abuse Panel', reportStatus: 'Completed', status: 'Auto Approved', reason: 'Consistent with prescription record', reasonKey: 'Passed', collected: '2026-06-16' },
    { id: 't10', reportId: 'TOX-52078', accession: '5268', patient: 'Ryan Murphy', mrn: 'MRN-77210', sex: 'M', age: 55, test: 'Confirmatory Assays', reportStatus: 'Awaiting Review', status: 'Review Required', reason: 'Detected benzodiazepine not on active prescription', reasonKey: 'Prescription Check Failed', collected: '2026-06-16' },
  ],
}

const pathologyFailureOrder: FailureReasonKey[] = [
  'Out of Range',
  'Delta Check Failed',
  'Linearity Check Failed',
  'Report Exception',
]

const toxicologyFailureOrder: ToxicologyFailureReasonKey[] = [
  'Prescription Check Failed',
  'History Check Failed',
  'Correlation Check Failed',
]

function failureOrderForRule(ruleId: string): FailureReasonKey[] {
  return ruleId === 'toxicology-auto-approval' ? toxicologyFailureOrder : pathologyFailureOrder
}

// Deterministic seed so re-running with identical inputs yields identical numbers.
function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function runSimulation(
  ruleId: string,
  input: SimulationInput,
  domain?: string,
): SimulationResult {
  const pool =
    reportPools[ruleId] ??
    (domain === 'Toxicology'
      ? reportPools['toxicology-auto-approval']
      : reportPools['pathology-auto-approval'])
  const rows = pool
  const failureOrder = failureOrderForRule(
    ruleId.startsWith('custom-') && domain === 'Toxicology'
      ? 'toxicology-auto-approval'
      : ruleId,
  )

  const seed = hashSeed(`${ruleId}|${input.rangeKey}`)
  const volumeFactor = 60 + (seed % 40)
  const totalReports = rows.length * volumeFactor

  const sampleEligible = rows.filter((r) => r.status === 'Auto Approved').length
  const eligibleRatio = sampleEligible / rows.length
  const adjusted = Math.min(0.94, Math.max(0.55, eligibleRatio + ((seed % 11) - 5) / 100))
  const eligible = Math.round(totalReports * adjusted)
  const manualReview = totalReports - eligible

  const sampleFailures = Object.fromEntries(failureOrder.map((k) => [k, 0])) as Record<
    FailureReasonKey,
    number
  >

  rows.forEach((r) => {
    if (r.reasonKey !== 'Passed' && r.reasonKey in sampleFailures) {
      sampleFailures[r.reasonKey as FailureReasonKey] += 1
    }
  })

  const sampleFailTotal = failureOrder.reduce((s, k) => s + sampleFailures[k], 0) || 1

  let allocated = 0
  const failureBreakdown = failureOrder.map((key, idx) => {
    let count: number
    if (idx === failureOrder.length - 1) {
      count = Math.max(0, manualReview - allocated)
    } else {
      count = Math.round((sampleFailures[key] / sampleFailTotal) * manualReview)
      allocated += count
    }
    return { key, count }
  })

  return {
    totalReports,
    eligible,
    manualReview,
    eligibleRate: Math.round(adjusted * 1000) / 10,
    failureBreakdown,
    rows,
  }
}
