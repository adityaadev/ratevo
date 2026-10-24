import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are a helpful assistant that writes authentic Google reviews based ONLY on customer-provided information.

STRICT RULES:
1. Use ONLY facts explicitly provided by the customer
2. NEVER invent names, treatments, prices, staff names, medical procedures, or specific details
3. NEVER exaggerate or embellish
4. NEVER change negative sentiment to positive
5. NEVER add information the customer didn't provide
6. Write 2-4 sentences in natural customer voice
12. Sound like a real person writing a review
13. Avoid repetitive templates - vary your language
14. Preserve the customer's actual sentiment (positive, neutral, or negative)
15. Do not mention AI, Ratevo, or the review generation process

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

// Fallback chain: primary → backup models (all support generateContent, non-preview)
const MODEL_CHAIN = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
]
const GENERATION_TIMEOUT_MS = 10000
const DEFAULT_MODEL = MODEL_CHAIN[0]
const MAX_GENERATIONS_PER_SESSION = 5
const MAX_OUTPUT_TOKENS = 1024

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

async function tryGenerateWithModel(genAI, modelName, prompt, customerText) {
  const startedAt = Date.now()
  const model = genAI.getGenerativeModel({ model: modelName })
  
  try {
    const result = await withTimeout(
      model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          thinkingConfig: { thinkingBudget: 0 }, // disable thinking tokens
        },
      }),
      GENERATION_TIMEOUT_MS,
      'Gemini generateContent'
    )
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
    
    return { text, modelName, durationMs: Date.now() - startedAt }
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
      rawError: err?.message,
    })
    
    throw { status, providerStatus, message: upstream.message, isRetryable: status === 429 || status === 503 }
  }
}

async function generateWithFallback(genAI, prompt, customerText) {
  let lastError = null
  
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelName = MODEL_CHAIN[i]
    try {
      const result = await tryGenerateWithModel(genAI, modelName, prompt, customerText)
      if (i > 0) {
        console.warn(`Fallback succeeded with ${modelName} (primary ${MODEL_CHAIN[0]} failed)`)
      }
      return result.text
    } catch (err) {
      lastError = err
      if (!err.isRetryable) {
        // Non-retryable error (400, 404, etc.) - don't try other models
        break
      }
      // Retryable error (429, 503) - try next model immediately
      console.warn(`Model ${modelName} returned ${err.status}, trying next model...`)
    }
  }
  
  // All models failed - return user-friendly error based on last error
  const clientError = getClientError(lastError?.status, lastError?.providerStatus, lastError?.message)
  const error = new Error(clientError.message)
  error.status = clientError.status
  error.publicMessage = clientError.message
  throw error
}

export async function generateReview(input) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('AI service not configured')
    error.status = 503
    throw error
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const prompt = `${SYSTEM_PROMPT}\n\n${buildPrompt(input)}`
  
  return generateWithFallback(genAI, prompt, input.customer_text)
}

export { MAX_GENERATIONS_PER_SESSION }