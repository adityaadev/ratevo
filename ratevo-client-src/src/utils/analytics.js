import { reviewApi } from '../services/api'

export function trackEvent(eventType, metadata = {}) {
  if (typeof window === 'undefined') return
  
  const event = {
    event_type: eventType,
    metadata,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  }
  
  try {
    const existing = JSON.parse(localStorage.getItem('ratevo_events') || '[]')
    existing.push(event)
    if (existing.length > 100) existing.shift()
    localStorage.setItem('ratevo_events', JSON.stringify(existing))
  } catch (e) {
    console.warn('Failed to track event locally:', e)
  }
  
  // Also send to server for real analytics
  try {
    // Get business_id from URL if available
    const pathParts = window.location.pathname.split('/')
    const businessSlug = pathParts[2] // /r/:businessSlug
    
    // For server tracking, we need business_id, so we'll use the session from URL params
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session')
    
    // Build payload - only include UUID fields when they have valid values
    // trackEventSchema: business_id (uuid, nullable, optional), session_id (uuid, optional - NOT nullable)
    const payload = {
      event_type: eventType,
      rating: metadata.rating,
      metadata,
    }
    const effectiveSessionId = sessionId || metadata.session_id || metadata.sessionId
    if (metadata.business_id && effectiveSessionId) {
      payload.business_id = metadata.business_id
      payload.session_id = effectiveSessionId
      reviewApi.trackEvent(payload).catch(err => console.warn('Failed to track event on server:', err))
    }
  } catch (e) {
    console.warn('Failed to send event to server:', e)
  }
  
  if (window.gtag) {
    window.gtag('event', eventType, metadata)
  }
}