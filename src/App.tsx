import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Opportunities } from './pages/Opportunities'
import { OpportunityDetails } from './pages/OpportunityDetails'
import { Contacts } from './pages/Contacts'
import { Outreach } from './pages/Outreach'
import { Analytics } from './pages/Analytics'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="opportunities/:id" element={<OpportunityDetails />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="outreach" element={<Outreach />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
