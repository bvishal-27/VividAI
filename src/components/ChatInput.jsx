import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

function IconSend() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function ChatInput({ onSend, disabled = false }) {
  const [value, setValue] = useState("");
  const { isDark } = useTheme();

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={`flex items-end gap-2 border rounded-xl px-3 py-2 transition-colors duration-200
      ${isDark
        ? disabled ? "bg-gray-900 border-gray-800 opacity-60" : "bg-gray-900 border-gray-700 focus-within:border-violet-500"
        : disabled ? "bg-gray-100 border-gray-200 opacity-60" : "bg-gray-100 border-gray-300 focus-within:border-violet-400"
      }`}>
      <textarea
        className={`flex-1 bg-transparent resize-none text-sm outline-none max-h-36 leading-relaxed py-0.5
          ${isDark ? "text-gray-100 placeholder-gray-600" : "text-gray-900 placeholder-gray-400"}`}
        placeholder={disabled ? "VividAI is thinking…" : "Message VividAI…"}
        rows={1}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          setValue(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        onKeyDown={handleKeyDown}
      />
      <button onClick={submit} disabled={disabled || !value.trim()}
        className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors">
        {disabled ? <IconSpinner /> : <IconSend />}
      </button>
    </div>
  );
}