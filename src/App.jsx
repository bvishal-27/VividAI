import { useState, useCallback } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { useTheme } from "./context/ThemeContext";

let nextId = 1;
const createSession = () => ({ id: nextId++, title: "New Chat", messages: [], isStreaming: false });

async function detectImageIntent(text) {
  try {
    const res = await fetch("http://localhost:5002/api/detect-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return data.isImage === true;
  } catch { return false; }
}

export default function App() {
  const [sessions, setSessions] = useState([createSession()]);
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useTheme();

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleNewChat = useCallback(() => {
    const session = createSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
  }, []);

  const handleSend = useCallback(async (text) => {
    const sessionId = activeSessionId;
    const prevMessages = activeSession?.messages ?? [];
    const userMessage = { id: Date.now(), role: "user", content: text };

    setSessions((prev) => prev.map((s) => {
      if (s.id !== sessionId) return s;
      const isFirst = s.messages.length === 0;
      const title = isFirst ? text.trim().slice(0, 30) + (text.trim().length > 30 ? "…" : "") : s.title;
      return { ...s, title, isStreaming: true, messages: [...s.messages, userMessage] };
    }));

    const isImage = await detectImageIntent(text);

    if (isImage) {
      const imageMessageId = Date.now() + 1;
      setSessions((prev) => prev.map((s) => {
        if (s.id !== sessionId) return s;
        return { ...s, messages: [...s.messages, { id: imageMessageId, type: "image", imageData: null, prompt: text }] };
      }));
      try {
        const res = await fetch("http://localhost:5002/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });
        const data = await res.json();
        setSessions((prev) => prev.map((s) => {
          if (s.id !== sessionId) return s;
          return { ...s, isStreaming: false, messages: s.messages.map((m) => m.id === imageMessageId ? { ...m, imageData: data.imageData } : m) };
        }));
      } catch (err) {
        setSessions((prev) => prev.map((s) => {
          if (s.id !== sessionId) return s;
          return { ...s, isStreaming: false, messages: s.messages.map((m) => m.id === imageMessageId ? { ...m, type: "text", role: "assistant", content: `⚠ ${err.message}`, isError: true } : m) };
        }));
      }
      return;
    }

    const aiMessageId = Date.now() + 1;
    setSessions((prev) => prev.map((s) => s.id !== sessionId ? s : { ...s, messages: [...s.messages, { id: aiMessageId, role: "assistant", content: "", streaming: true, isError: false }] }));

    try {
      const apiMessages = [...prevMessages.filter((m) => m.content && !m.isError && m.type !== "image"), { role: "user", content: text }];
      const response = await fetch("http://localhost:5002/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              setSessions((prev) => prev.map((s) => {
                if (s.id !== sessionId) return s;
                return { ...s, messages: s.messages.map((m) => m.id === aiMessageId ? { ...m, content: m.content + parsed.token } : m) };
              }));
            }
          } catch {}
        }
      }
      setSessions((prev) => prev.map((s) => {
        if (s.id !== sessionId) return s;
        return { ...s, isStreaming: false, messages: s.messages.map((m) => m.id === aiMessageId ? { ...m, streaming: false } : m) };
      }));
    } catch (err) {
      setSessions((prev) => prev.map((s) => {
        if (s.id !== sessionId) return s;
        return { ...s, isStreaming: false, messages: s.messages.map((m) => m.id === aiMessageId ? { ...m, content: `⚠ ${err.message}`, streaming: false, isError: true } : m) };
      }));
    }
  }, [activeSessionId, activeSession]);

  return (
    <>
      {/* If not signed in → redirect to Clerk login */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      {/* If signed in → show app */}
      <SignedIn>
        <div className={`flex h-screen overflow-hidden transition-colors duration-200 ${isDark ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}>
          <Sidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onNewChat={handleNewChat}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <ChatWindow
            messages={activeSession?.messages ?? []}
            isStreaming={activeSession?.isStreaming ?? false}
            onSend={handleSend}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((p) => !p)}
          />
        </div>
      </SignedIn>
    </>
  );
}