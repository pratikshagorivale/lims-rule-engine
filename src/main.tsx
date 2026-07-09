import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { RulesProvider } from './context/RulesContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RulesProvider>
        <App />
      </RulesProvider>
    </BrowserRouter>
  </StrictMode>,
)
