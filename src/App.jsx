import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { useTheme } from "./context/ThemeContext";

const API = "http://localhost:5002/api";

async function detectImageIntent(text) {
  try {
    const res = await fetch(`${API}/detect-intent`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return (await res.json()).isImage === true;
  } catch { return false; }
}

function isPPTRequest(text) {
  return /\b(create|make|generate|build|prepare|design)\b.*(ppt|pptx|powerpoint|presentation|slides)\b/i.test(text) ||
    /\b(ppt|powerpoint|presentation|slides)\b.*(on|about|for|of)\b/i.test(text);
}

function AppContent() {
  const { user } = useUser();
  const userId = user?.id;
  const headers = { "Content-Type": "application/json", "x-user-id": userId };

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useTheme();

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Load chats from MongoDB on login
  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/chats`, { headers })
      .then((r) => r.json())
      .then((chats) => {
        if (chats.length === 0) {
          // No chats yet — create a default empty one
          const empty = { id: "local-1", _id: null, title: "New Chat", messages: [], isStreaming: false };
          setSessions([empty]);
          setActiveSessionId("local-1");
        } else {
          const mapped = chats.map((c) => ({
            id: c._id, _id: c._id, title: c.title, messages: [], isStreaming: false, loaded: false,
          }));
          setSessions(mapped);
          setActiveSessionId(mapped[0].id);
        }
      })
      .catch(() => {
        const empty = { id: "local-1", _id: null, title: "New Chat", messages: [], isStreaming: false };
        setSessions([empty]);
        setActiveSessionId("local-1");
      });
  }, [userId]);

  // Load messages when switching sessions
  useEffect(() => {
    if (!activeSessionId || !userId) return;
    const session = sessions.find((s) => s.id === activeSessionId);
    if (!session || session.loaded || !session._id) return;

    fetch(`${API}/chats/${session._id}`, { headers })
      .then((r) => r.json())
      .then((chat) => {
        setSessions((prev) => prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: chat.messages.map((m) => ({ ...m, id: m._id || Date.now() })), loaded: true }
            : s
        ));
      });
  }, [activeSessionId, userId]);

  const handleNewChat = useCallback(() => {
    const empty = { id: `local-${Date.now()}`, _id: null, title: "New Chat", messages: [], isStreaming: false };
    setSessions((prev) => [empty, ...prev]);
    setActiveSessionId(empty.id);
  }, []);

  const handleDeleteChat = useCallback(async (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session?._id) {
      await fetch(`${API}/chats/${session._id}`, { method: "DELETE", headers });
    }
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setSessions((prev) => {
      if (prev.length === 0) {
        const empty = { id: `local-${Date.now()}`, _id: null, title: "New Chat", messages: [], isStreaming: false };
        setActiveSessionId(empty.id);
        return [empty];
      }
      if (sessionId === activeSessionId) setActiveSessionId(prev[0]?.id);
      return prev;
    });
  }, [sessions, activeSessionId]);

  const saveToDb = useCallback(async (sessionId, title, messages) => {
    const session = sessions.find((s) => s.id === sessionId);
    const saveable = messages
      .filter((m) => m.content || m.imageData)
      .map((m) => ({ role: m.role || "assistant", content: m.content || "", type: m.type || "text", imageData: m.imageData }));

    if (session?._id) {
      await fetch(`${API}/chats/${session._id}`, {
        method: "PUT", headers,
        body: JSON.stringify({ title, messages: saveable }),
      });
    } else {
      const res = await fetch(`${API}/chats`, {
        method: "POST", headers,
        body: JSON.stringify({ title, messages: saveable }),
      });
      const newChat = await res.json();
      setSessions((prev) => prev.map((s) =>
        s.id === sessionId ? { ...s, _id: newChat._id, id: newChat._id } : s
      ));
      setActiveSessionId(newChat._id);
    }
  }, [sessions, userId]);

  const handleSend = useCallback(async (text, image = null, pdf = null) => {
    const sessionId = activeSessionId;
    const prevMessages = activeSession?.messages ?? [];
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      image: image ? image.preview : null,
      pdfName: pdf ? pdf.name : null,
    };

    let newTitle = activeSession?.title;
    const isFirst = prevMessages.length === 0;
    if (isFirst) newTitle = text.trim().slice(0, 30) + (text.trim().length > 30 ? "…" : "");

    setSessions((prev) => prev.map((s) =>
      s.id !== sessionId ? s : { ...s, title: newTitle, isStreaming: true, messages: [...s.messages, userMessage] }
    ));

    const isImage = await detectImageIntent(text);

    // ── PPT request ────────────────────────────────────
    if (isPPTRequest(text)) {
      const pptMsgId = Date.now() + 1;
      const topic = text.replace(/\b(create|make|generate|build|prepare|design)\b.*(ppt|pptx|powerpoint|presentation|slides)\b.*?(on|about|for)?\s*/i, "").trim() || text;

      setSessions((prev) => prev.map((s) =>
        s.id !== sessionId ? s : {
          ...s, isStreaming: true,
          messages: [...s.messages, { id: pptMsgId, role: "assistant", type: "ppt-loading", content: `⏳ Creating PPT on "${topic}"...` }]
        }
      ));

      try {
        const res = await fetch(`${API}/generate-ppt`, {
          method: "POST", headers,
          body: JSON.stringify({ topic }),
        });
        if (!res.ok) throw new Error("PPT generation failed");
        const data = await res.json();

        setSessions((prev) => prev.map((s) =>
          s.id !== sessionId ? s : {
            ...s, isStreaming: false,
            messages: s.messages.map((m) =>
              m.id === pptMsgId ? { ...m, type: "ppt", slides: data.slides, filename: data.filename, fileData: data.fileData } : m
            )
          }
        ));
      } catch (err) {
        setSessions((prev) => prev.map((s) =>
          s.id !== sessionId ? s : {
            ...s, isStreaming: false,
            messages: s.messages.map((m) =>
              m.id === pptMsgId ? { ...m, type: "text", content: `⚠ PPT failed: ${err.message}`, isError: true } : m
            )
          }
        ));
      }
      return;
    }

    if (isImage) {
      const imgId = Date.now() + 1;
      setSessions((prev) => prev.map((s) =>
        s.id !== sessionId ? s : { ...s, messages: [...s.messages, { id: imgId, type: "image", imageData: null, prompt: text }] }
      ));
      try {
        const res = await fetch(`${API}/generate-image`, {
          method: "POST", headers,
          body: JSON.stringify({ prompt: text }),
        });
        const data = await res.json();
        setSessions((prev) => prev.map((s) => {
          if (s.id !== sessionId) return s;
          const updated = s.messages.map((m) => m.id === imgId ? { ...m, imageData: data.imageData } : m);
          saveToDb(sessionId, newTitle, [...prevMessages, userMessage, { role: "assistant", content: "", type: "image", imageData: data.imageData }]);
          return { ...s, isStreaming: false, messages: updated };
        }));
      } catch (err) {
        setSessions((prev) => prev.map((s) =>
          s.id !== sessionId ? s : { ...s, isStreaming: false, messages: s.messages.map((m) => m.id === imgId ? { ...m, type: "text", role: "assistant", content: `⚠ ${err.message}`, isError: true } : m) }
        ));
      }
      return;
    }

    const aiId = Date.now() + 1;
    setSessions((prev) => prev.map((s) =>
      s.id !== sessionId ? s : { ...s, messages: [...s.messages, { id: aiId, role: "assistant", content: "", streaming: true, isError: false }] }
    ));

    try {
      const apiMessages = [...prevMessages.filter((m) => m.content && !m.isError && m.type !== "image"), { role: "user", content: text }];
      const response = await fetch(`${API}/chat`, {
        method: "POST", headers,
        body: JSON.stringify({ messages: apiMessages, image: image || null, pdfData: pdf || null }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", aiContent = "";

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
              aiContent += parsed.token;
              setSessions((prev) => prev.map((s) =>
                s.id !== sessionId ? s : { ...s, messages: s.messages.map((m) => m.id === aiId ? { ...m, content: m.content + parsed.token } : m) }
              ));
            }
          } catch {}
        }
      }

      setSessions((prev) => prev.map((s) => {
        if (s.id !== sessionId) return s;
        const updated = s.messages.map((m) => m.id === aiId ? { ...m, streaming: false } : m);
        saveToDb(sessionId, newTitle, [...prevMessages, userMessage, { role: "assistant", content: aiContent }]);
        return { ...s, isStreaming: false, messages: updated };
      }));
    } catch (err) {
      setSessions((prev) => prev.map((s) =>
        s.id !== sessionId ? s : { ...s, isStreaming: false, messages: s.messages.map((m) => m.id === aiId ? { ...m, content: `⚠ ${err.message}`, streaming: false, isError: true } : m) }
      ));
    }
  }, [activeSessionId, activeSession, saveToDb]);

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-200 ${isDark ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ChatWindow
        messages={activeSession?.messages ?? []}
        isStreaming={activeSession?.isStreaming ?? false}
        onSend={handleSend}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
        onRegenerate={() => {
          const msgs = activeSession?.messages ?? [];
          const lastUser = [...msgs].reverse().find((m) => m.role === "user");
          if (lastUser) handleSend(lastUser.content);
        }}
      />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}