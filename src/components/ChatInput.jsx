import { useState, useRef } from "react";
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

function IconImage() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function IconMic({ recording }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={recording ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}

export default function ChatInput({ onSend, disabled = false }) {
  const [value, setValue] = useState("");
  const [image, setImage] = useState(null);
  const [recording, setRecording] = useState(false);
  const { isDark } = useTheme();
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Please select an image under 5MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setImage({ base64, mimeType: file.type, preview: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser. Try Chrome or Safari.");
      return;
    }
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setRecording(true);
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join("");
      setValue(transcript);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);
    recognition.start();
  };

  const submit = () => {
    const trimmed = value.trim();
    if ((!trimmed && !image) || disabled) return;
    onSend(trimmed || "What is in this image?", image);
    setValue("");
    setImage(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className={`border rounded-xl transition-colors duration-200
      ${isDark
        ? disabled ? "bg-gray-900 border-gray-800 opacity-60" : "bg-gray-900 border-gray-700 focus-within:border-violet-500"
        : disabled ? "bg-gray-100 border-gray-200 opacity-60" : "bg-gray-100 border-gray-300 focus-within:border-violet-400"
      }`}>

      {/* Image preview */}
      {image && (
        <div className="px-3 pt-3 flex items-start gap-2">
          <div className="relative shrink-0">
            <img src={image.preview} alt="preview"
              className="w-16 h-16 rounded-lg object-cover border border-gray-600" />
            <button onClick={() => setImage(null)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-400">
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <p className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>Image attached</p>
            <p className={`text-[11px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Try: "describe", "read text", "find bugs", "identify", "translate"
            </p>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {recording && (
        <div className="px-3 pt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <p className="text-xs text-red-400 font-medium">Listening... speak now</p>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-2">

        {/* Image button */}
        <button onClick={() => fileRef.current?.click()} disabled={disabled}
          className={`p-1.5 rounded-lg transition-colors shrink-0
            ${image ? "text-violet-400" : isDark ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"}`}>
          <IconImage />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        {/* Mic button */}
        <button onClick={toggleVoice} disabled={disabled}
          className={`p-1.5 rounded-lg transition-colors shrink-0
            ${recording
              ? "text-red-400 bg-red-900/30 border border-red-700"
              : isDark ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"
            }`}>
          <IconMic recording={recording} />
        </button>

        {/* Textarea */}
        <textarea ref={textareaRef}
          className={`flex-1 bg-transparent resize-none text-sm outline-none max-h-36 leading-relaxed py-0.5
            ${isDark ? "text-gray-100 placeholder-gray-600" : "text-gray-900 placeholder-gray-400"}`}
          placeholder={recording ? "Listening..." : image ? "Ask anything about this image..." : disabled ? "VividAI is thinking…" : "Message VividAI…"}
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

        {/* Send button */}
        <button onClick={submit} disabled={disabled || (!value.trim() && !image)}
          className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors shrink-0">
          {disabled ? <IconSpinner /> : <IconSend />}
        </button>
      </div>
    </div>
  );
}