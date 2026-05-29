import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { streamMessage } from "./api/chat";

let nextId = 1;
const createSession = () => ({
  id: nextId++,
  title: "New Chat",
  messages: [],
  isStreaming: false,
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
      const prevMessages = activeSession?.messages ?? [];

      const userMessage = { id: Date.now(), role: "user", content: text };
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        streaming: true,
        isError: false,
      };

      // Add user + empty AI bubble, set isStreaming, auto-title
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
            isStreaming: true,
            messages: [...s.messages, userMessage, aiMessage],
          };
        })
      );

      // Build history for Gemini (prev messages + new user message)
      const apiMessages = [
        ...prevMessages.filter((m) => m.content && !m.isError),
        { role: "user", content: text },
      ];

      streamMessage(
        apiMessages,

        // onToken — grow the bubble
        (token) => {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== sessionId) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, content: m.content + token }
                    : m
                ),
              };
            })
          );
        },

        // onDone — unlock input
        () => {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== sessionId) return s;
              return {
                ...s,
                isStreaming: false,
                messages: s.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, streaming: false } : m
                ),
              };
            })
          );
        },

        // onError — red bubble, unlock input
        (errorMsg) => {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== sessionId) return s;
              return {
                ...s,
                isStreaming: false,
                messages: s.messages.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, content: `⚠ ${errorMsg}`, streaming: false, isError: true }
                    : m
                ),
              };
            })
          );
        }
      );
    },
    [activeSessionId, activeSession]
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
        isStreaming={activeSession?.isStreaming ?? false}
        onSend={handleSend}
      />
    </div>
  );
}