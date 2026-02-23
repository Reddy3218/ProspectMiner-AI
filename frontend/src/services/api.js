import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// Search
export const startSearch    = (data) => API.post('/search', data)
export const getCampaignStatus = (id) => API.get(`/search/${id}/status`)

// Campaigns
export const getCampaigns   = (params) => API.get('/campaigns', { params })
export const getCampaign    = (id)     => API.get(`/campaigns/${id}`)
export const deleteCampaign = (id)     => API.delete(`/campaigns/${id}`)
export const pauseCampaign  = (id)     => API.post(`/campaigns/${id}/pause`)
export const restartCampaign= (id)     => API.post(`/campaigns/${id}/restart`)

// Leads
export const getLeads       = (params) => API.get('/leads', { params })
export const getLead        = (id)     => API.get(`/leads/${id}`)
export const updateLead     = (id, data) => API.put(`/leads/${id}`, data)
export const deleteLead     = (id)     => API.delete(`/leads/${id}`)
export const exportLeadsCSV = (params) => {
  const base = import.meta.env.VITE_API_URL || '/api'
  const query = new URLSearchParams(params).toString()
  window.open(`${base}/leads/export/csv?${query}`, '_blank')
}

// Stats
export const getStats = () => API.get('/stats')

export default API
