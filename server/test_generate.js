const fetch = global.fetch

const payload = {
  rating: 5,
  selected_feedback: ["helpful_staff", "clean_environment"],
  customer_text: "Great service"
}

async function testGeneration(sessionId, attempt) {
  const start = Date.now()
  try {
    const response = await fetch(`http://localhost:4001/api/review/generate/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const elapsed = Date.now() - start
    const text = await response.text()
    console.log(`Attempt ${attempt}: HTTP ${response.status}, ${elapsed}ms, ${text.length} bytes`)
    if (!response.ok) {
      console.log(`  Error: ${text}`)
    }
    return { status: response.status, elapsed, bytes: text.length, success: response.ok }
  } catch (err) {
    const elapsed = Date.now() - start
    console.log(`Attempt ${attempt}: ERROR after ${elapsed}ms - ${err.message}`)
    return { status: 0, elapsed, bytes: 0, success: false, error: err.message }
  }
}

async function main() {
  const sessionId = '429035b2-0ffb-4074-a580-0d5ed9292a30'
  console.log(`Testing session: ${sessionId}`)
  console.log('='.repeat(50))
  
  const results = []
  for (let i = 1; i <= 5; i++) {
    const result = await testGeneration(sessionId, i)
    results.push(result)
    await new Promise(r => setTimeout(r, 2000)) // Wait 2 seconds between requests
  }
  
  console.log('='.repeat(50))
  console.log('Summary:')
  results.forEach((r, i) => {
    console.log(`  ${i+1}. Status: ${r.status}, Time: ${r.elapsed}ms, Bytes: ${r.bytes}, Success: ${r.success}`)
  })
}

main()