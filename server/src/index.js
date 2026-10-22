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
import billingRoutes from './routes/billing.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 4001

if (!process.env.CLIENT_URL) {
  console.error('FATAL: CLIENT_URL environment variable is required')
  process.exit(1)
}

app.set('trust proxy', 1)

const clientUrls = process.env.CLIENT_URL.split(',').map(s => s.trim()).filter(Boolean)

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...clientUrls, "https://*.supabase.co", "https://generativelanguage.googleapis.com"],
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

function parseAllowedOrigins() {
  const raw = process.env.CLIENT_URL || ''
  const origins = raw.split(',').map(s => s.trim()).filter(Boolean)
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:5174')
  }
  return [...new Set(origins)]
}

const allowedOrigins = parseAllowedOrigins()

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
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
app.use('/api/billing', authMiddleware, billingRoutes)

app.use(errorHandler)

const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash'
console.log(`Using Gemini model: ${modelName}`)

// Validate model exists at startup
async function validateModel(modelName, apiKey) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}`, {
      headers: { 'x-goog-api-key': apiKey }
    })
    if (response.status === 404) {
      console.error(`ERROR: Configured GEMINI_MODEL not found: ${modelName}`)
    }
  } catch (err) {
    console.error(`ERROR: Failed to validate GEMINI_MODEL ${modelName}:`, err.message)
  }
}

if (process.env.GEMINI_API_KEY) {
  validateModel(modelName, process.env.GEMINI_API_KEY)
}

// Handle unhandled rejections and uncaught exceptions to keep server alive
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})

export default app