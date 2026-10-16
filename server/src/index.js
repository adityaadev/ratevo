import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import authRoutes from './routes/auth.js'
import businessRoutes from './routes/business.js'
import reviewRoutes from './routes/review.js'
import analyticsRoutes from './routes/analytics.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 4001

if (!process.env.CLIENT_URL) {
  console.error('FATAL: CLIENT_URL environment variable is required')
  process.exit(1)
}

app.set('trust proxy', 1)

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CLIENT_URL],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
    },
  },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginEmbedderPolicy: false,
}))
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/business', authMiddleware, businessRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/analytics', authMiddleware, analyticsRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app