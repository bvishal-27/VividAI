import { useState } from 'react'

function ChatInput() {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!message.trim()) return
    console.log('Sending:', message)
    setMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 border-t border-gray-700">
      <div className="flex items-end gap-2 bg-gray-800 rounded-xl p-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message DevMind AI..."
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
        >
          ➤
        </button>
      </div>
      <p className="text-xs text-gray-600 text-center mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}

export default ChatInput