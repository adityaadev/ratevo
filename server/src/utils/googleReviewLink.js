const ALLOWED_HOSTNAMES = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'google.com',
  'www.google.com',
  'maps.google.com',
])

const WRITEREVIEW_HOSTNAMES = new Set([
  'search.google.com',
  'g.page',
])

function isAllowedHostname(url) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && ALLOWED_HOSTNAMES.has(parsed.hostname)
  } catch {
    return false
  }
}

function isAlreadyReviewLink(url) {
  try {
    const parsed = new URL(url)
    return WRITEREVIEW_HOSTNAMES.has(parsed.hostname) && 
           (parsed.pathname.includes('/writereview') || parsed.pathname.includes('/review'))
  } catch {
    return false
  }
}

async function resolveRedirects(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    })
    return response.url
  } finally {
    clearTimeout(timeout)
  }
}

function extractPlaceIdComponents(finalUrl) {
  const decoded = decodeURIComponent(finalUrl)
  
  const pattern1 = /!1s0x([0-9a-fA-F]+):0x([0-9a-fA-F]+)/
  const match1 = decoded.match(pattern1)
  if (match1) {
    return { hex1: match1[1], hex2: match1[2] }
  }
  
  const pattern2 = /ftid=0x([0-9a-fA-F]+):0x([0-9a-fA-F]+)/
  const match2 = decoded.match(pattern2)
  if (match2) {
    return { hex1: match2[1], hex2: match2[2] }
  }
  
  return null
}

function buildPlaceId(hex1, hex2) {
  const buffer = Buffer.alloc(20)
  buffer[0] = 0x0a
  buffer[1] = 0x12
  buffer[2] = 0x09
  
  let hex1Value = BigInt('0x' + hex1)
  for (let i = 0; i < 8; i++) {
    buffer[3 + i] = Number(hex1Value & 0xffn)
    hex1Value >>= 8n
  }
  
  buffer[11] = 0x11
  
  let hex2Value = BigInt('0x' + hex2)
  for (let i = 0; i < 8; i++) {
    buffer[12 + i] = Number(hex2Value & 0xffn)
    hex2Value >>= 8n
  }
  
  return buffer.toString('base64url').replace(/=+$/, '')
}

export async function buildReviewLink(mapsUrl) {
  if (!mapsUrl || typeof mapsUrl !== 'string') {
    throw new Error('URL is required')
  }
  
  const trimmed = mapsUrl.trim()
  
  if (isAlreadyReviewLink(trimmed)) {
    return trimmed
  }
  
  if (!isAllowedHostname(trimmed)) {
    throw new Error(
      'Invalid Google Maps URL. Please use a link from Google Maps (maps.app.goo.gl, goo.gl, google.com, maps.google.com). ' +
      'Or paste the "Ask for reviews" link from Google Business Profile (g.page/.../review).'
    )
  }
  
  let finalUrl = trimmed
  if (trimmed.startsWith('https://maps.app.goo.gl/') || trimmed.startsWith('https://goo.gl/')) {
    try {
      finalUrl = await resolveRedirects(trimmed)
      if (!isAllowedHostname(finalUrl)) {
        throw new Error('Redirected URL is not a valid Google Maps link')
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out while resolving the short link')
      }
      throw new Error('Failed to resolve the short link. Please use the full Google Maps URL instead.')
    }
  }
  
  const components = extractPlaceIdComponents(finalUrl)
  if (!components) {
    throw new Error(
      'Could not extract place ID from the Google Maps link. ' +
      'Please make sure the link points to a specific place. ' +
      'Alternatively, paste the "Ask for reviews" link from Google Business Profile (g.page/.../review).'
    )
  }
  
  const placeId = buildPlaceId(components.hex1, components.hex2)
  return `https://search.google.com/local/writereview?placeid=${placeId}`
}

export { isAlreadyReviewLink, isAllowedHostname }