import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is required')
}

async function getValidToken() {
  // 1. Try Supabase client (handles auto-refresh)
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) return session.access_token

  // 2. Fallback to localStorage (set by onAuthStateChange)
  const stored = localStorage.getItem('ratevo_token')
  if (stored) return stored

  return null
}

async function request(endpoint, options = {}, isRetry = false) {
  const url = `${API_URL}${endpoint}`
  const token = await getValidToken()
  
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
  
  // On 401, try to refresh session and retry once
  if (response.status === 401 && !isRetry) {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (!error && session?.access_token) {
        // Retry with fresh token
        return request(endpoint, options, true)
      }
    } catch {
      // Refresh failed, fall through to throw
    }
  }
  
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

export const billingApi = {
  getStatus: (businessId, orderId) => {
    const params = new URLSearchParams({ business_id: businessId })
    if (orderId) params.append('order_id', orderId)
    return api.get(`/api/billing/status?${params.toString()}`)
  },
  createOrder: (businessId, planId) => api.post('/api/billing/orders', { business_id: businessId, plan_id: planId }),
  verifyOrder: (orderId, businessId) => api.get(`/api/billing/verify?order_id=${orderId}&business_id=${businessId}`),
  getPayments: (businessId) => api.get(`/api/billing/payments?business_id=${businessId}`),
  getSubscriptions: (businessId) => api.get(`/api/billing/subscriptions?business_id=${businessId}`),
  initializeTrial: (businessId) => api.post('/api/billing/initialize-trial', { business_id: businessId }),
}