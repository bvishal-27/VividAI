import { useState } from "react"
import Sidebar from "./components/Sidebar"
import ChatWindow from "./components/ChatWindow"

function App() {
  const [messages, setMessages] = useState([])

  function handleSend(text) {
    const userMsg = { id: Date.now(), role: "user", text }
    const loaderId = Date.now() + 1

    setMessages(prev => [...prev, userMsg, { id: loaderId, role: "ai", typing: true }])

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === loaderId
            ? { id: loaderId, role: "ai", text: "This is a placeholder reply. Real Gemini API comes on Day 3!" }
            : m
        )
      )
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <ChatWindow messages={messages} onSend={handleSend} />
    </div>
  )
}

export default App