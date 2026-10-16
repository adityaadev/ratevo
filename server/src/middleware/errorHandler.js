function sanitizeDiagnostic(value, req) {
  let diagnostic = String(value ?? '')
  const sensitiveValues = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.GEMINI_API_KEY,
    req.headers.authorization,
    req.headers.cookie,
    req.body?.customer_text,
  ].filter(value => typeof value === 'string' && value.length > 0)

  for (const sensitiveValue of sensitiveValues) {
    diagnostic = diagnostic.replaceAll(sensitiveValue, '[REDACTED]')
  }

  return diagnostic
    .replace(/\bBearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED]')
    .replace(/\bAIza[A-Za-z0-9_-]{20,}\b/g, '[REDACTED]')
    .replace(/((?:api[_-]?key|token|secret|password|authorization)=)[^&\s]+/gi, '$1[REDACTED]')
}

export function errorHandler(err, req, res, next) {
  console.error('Request failed:', {
    method: req.method,
    path: req.path,
    code: err.code,
    message: sanitizeDiagnostic(err.message, req),
    stack: sanitizeDiagnostic(err.stack || '(no stack supplied by error source)', req),
  })

  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  if (err.name === 'UnauthorizedError' || err.message?.includes('JWT')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
    return res.status(409).json({ message: 'Resource already exists' })
  }

  if (err.message?.includes('foreign key')) {
    return res.status(400).json({ message: 'Referenced resource not found' })
  }

  const status = err.status || 500
  const message = status >= 500 ? (err.publicMessage || 'Internal server error') : err.message

  res.status(status).json({ message })
}