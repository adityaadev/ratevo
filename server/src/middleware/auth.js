import { supabase } from '../config/supabase.js'

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authorization token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabase().auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed' })
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user } } = await supabase().auth.getUser(token)
    if (user) {
      req.user = user
    }
  } catch (err) {
    // Ignore auth errors for optional auth
  }
  
  next()
}