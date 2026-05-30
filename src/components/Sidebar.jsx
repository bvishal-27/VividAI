import { useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

function IconNewChat() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  );
}

export default function Sidebar({ sessions, activeSessionId, onSelectSession, onNewChat, isOpen, onClose }) {
  const activeRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeSessionId]);

  const handleSelect = (id) => {
    onSelectSession(id);
    if (window.innerWidth < 768) onClose();
  };

  const handleNewChat = () => {
    onNewChat();
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      {/* Mobile backdrop only */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose} />
      )}

      {/* Sidebar — slides on mobile, collapses width on desktop */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30
        flex flex-col border-r shrink-0
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? "w-64 translate-x-0" : "w-0 md:w-0 -translate-x-full md:translate-x-0"}
        ${isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"}
      `}>
        <div className="w-64 flex flex-col h-full">

          {/* Logo */}
          <div className="px-5 pt-5 pb-4 select-none">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              VividAI
            </span>
          </div>

          {/* New Chat */}
          <div className="px-3 pb-3">
            <button onClick={handleNewChat}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150
                ${isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-700 border-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200 border-gray-300"
                }`}>
              <IconNewChat />
              <span>New chat</span>
            </button>
          </div>

          <div className="px-4 py-1">
            <p className={`text-[10px] uppercase tracking-widest font-semibold
              ${isDark ? "text-gray-600" : "text-gray-400"}`}>Recent</p>
          </div>

          {/* Session list */}
          <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <button key={session.id} ref={isActive ? activeRef : null}
                  onClick={() => handleSelect(session.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all duration-150
                    ${isActive
                      ? isDark ? "bg-gray-700 text-white font-medium" : "bg-gray-200 text-gray-900 font-medium"
                      : isDark ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    }`}>
                  <IconChat />
                  <span className="truncate">{session.title}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`px-3 py-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <button onClick={toggleTheme}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150
                ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"}`}>
              {isDark ? <IconSun /> : <IconMoon />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </button>
            <p className={`text-[10px] text-center mt-2 ${isDark ? "text-gray-700" : "text-gray-400"}`}>
              VividAI · Day 6
            </p>
          </div>

        </div>
      </aside>
    </>
  );
}