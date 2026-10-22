import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

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

async function testModel(modelName) {
  console.log(`\n=== Testing model: ${modelName} ===`)
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: modelName })
    
    const input = { rating: 5, selected_feedback: ['helpful_staff', 'clean_environment'], customer_text: 'Great service' }
    const prompt = `${SYSTEM_PROMPT}\n\n${buildPrompt(input)}`
    
    console.log('Sending request...')
    const start = Date.now()
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    const elapsed = Date.now() - start
    
    console.log(`Success! (${elapsed}ms)`)
    console.log('Response:', text)
    return { success: true, model: modelName, elapsed, text }
  } catch (err) {
    console.log('Error:', err.message)
    console.log('Status:', err.status)
    console.log('Code:', err.code)
    return { success: false, model: modelName, error: err.message, status: err.status, code: err.code }
  }
}

async function main() {
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET')
  
  // Test correct current model
  await testModel('gemini-3.8-flash')
  
  // Test other current flash models
  // await testModel('gemini-2.5-flash') // Uncomment to test
  // await testModel('gemini-3.5-flash') // Uncomment to test
}

main()