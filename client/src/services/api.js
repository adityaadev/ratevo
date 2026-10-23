import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is required')
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  // Get fresh token from Supabase client (handles auto-refresh)
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    const requestError = new Error(error.message || `HTTP ${response.status}`)
    requestError.status = response.status
    throw requestError
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}

export const authApi = {
  signup: (email, password) => api.post('/api/auth/signup', { email, password }),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout', {}),
  me: () => api.get('/api/auth/me'),
}

export const businessApi = {
  create: (data) => api.post('/api/business', data),
  getAll: () => api.get('/api/business'),
  get: (id) => api.get(`/api/business/${id}`),
  update: (id, data) => api.put(`/api/business/${id}`, data),
  getPublic: (slug) => api.get(`/api/review/public/business/${slug}`),
  getQrCode: (id) => api.get(`/api/business/${id}/qr`),
}

export const reviewApi = {
  start: (businessSlug, data) => api.post(`/api/review/start/${businessSlug}`, data),
  generate: (sessionId, data) => api.post(`/api/review/generate/${sessionId}`, data),
  trackEvent: (data) => api.post('/api/review/events', data),
  getSession: (sessionId) => api.get(`/api/review/session/${sessionId}`),
}

export const analyticsApi = {
  get: (businessId) => api.get(`/api/analytics/${businessId}`),
}