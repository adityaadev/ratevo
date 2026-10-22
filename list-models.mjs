import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set')
    return
  }
  
  const genAI = new GoogleGenerativeAI(apiKey)
  
  try {
    const models = await genAI.listModels()
    console.log('Available models:')
    for (const model of models.models) {
      console.log(`  - ${model.name}: ${model.displayName} (${model.description})`)
      console.log(`    Supported methods: ${model.supportedGenerationMethods.join(', ')}`)
      console.log(`    Input token limit: ${model.inputTokenLimit}`)
      console.log(`    Output token limit: ${model.outputTokenLimit}`)
      console.log('')
    }
  } catch (err) {
    console.error('Error listing models:', err.message)
    console.error(err.stack)
  }
}

listModels()