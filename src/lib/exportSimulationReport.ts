import * as XLSX from 'xlsx'
import type { SimulationReportRow, SimulationResult } from '../data/types'
import { buildSimulationChecks } from './simulationChecks'

interface ExportOptions {
  result: SimulationResult
  rangeLabel: string
  ruleName: string
  ruleId: string
}

export function exportSimulationReport({ result, rangeLabel, ruleName, ruleId }: ExportOptions) {
  const summaryRows = [
    ['Simulation Export'],
    ['Rule', ruleName],
    ['Date Range', rangeLabel],
    ['Generated', new Date().toLocaleString()],
    [],
    ['Total Reports', result.totalReports],
    ['Eligible for Auto Approval', result.eligible],
    ['Requires Manual Review', result.manualReview],
    ['Eligible Rate', `${result.eligibleRate}%`],
    [],
    ['Manual Review Reasons'],
    ['Reason', 'Count'],
    ...result.failureBreakdown.map((f) => [f.key, f.count]),
  ]

  const checks = result.rows[0] ? buildSimulationChecks(result.rows[0], ruleId) : []
  const checkLabels = checks.map((c) => c.label)

  const reportHeader = [
    'Patient Name',
    'MRN',
    'Sex',
    'Age',
    'Test',
    'Accession Number',
    'Report Status',
    'Auto Approval Status',
    'Collected Date',
    ...checkLabels.flatMap((label) => [`${label} — Result`, `${label} — Details`]),
  ]

  const reportRows = result.rows.map((row) => rowToExportRow(row, checkLabels, ruleId))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary')
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([reportHeader, ...reportRows]),
    'Report Breakdown',
  )

  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `simulation-report-${stamp}.xlsx`)
}

function rowToExportRow(
  row: SimulationReportRow,
  checkLabels: string[],
  ruleId: string,
): (string | number)[] {
  const checks = buildSimulationChecks(row, ruleId)
  const checkByLabel = new Map(checks.map((c) => [c.label, c]))

  return [
    row.patient,
    row.mrn,
    row.sex,
    row.age,
    row.test,
    row.accession,
    row.reportStatus,
    row.status,
    row.collected,
    ...checkLabels.flatMap((label) => {
      const check = checkByLabel.get(label)
      return [check?.passed ? 'Passed' : 'Failed', check?.description ?? '']
    }),
  ]
}
