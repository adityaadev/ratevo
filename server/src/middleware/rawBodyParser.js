import express from 'express'

/**
 * Raw body parser for Cashfree webhook
 * Must be mounted BEFORE global express.json() on the specific webhook route
 * Cashfree requires raw body for HMAC-SHA256 signature verification
 */
export const rawBodyParser = express.raw({
  type: 'application/json',
  limit: '1mb',
})

/**
 * Attach raw body to request for signature verification
 * After this middleware, req.rawBody will contain the raw string body
 * req.body will still be parsed by subsequent json() middleware if needed
 */
export function attachRawBody(req, res, next) {
  if (req.body && typeof req.body === 'object' && Buffer.isBuffer(req.body)) {
    req.rawBody = req.body.toString('utf8')
  }
  next()
}