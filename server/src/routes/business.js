import express from 'express'
import { supabase } from '../config/supabase.js'
import { createBusinessSchema, updateBusinessSchema } from '../utils/validation.js'
import { generateUniqueSlug } from '../utils/slug.js'
import { buildReviewLink } from '../utils/googleReviewLink.js'
import { BILLING_CONFIG } from '../config/billing.js'

const router = express.Router()

// Initialize trial for a new business (idempotent)
async function initializeTrialForBusiness(businessId, supabaseClient) {
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + BILLING_CONFIG.freeTrialDays)

  const { data: updated, error } = await supabaseClient
    .from('businesses')
    .update({
      trial_ends_at: trialEndsAt.toISOString(),
      trial_used: true,
      subscription_status: 'trial',
      updated_at: new Date().toISOString()
    })
    .eq('id', businessId)
    .select()
    .single()

  if (error) {
    console.error('Failed to initialize trial:', { businessId, error: error.message })
  }
  return updated
}

router.post('/', async (req, res, next) => {
  try {
    const data = createBusinessSchema.parse(req.body)
    const userId = req.user.id
    
    const slug = await generateUniqueSlug(data.name)
    
    let googleReviewUrl = data.google_review_url
    try {
      googleReviewUrl = await buildReviewLink(data.google_review_url)
    } catch (err) {
      return res.status(400).json({ message: err.message })
    }
    
    const { data: business, error } = await supabase()
      .from('businesses')
      .insert({
        owner_id: userId,
        name: data.name,
        category: data.category,
        address: data.address,
        phone: data.phone,
        google_review_url: googleReviewUrl,
        slug,
        subscription_status: 'trial',
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }

    // Initialize 7-day trial (idempotent - only sets if not already set)
    await initializeTrialForBusiness(business.id, supabase)
    
    // Fetch updated business with trial_ends_at
    const { data: updatedBusiness } = await supabase()
      .from('businesses')
      .select('*')
      .eq('id', business.id)
      .single()
    
    res.status(201).json(updatedBusiness || business)
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id
    
    const { data, error } = await supabase()
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    const { data, error } = await supabase()
      .from('businesses')
      .select('*')
      .eq('id', id)
      .eq('owner_id', userId)
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

router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const data = updateBusinessSchema.parse(req.body)
    
    let googleReviewUrl = data.google_review_url
    if (googleReviewUrl !== undefined) {
      try {
        googleReviewUrl = await buildReviewLink(googleReviewUrl)
      } catch (err) {
        return res.status(400).json({ message: err.message })
      }
    }
    
    const updateData = { ...data }
    if (googleReviewUrl !== undefined) {
      updateData.google_review_url = googleReviewUrl
    }
    
    const { data: business, error } = await supabase()
      .from('businesses')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', userId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Business not found' })
      }
      throw error
    }
    
    res.json(business)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/qr', async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    const { data, error } = await supabase()
      .from('businesses')
      .select('slug')
      .eq('id', id)
      .eq('owner_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Business not found' })
      }
      throw error
    }
    
    const baseUrl = process.env.CLIENT_URL
    const qrUrl = `${baseUrl}/r/${data.slug}`
    
    res.json({ url: qrUrl, slug: data.slug })
  } catch (err) {
    next(err)
  }
})

export default router