import { useRef, useEffect } from "react";

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

export default function Sidebar({ sessions, activeSessionId, onSelectSession, onNewChat }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeSessionId]);

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-gray-900 border-r border-gray-800">

      {/* Logo */}
      <div className="px-5 pt-5 pb-4 select-none">
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          VividAI
        </span>
      </div>

      {/* New Chat */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-gray-300 hover:text-white hover:bg-gray-700
                     border border-gray-700 hover:border-gray-600 transition-all duration-150"
        >
          <IconNewChat />
          <span>New chat</span>
        </button>
      </div>

      <div className="px-4 py-1">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Recent</p>
      </div>

      {/* Session list */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {sessions.length === 0 && (
          <p className="text-xs text-gray-600 px-3 py-2">No chats yet.</p>
        )}
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSelectSession(session.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left
                          transition-all duration-150 cursor-pointer
                          ${isActive
                            ? "bg-gray-700 text-white font-medium"
                            : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                          }`}
            >
              <IconChat />
              <span className="truncate">{session.title}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-[10px] text-gray-600 text-center">VividAI · Day 3</p>
      </div>
    </aside>
  );
}