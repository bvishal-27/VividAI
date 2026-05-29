import { streamGeminiResponse } from '../services/geminiService.js'

export async function handleChat(req, res) {
  try {
    const { message } = req.body
    if (!message) return res.status(400).json({ error: 'Message required' })

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('Access-Control-Allow-Origin', '*')

    await streamGeminiResponse(message, (chunk) => {
      res.write(chunk)
    })

    res.end()
  } catch (err) {
    console.error(err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Something went wrong' })
    }
  }
}