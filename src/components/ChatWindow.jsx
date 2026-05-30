import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { useTheme } from "../context/ThemeContext";

function TypingLoader() {
  return (
    <div className="flex items-end gap-1.5 px-6 py-3">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition-all duration-200
        ${copied ? "bg-green-700 text-green-100" : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"}`}>
      {copied
        ? <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied</>
        : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
      }
    </button>
  );
}

function CodeBlock({ lang, code }) {
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[11px] text-gray-400 font-mono ml-1">{lang || "code"}</span>
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#0d1117] px-4 py-3 overflow-x-auto text-xs font-mono leading-relaxed text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function InlineText({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`"))
          return <code key={i} className="bg-gray-700 text-green-300 text-xs font-mono px-1.5 py-0.5 rounded">{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function looksLikeCode(line) {
  const t = line.trim();
  if (!t) return false;
  return (
    /^(public|private|protected|static|class |interface |enum |struct |fn |func |fun |def |sub )/.test(t) ||
    /^(import |from |export |require|include|using |namespace|package |module )/.test(t) ||
    /^(if |else|elif|for |foreach|while |do |switch |case |try |catch |finally|throw|return |async |await )/.test(t) ||
    /^(const |let |var |val |int |float |double |string |bool |char |void |type |auto )/.test(t) ||
    /^(function |console\.|System\.|cout|print|echo |puts )/.test(t) ||
    /^(SELECT |INSERT |UPDATE |DELETE |CREATE |DROP |ALTER )/i.test(t) ||
    /^(npm |yarn |pip |git |cd |mkdir |docker |kubectl|curl )/.test(t) ||
    /^<[a-zA-Z\/][^>]*>/.test(t) ||
    /[{};]$/.test(t) ||
    /^\s*(\/\/|\/\*|#\s|<!--)/.test(t) ||
    /=>|->|===|!==|::/.test(t) ||
    /\w+\s*\(.*\)\s*\{?$/.test(t)
  );
}

function renderMarkdown(text, isDark) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0, key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "code";
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      elements.push(<CodeBlock key={key++} lang={lang} code={codeLines.join("\n")} />);
      i++; continue;
    }

    if (line.startsWith("### ")) {
      elements.push(<p key={key++} className="font-semibold text-sm mt-4 mb-1.5 border-b border-gray-700 pb-1"><InlineText text={line.slice(4)} /></p>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<p key={key++} className="font-bold mt-4 mb-1"><InlineText text={line.slice(3)} /></p>);
      i++; continue;
    }

    if (line.trim() === "---") {
      elements.push(<hr key={key++} className="border-gray-600 my-3" />);
      i++; continue;
    }

    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={key++} className="flex gap-3 items-start my-1.5">
          <span className="shrink-0 w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{numMatch[1]}</span>
          <p className="text-sm leading-relaxed flex-1"><InlineText text={numMatch[2]} /></p>
        </div>
      );
      i++; continue;
    }

    const bulletMatch = line.match(/^[\*\-]\s+(.*)/);
    if (bulletMatch) {
      elements.push(
        <div key={key++} className="flex gap-3 items-start my-1">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400 mt-2.5" />
          <p className="text-sm leading-relaxed flex-1"><InlineText text={bulletMatch[1]} /></p>
        </div>
      );
      i++; continue;
    }

    if (line.trim() === "") { elements.push(<div key={key++} className="h-2" />); i++; continue; }

    if (looksLikeCode(line)) {
      const codeLines = [];
      while (i < lines.length && (looksLikeCode(lines[i]) || lines[i].trim() === "" || /^[\{\}\(\)\[\];]/.test(lines[i].trim()))) {
        codeLines.push(lines[i]); i++;
      }
      const trimmed = codeLines.join("\n").trimEnd();
      if (trimmed) elements.push(<CodeBlock key={key++} lang="code" code={trimmed} />);
      continue;
    }

    elements.push(<p key={key++} className="text-sm leading-relaxed"><InlineText text={line} /></p>);
    i++;
  }
  return elements;
}

function ChatBubble({ message }) {
  const { isDark } = useTheme();
  const isUser = message.role === "user";

  if (message.isError) {
    return (
      <div className="flex justify-start px-6">
        <div className="max-w-[70%] px-4 py-3 rounded-2xl text-sm bg-red-950 border border-red-800 text-red-300">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.streaming && message.content === "") return <TypingLoader />;

  if (isUser) {
    return (
      <div className="flex justify-end px-6">
        <div className="max-w-[65%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-violet-600 text-white text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start px-6">
      <div className="w-full max-w-[82%]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-white">AI</span>
          </div>
          <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>VividAI</span>
        </div>
        <div className="pl-8 space-y-1">
          {renderMarkdown(message.content, isDark)}
          {message.streaming && <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-violet-400 align-middle animate-pulse" />}
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isStreaming, onSend }) {
  const { isDark } = useTheme();
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <main className={`flex flex-col flex-1 min-w-0 transition-colors duration-200
      ${isDark ? "bg-gray-950" : "bg-white"}`}>
      <div className="flex-1 overflow-y-auto py-6 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <p className="text-xl font-semibold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-1">VividAI</p>
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Ask me anything.</p>
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>
      <div className={`border-t px-4 py-3 transition-colors duration-200
        ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <ChatInput onSend={onSend} disabled={isStreaming} />
      </div>
    </main>
  );
}