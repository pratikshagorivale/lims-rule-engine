import type { FailureReasonKey, SimulationReportRow } from '../data/types'

export interface CheckResult {
  id: string
  label: string
  passed: boolean
  description: string
}

function pathologyChecks(report: SimulationReportRow): CheckResult[] {
  const failed = (key: FailureReasonKey) => report.reasonKey === key
  return [
    {
      id: 'list',
      label: 'List Field Check',
      passed: true,
      description: 'List field check passed for all parameters.',
    },
    {
      id: 'range',
      label: 'Auto Approval Range Check',
      passed: !failed('Out of Range'),
      description: failed('Out of Range')
        ? report.reason
        : 'Auto approval range check passed for all parameters.',
    },
    {
      id: 'delta',
      label: 'Delta Check',
      passed: !failed('Delta Check Failed'),
      description: failed('Delta Check Failed')
        ? report.reason
        : 'Delta check passed: results are within the allowed variation.',
    },
    {
      id: 'linearity',
      label: 'Linearity Check',
      passed: !failed('Linearity Check Failed'),
      description: failed('Linearity Check Failed')
        ? report.reason
        : 'Linearity check passed: results are within the validated reporting range.',
    },
    {
      id: 'exception',
      label: 'Exception Check',
      passed: !failed('Report Exception'),
      description: failed('Report Exception')
        ? report.reason
        : 'No report exceptions or critical value flags were found.',
    },
    {
      id: 'doctor',
      label: 'Default Doctor Check',
      passed: true,
      description: 'A default doctor is configured for the department.',
    },
  ]
}

function toxicologyChecks(report: SimulationReportRow): CheckResult[] {
  const failed = (key: FailureReasonKey) => report.reasonKey === key
  return [
    {
      id: 'prescription',
      label: 'Prescription Check',
      passed: !failed('Prescription Check Failed'),
      description: failed('Prescription Check Failed')
        ? report.reason
        : 'Detected drugs are consistent with prescribed drugs.',
    },
    {
      id: 'history',
      label: 'History Check',
      passed: !failed('History Check Failed'),
      description: failed('History Check Failed')
        ? report.reason
        : 'Current screening results are consistent with historical screening results.',
    },
    {
      id: 'correlation',
      label: 'Correlation Check',
      passed: !failed('Correlation Check Failed'),
      description: failed('Correlation Check Failed')
        ? report.reason
        : 'Screening and confirmation results are concordant for all applicable drugs.',
    },
  ]
}

export function buildSimulationChecks(
  report: SimulationReportRow,
  ruleId?: string,
): CheckResult[] {
  if (ruleId === 'toxicology-auto-approval') {
    return toxicologyChecks(report)
  }
  return pathologyChecks(report)
}
