import { useState } from "react"

function ChatInput({ onSend }) {
  const [message, setMessage] = useState("")

  function handleSend() {
    const trimmed = message.trim()
    if (!trimmed) return
    onSend(trimmed)
    setMessage("")
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-4 py-4 border-t border-gray-700">
      <div className="flex items-end gap-2 bg-gray-800 rounded-2xl px-4 py-2">
        <textarea
          rows={1}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message VividAI..."
          className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder-gray-500 py-1.5 max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="mb-1 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
      <p className="text-center text-xs text-gray-600 mt-2">VividAI can make mistakes.</p>
    </div>
  )
}

export default ChatInput