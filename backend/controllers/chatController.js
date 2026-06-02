import { streamGeminiResponse } from '../services/geminiService.js'

export async function handleChat(req, res) {
  try {
    const { messages, message, image } = req.body

    const input = messages && Array.isArray(messages) ? messages : message
    if (!input) return res.status(400).json({ error: 'Message required' })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('Access-Control-Allow-Origin', '*')

    await streamGeminiResponse(input, image || null, (chunk) => {
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`)
    })

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error(err)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message })
    }
  }
}