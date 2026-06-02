import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPT = `You are VividAI, a helpful assistant with vision and document analysis capabilities.

FORMATTING RULES:
1. Always wrap ALL code in fenced code blocks with the language name.
2. Use numbered lists (1. 2. 3.) for steps or ordered content.
3. Use bullet lists (- item) for unordered content.
4. Use **bold** for important terms.
5. No raw HTML. Be concise. No filler phrases.
6. Never write code outside a fenced code block.

Today's date is ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_PROMPT
})

export async function streamGeminiResponse({ messages, image, pdfBase64, pdfText }, onChunk) {
  // Build history from all messages except last
  const all = (messages || []).filter(m => m.content)
  const history = all.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }))
  const lastMessage = all[all.length - 1]?.content || ''

  const chat = model.startChat({ history })

  // Scanned PDF → send as document to Gemini
  if (pdfBase64) {
    const result = await chat.sendMessageStream([
      { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
      { text: lastMessage || 'Read this document and describe all its content in detail.' }
    ])
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) onChunk(text)
    }
    return
  }

  // Text PDF → inject as context
  if (pdfText) {
    const result = await chat.sendMessageStream(
      `Document content:\n---\n${pdfText}\n---\n\n${lastMessage}`
    )
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) onChunk(text)
    }
    return
  }

  // Image → multimodal
  if (image && image.base64 && image.mimeType) {
    const result = await chat.sendMessageStream([
      { inlineData: { mimeType: image.mimeType, data: image.base64 } },
      { text: lastMessage || 'Analyze this image in detail.' }
    ])
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) onChunk(text)
    }
    return
  }

  // Normal text
  const result = await chat.sendMessageStream(lastMessage)
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) onChunk(text)
  }
}