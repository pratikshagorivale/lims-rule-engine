import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RuleEnginePage } from './pages/RuleEnginePage'
import { RuleDetailsPage } from './pages/RuleDetailsPage'
import { AutoApprovalConfigPage } from './pages/AutoApprovalConfigPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RuleEnginePage />} />
        <Route path="/rules/:ruleId" element={<RuleDetailsPage />} />
        <Route path="/rules/:ruleId/configure" element={<AutoApprovalConfigPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
