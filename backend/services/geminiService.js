import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPT = `You are VividAI, a helpful assistant. Follow these rules strictly every single response:

FORMATTING RULES:
1. Always wrap ALL code (even single lines) in fenced code blocks with the language name.
2. Use numbered lists (1. 2. 3.) for steps or ordered content.
3. Use bullet lists (- item) for unordered content.
4. Use **bold** for important terms or section labels.
5. Use plain text for explanations — no raw HTML, no extra symbols.
6. Never write code outside of a fenced code block. Not even one line.
7. Be concise. Answer only what is asked. No filler phrases like "Certainly!" or "Sure!".`

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_PROMPT
})

export async function streamGeminiResponse(message, onChunk) {
  const result = await model.generateContentStream(message)
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) onChunk(text)
  }
}