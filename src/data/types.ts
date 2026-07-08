export type RuleStatus = 'Active' | 'Inactive'

export interface RuleCriterion {
  id: string
  label: string
  description: string
  enabled: boolean
  locked?: boolean // Always-on criteria cannot be toggled
}

export interface MappedTest {
  id: string
  name: string
  department: string
  autoApprovalRange: boolean
  deltaCheck: boolean
  linearityCheck: boolean
}

export interface RuleDefinition {
  id: string
  name: string
  domain: string
  description: string
  status: RuleStatus
  criteria: RuleCriterion[]
  mappedTests: MappedTest[]
  /** Override the default "Rule Logic" section heading */
  ruleLogicHeading?: string
  /** Override the default rule logic subtitle */
  ruleLogicSubheading?: string
  /** When true, criteria are shown as read-only cards without toggles */
  criteriaReadOnly?: boolean
}

export interface TestParameter {
  id: string
  name: string
  unit: string
  type: 'Numeric' | 'Ratio' | 'Titre' | 'Text' | 'List Field'
  autoMin: number | null
  autoMax: number | null
  deltaPercent: number | null
  deltaAllowed: boolean
  linearityEnabled: boolean
  autoApprovalRangeEnabled: boolean
}

export interface ConfigurableTest {
  id: string
  name: string
  department: string
  specimen: string
  parameters: TestParameter[]
}

export type ApprovalOutcome = 'Auto Approved' | 'Review Required'

export type PathologyFailureReasonKey =
  | 'Out of Range'
  | 'Delta Check Failed'
  | 'Linearity Check Failed'
  | 'Report Exception'

export type ToxicologyFailureReasonKey =
  | 'Prescription Check Failed'
  | 'History Check Failed'
  | 'Correlation Check Failed'

export type FailureReasonKey = PathologyFailureReasonKey | ToxicologyFailureReasonKey

export type ReportStatus =
  | 'Approved'
  | 'Completed'
  | 'Pending Approval'
  | 'Awaiting Review'
  | 'In Progress'

export interface SimulationReportRow {
  id: string
  reportId: string
  accession: string
  patient: string
  mrn: string
  sex: 'M' | 'F'
  age: number
  test: string
  reportStatus: ReportStatus
  status: ApprovalOutcome
  reason: string
  reasonKey: FailureReasonKey | 'Passed'
  collected: string
}

export interface SimulationResult {
  totalReports: number
  eligible: number
  manualReview: number
  eligibleRate: number
  failureBreakdown: { key: FailureReasonKey; count: number }[]
  rows: SimulationReportRow[]
}

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'

export interface SimulationInput {
  rangeKey: DateRangePreset
  rangeLabel: string
  fromDate: string
  toDate: string
}
