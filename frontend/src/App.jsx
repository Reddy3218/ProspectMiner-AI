import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewSearch from './pages/NewSearch.jsx'
import Campaigns from './pages/Campaigns.jsx'
import CampaignDetail from './pages/CampaignDetail.jsx'
import LeadsPage from './pages/LeadsPage.jsx'
import LeadDetail from './pages/LeadDetail.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161f30',
            color: '#e8f0fe',
            border: '1px solid #1e2d42',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00e5a0', secondary: '#080c14' } },
          error:   { iconTheme: { primary: '#ff6b6b', secondary: '#080c14' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"        element={<Dashboard />} />
          <Route path="search"           element={<NewSearch />} />
          <Route path="campaigns"        element={<Campaigns />} />
          <Route path="campaigns/:id"    element={<CampaignDetail />} />
          <Route path="leads"            element={<LeadsPage />} />
          <Route path="leads/:id"        element={<LeadDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
