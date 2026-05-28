import { useEffect, useRef } from "react"
import ChatInput from "./ChatInput"

function ChatWindow({ messages, onSend }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 flex flex-col h-full">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-xl font-medium text-gray-400">How can I help you today?</p>
              <p className="text-sm mt-2">Ask me anything about coding, or generate images.</p>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.typing ? (
              <TypingLoader />
            ) : (
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-700 text-gray-100 rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} />
    </div>
  )
}

function TypingLoader() {
  return (
    <div className="bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  )
}

export default ChatWindow