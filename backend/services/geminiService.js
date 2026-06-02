import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPT = `You are VividAI, a helpful assistant with advanced vision capabilities. Follow these rules strictly:

FORMATTING RULES:
1. Always wrap ALL code in fenced code blocks with the language name.
2. Use numbered lists (1. 2. 3.) for steps or ordered content.
3. Use bullet lists (- item) for unordered content.
4. Use **bold** for important terms or section labels.
5. Use plain text for explanations — no raw HTML, no extra symbols.
6. Never write code outside of a fenced code block.
7. Be concise. No filler phrases like "Certainly!" or "Sure!".

IMAGE CAPABILITIES — when an image is provided, you can:
- Describe what you see in full detail
- Read and extract any text, numbers, or characters visible
- Identify objects, animals, plants, people, places, landmarks
- Analyze charts, graphs, diagrams, and explain the data
- Review code screenshots and find bugs or explain the code
- Read handwritten notes and transcribe them
- Identify UI/UX designs and suggest improvements
- Analyze food and estimate calories or ingredients
- Identify brands, logos, or products
- Describe colors, styles, and aesthetics
- Read receipts, invoices, or documents and extract info
- Solve math problems from photos
- Identify errors in screenshots
- Compare and contrast if multiple images described
- Provide detailed analysis for medical, scientific, or technical images
- Identify languages in text images and translate them
- Analyze memes, infographics, or social media posts
- Review architectural or engineering drawings
- Identify plants, flowers, trees, or animals by species
- Read barcodes or QR code content descriptions
- Analyze satellite or map images

Always be thorough when analyzing images. If asked vaguely, provide a complete analysis covering all visible elements.
Today's date is ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_PROMPT
})

export async function streamGeminiResponse(input, image, onChunk) {
  let history = []
  let lastMessage = ''

  if (Array.isArray(input)) {
    const all = input.filter(m => m.content)
    history = all.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
    lastMessage = all[all.length - 1]?.content || ''
  } else {
    lastMessage = input
  }

  const chat = model.startChat({ history })

  // If image attached — send as multimodal content
  if (image && image.base64 && image.mimeType) {
    const result = await chat.sendMessageStream([
      {
        inlineData: {
          mimeType: image.mimeType,
          data: image.base64,
        }
      },
      { text: lastMessage || "Please analyze this image in detail. Describe everything you see including objects, text, colors, context, and any other relevant information." }
    ])

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) onChunk(text)
    }
  } else {
    // Normal text message
    const result = await chat.sendMessageStream(lastMessage)
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) onChunk(text)
    }
  }
}