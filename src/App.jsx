import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

let nextId = 1;
const createSession = () => ({
  id: nextId++,
  title: "New Chat",
  messages: [],
});

export default function App() {
  const [sessions, setSessions] = useState([createSession()]);
  const [activeSessionId, setActiveSessionId] = useState(1);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleNewChat = useCallback(() => {
    const session = createSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
  }, []);

  const handleSend = useCallback(
    (text) => {
      const sessionId = activeSessionId;
      const userMessage = { id: Date.now(), role: "user", content: text };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const isFirst = s.messages.length === 0;
          const title = isFirst
            ? text.trim().slice(0, 30) + (text.trim().length > 30 ? "…" : "")
            : s.title;
          return {
            ...s,
            title,
            messages: [...s.messages, userMessage],
          };
        })
      );

      // Fake AI reply after 1 second
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: "This is a placeholder AI response. Real API coming in Day 4!",
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, aiMessage] }
              : s
          )
        );
      }, 1000);
    },
    [activeSessionId]
  );

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
      />
      <ChatWindow
        messages={activeSession?.messages ?? []}
        onSend={handleSend}
      />
    </div>
  );
}