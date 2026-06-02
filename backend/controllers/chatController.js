import { streamGeminiResponse } from '../services/geminiService.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse').default

export async function handleChat(req, res) {
  try {
    const { messages, message, image, pdfData } = req.body
    const input = messages && Array.isArray(messages) ? messages : [{ role: 'user', content: message }]
    if (!input || input.length === 0) return res.status(400).json({ error: 'Message required' })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('Access-Control-Allow-Origin', '*')

    let pdfText = null
    let pdfBase64 = null

    if (pdfData && pdfData.base64) {
      try {
        const buffer = Buffer.from(pdfData.base64, 'base64')
        const parsed = await pdfParse(buffer)
        const extracted = parsed.text?.trim()
        if (extracted && extracted.length > 100) {
          pdfText = extracted.slice(0, 15000)
        } else {
          pdfBase64 = pdfData.base64
        }
      } catch {
        pdfBase64 = pdfData.base64
      }
    }

    await streamGeminiResponse({ messages: input, image: image || null, pdfBase64, pdfText }, (chunk) => {
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`)
    })

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Chat error:', err)
    if (!res.headersSent) res.status(500).json({ error: err.message })
  }
}