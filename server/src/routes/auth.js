import express from 'express'
import { supabase } from '../config/supabase.js'
import { signupSchema, loginSchema } from '../utils/validation.js'

const router = express.Router()

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password } = signupSchema.parse(req.body)
    
    const { data, error } = await supabase().auth.signUp({ email, password })
    
    if (error) {
      return res.status(400).json({ message: error.message })
    }
    
    if (data.user && !data.session) {
      return res.status(201).json({ 
        message: 'Account created. Please check your email to confirm.',
        user: data.user 
      })
    }
    
    res.status(201).json({ 
      message: 'Account created successfully',
      user: data.user,
      session: data.session
    })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    
    const { data, error } = await supabase().auth.signInWithPassword({ email, password })
    
    if (error) {
      return res.status(401).json({ message: error.message })
    }
    
    res.json({
      user: data.user,
      session: data.session,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    await supabase().auth.signOut()
    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
})

router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase().auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

export default router