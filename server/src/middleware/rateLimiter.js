import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { message: 'AI generation rate limit exceeded. Please wait before generating more reviews.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown'
  },
})

export const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: 'Rate limit exceeded. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})