import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are a helpful assistant that writes authentic Google reviews based ONLY on customer-provided information.

STRICT RULES:
1. Use ONLY facts explicitly provided by the customer
2. NEVER invent names, treatments, prices, staff names, medical procedures, or specific details
3. NEVER exaggerate or embellish
4. NEVER change negative sentiment to positive
5. NEVER add information the customer didn't provide
6. Write 2-4 sentences in natural customer voice
7. Sound like a real person writing a review
8. Avoid repetitive templates - vary your language
9. Preserve the customer's actual sentiment (positive, neutral, or negative)
10. Do not mention AI, Ratevo, or the review generation process

EXAMPLES:

Input: Rating 5, Selected: helpful_staff, clean_environment, good_service, Text: "Doctor explained everything properly"
Output: "Had a really good experience here. The staff was helpful and the environment was clean. The doctor also explained everything properly."

Input: Rating 2, Selected: long_wait, Text: "Had to wait too long"
Output: "The overall experience was okay, but the waiting time was quite long. Hopefully the process can be made faster."

Input: Rating 4, Selected: friendly_staff, good_service, Text: ""
Output: "The staff was friendly and the service was good. Would recommend."

Input: Rating 3, Selected: expensive, Text: "Pricey for what you get"
Output: "Service was decent but felt expensive for what you get. Might not return for that reason."

Generate a natural review based on the customer input below:`

function buildPrompt(input) {
  const { rating, selected_feedback, customer_text } = input
  
  const feedbackLabels = {
    helpful_staff: 'Helpful staff',
    good_service: 'Good service',
    clean_environment: 'Clean environment',
    friendly_staff: 'Friendly staff',
    fast_service: 'Fast service',
    clear_communication: 'Clear communication',
    good_experience: 'Good experience',
    long_wait: 'Long waiting time',
    poor_communication: 'Poor communication',
    unclean: 'Unclean',
    rude_staff: 'Rude staff',
    expensive: 'Too expensive',
  }

  const selectedLabels = (selected_feedback || []).map(id => feedbackLabels[id] || id).join(', ')
  
  let prompt = `Rating: ${rating}/5 stars\n`
  if (selectedLabels) {
    prompt += `Selected feedback: ${selectedLabels}\n`
  }
  if (customer_text?.trim()) {
    prompt += `Customer's own words: "${customer_text.trim()}"\n`
  }
  
  return prompt
}

function extractRetryDelay(err) {
  const match = err.message?.match(/retryDelay["\s:]+(\d+)/i)
  return match ? parseInt(match[1], 10) : undefined
}

const GENERATION_TIMEOUT_MS = 15000
const DEFAULT_MODEL = 'gemini-3.8-flash'

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ])
}

function extractUpstreamError(err, prompt, customerText) {
  const rawMessage = String(err?.message || 'Unknown Gemini error')
  const httpMatch = rawMessage.match(/\[(\d{3})\s+[^\]]+\]\s*/)
  const httpStatus = Number(err?.status || err?.response?.status || httpMatch?.[1]) || null
  const providerMessage = httpMatch
    ? rawMessage.slice(httpMatch.index + httpMatch[0].length)
    : rawMessage.replace(/^\[GoogleGenerativeAI Error\]:\s*/, '')
  const providerStatus = providerMessage.match(/["']status["']\s*:\s*["']([^"']+)["']/i)?.[1] || null
  const message = [
    process.env.GEMINI_API_KEY,
    prompt,
    customerText,
  ].filter(value => typeof value === 'string' && value.length > 0)
    .reduce((value, secret) => value.replaceAll(secret, '[REDACTED]'), providerMessage)
    .replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/\bAIza[A-Za-z0-9_-]{20,}\b/g, '[REDACTED]')

  return { httpStatus, providerStatus, message }
}

function getClientError(status, providerStatus, message) {
  if (status === 429 || providerStatus === 'RESOURCE_EXHAUSTED' || /\b(quota|rate limit|resource exhausted)\b/i.test(message)) {
    return { status: 429, message: 'Review generation is temporarily limited. Please wait a moment and try again.' }
  }

  if (status === 503 || providerStatus === 'UNAVAILABLE' || /\b(overloaded|high demand|temporarily unavailable|busy|try again later)\b/i.test(message)) {
    return { status: 503, message: 'Review generation is temporarily unavailable. Please try again shortly.' }
  }

  return { status: 502, message: "We couldn't generate your review just now. Please try again." }
}

async function generateWithRetry(model, modelName, prompt, customerText, attempt = 1) {
  const startedAt = Date.now()
  try {
    const result = await withTimeout(model.generateContent(prompt), GENERATION_TIMEOUT_MS, 'Gemini generateContent')
    const response = await withTimeout(result.response, GENERATION_TIMEOUT_MS, 'Gemini response')
    const text = response.text().trim()
    
    if (!text) {
      throw new Error('Empty response from AI')
    }

    console.info('Gemini generation completed:', {
      model: modelName,
      httpStatus: 200,
      durationMs: Date.now() - startedAt,
      usage: response.usageMetadata || null,
    })
    
    return text
  } catch (err) {
    const upstream = extractUpstreamError(err, prompt, customerText)
    const isTimeout = err.message?.includes('timed out')
    const status = isTimeout ? 503 : upstream.httpStatus
    const providerStatus = upstream.providerStatus

    console.error('Gemini generation failed:', {
      model: modelName,
      httpStatus: status,
      errorStatus: providerStatus || status || 'UNKNOWN',
      message: upstream.message,
      durationMs: Date.now() - startedAt,
    })
    
    if ((status === 429 || status === 503) && attempt === 1) {
      const delay = extractRetryDelay(err) || 2000
      console.warn(`Gemini ${status}, retrying in ${delay}ms...`)
      await new Promise(r => setTimeout(r, delay))
      return generateWithRetry(model, modelName, prompt, customerText, 2)
    }
    
    const clientError = getClientError(status, providerStatus, upstream.message)
    const error = new Error(clientError.message)
    error.status = clientError.status
    error.publicMessage = clientError.message
    throw error
  }
}

export async function generateReview(input) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('AI service not configured')
    error.status = 503
    throw error
  }

  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: modelName })
  
  const prompt = `${SYSTEM_PROMPT}\n\n${buildPrompt(input)}`
  
  return generateWithRetry(model, modelName, prompt, input.customer_text)
}