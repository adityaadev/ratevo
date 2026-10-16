import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

router.get('/:businessId', async (req, res, next) => {
  try {
    const userId = req.user.id
    const { businessId } = req.params
    
    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_id', userId)
      .single()
    
    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }
    
    const { data: events, error: eventsError } = await supabase()
      .from('review_events')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
    
    if (eventsError) {
      throw eventsError
    }
    
    const stats = {
      totalScans: events.filter(e => e.event_type === 'qr_scan').length,
      totalRatings: events.filter(e => e.event_type === 'rating_submitted').length,
      totalGenerated: events.filter(e => e.event_type === 'review_generated').length,
      totalClicks: events.filter(e => e.event_type === 'google_review_clicked').length,
      avgRating: 0,
    }
    
    const ratingEvents = events.filter(e => e.event_type === 'rating_submitted' && e.rating)
    if (ratingEvents.length > 0) {
      const sum = ratingEvents.reduce((acc, e) => acc + e.rating, 0)
      stats.avgRating = sum / ratingEvents.length
    }
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingEvents.forEach(e => {
      if (e.rating >= 1 && e.rating <= 5) {
        ratingDistribution[e.rating]++
      }
    })
    
    const recentActivity = events.slice(0, 50).map(e => ({
      event_type: e.event_type,
      rating: e.rating,
      created_at: e.created_at,
    }))
    
    res.json({
      stats,
      ratingDistribution,
      recentActivity,
    })
  } catch (err) {
    next(err)
  }
})

export default router