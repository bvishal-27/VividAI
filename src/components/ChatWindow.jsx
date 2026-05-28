import ChatInput from './ChatInput'

function ChatWindow() {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Placeholder */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-xl font-medium text-gray-400">How can I help you today?</p>
            <p className="text-sm mt-2">Ask me anything about coding, or generate images.</p>
          </div>
        </div>
      </div>

      {/* Input area — always at the bottom */}
      <ChatInput />
    </div>
  )
}

export default ChatWindow