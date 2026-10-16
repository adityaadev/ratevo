import express from 'express'
import { supabase } from '../config/supabase.js'
import { startReviewSchema, generateReviewSchema, trackEventSchema } from '../utils/validation.js'
import { generateReview } from '../services/aiService.js'
import { publicLimiter, aiLimiter } from '../middleware/rateLimiter.js'
import { optionalAuth } from '../middleware/auth.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

function recordReviewEvent(event) {
  Promise.resolve()
    .then(() => supabase().from('review_events').insert(event))
    .then(({ error }) => {
      if (error) {
        console.warn('Failed to record review event:', { code: error.code })
      }
    })
    .catch(error => {
      console.warn('Failed to record review event:', {
        name: error.name,
        code: error.code,
      })
    })
}

router.post('/start/:businessSlug', publicLimiter, async (req, res, next) => {
  try {
    const { businessSlug } = req.params
    const data = startReviewSchema.parse(req.body)
    
    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id, google_review_url')
      .eq('slug', businessSlug)
      .single()
    
    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }
    
    const sessionId = uuidv4()
    
    const { data: session, error } = await supabase()
      .from('review_sessions')
      .insert({
        id: sessionId,
        business_id: business.id,
        rating: data.rating,
        feedback_data: data.selected_feedback || [],
        customer_text: data.customer_text || '',
        generated_review: '',
        generation_count: 0,
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    recordReviewEvent({
        business_id: business.id,
        session_id: sessionId,
        event_type: 'rating_submitted',
        rating: data.rating,
        metadata: { selected_feedback: data.selected_feedback },
      })
    
    res.json({ session_id: sessionId, business_id: business.id })
  } catch (err) {
    next(err)
  }
})

router.post('/generate/:sessionId', aiLimiter, async (req, res, next) => {
  try {
    const { sessionId } = req.params
    const data = generateReviewSchema.parse(req.body)
    
    const { data: session, error: sessionError } = await supabase()
      .from('review_sessions')
      .select('business_id, generation_count')
      .eq('id', sessionId)
      .single()
    
    if (sessionError || !session) {
      return res.status(404).json({ message: 'Session not found' })
    }
    
    const generationCount = session.generation_count || 0
    if (generationCount >= 3) {
      return res.status(429).json({ message: 'Generation limit reached for this session (max 3)' })
    }
    
    const generatedReview = await generateReview(data)
    
    const { error: updateError } = await supabase()
      .from('review_sessions')
      .update({
        rating: data.rating,
        feedback_data: data.selected_feedback || [],
        customer_text: data.customer_text || '',
        generated_review: generatedReview,
        generation_count: generationCount + 1,
      })
      .eq('id', sessionId)
    
    if (updateError) {
      throw updateError
    }
    
    recordReviewEvent({
        business_id: session.business_id,
        session_id: sessionId,
        event_type: 'review_generated',
        rating: data.rating,
        metadata: { 
          selected_feedback: data.selected_feedback,
          customer_text: data.customer_text,
        },
      })
    
    res.json({ generated_review: generatedReview })
  } catch (err) {
    next(err)
  }
})

router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params
    
    const { data, error } = await supabase()
      .from('review_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Session not found' })
      }
      throw error
    }
    
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/public/business/:businessSlug', async (req, res, next) => {
  try {
    const { businessSlug } = req.params
    
    const { data, error } = await supabase()
      .from('businesses')
      .select('id, name, category, address, google_review_url, slug')
      .eq('slug', businessSlug)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Business not found' })
      }
      throw error
    }
    
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.post('/events', publicLimiter, async (req, res, next) => {
  try {
    const data = trackEventSchema.parse(req.body)
    
    const { error } = await supabase()
      .from('review_events')
      .insert({
        business_id: data.business_id || null,
        session_id: data.session_id || null,
        event_type: data.event_type,
        rating: data.rating,
        metadata: data.metadata || {},
      })
    
    if (error) {
      throw error
    }
    
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router