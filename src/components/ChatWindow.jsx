import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";

function TypingLoader() {
  return (
    <div className="flex items-end gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-4`}>
      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? "bg-violet-600 text-white rounded-br-sm"
          : "bg-gray-800 text-gray-100 rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, onSend }) {
  const bottomRef = useRef(null);
  const isWaitingForAI = messages.length > 0 && messages[messages.length - 1].role === "user";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaitingForAI]);

  return (
    <main className="flex flex-col flex-1 min-w-0 bg-gray-950">
      <div className="flex-1 overflow-y-auto py-6 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <p className="text-2xl font-semibold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              VividAI
            </p>
            <p className="text-gray-500 text-sm">Start a conversation to begin.</p>
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
        )}
        {isWaitingForAI && <TypingLoader />}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 px-4 py-3">
        <ChatInput onSend={onSend} />
      </div>
    </main>
  );
}