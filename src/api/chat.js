const BACKEND_URL = 'http://localhost:5002/api/chat'

export async function streamMessage(messages, onToken, onDone, onError) {
  try {
    const lastMessage = messages[messages.length - 1].content

    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: lastMessage })
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      if (text) onToken(text)
    }

    onDone()
  } catch (err) {
    onError(err.message || 'Something went wrong.')
  }
}