import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

function SlidePreview({ slide, index, isActive, onClick }) {
  return (
    <div onClick={onClick}
      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all shrink-0
        ${isActive ? "border-violet-500 scale-105" : "border-gray-700 hover:border-gray-500"}`}
      style={{ width: 140, height: 90 }}>
      <div className="w-full h-full bg-[#0D1117] relative p-2 flex flex-col justify-center">
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600" />
        {slide.type === "title" ? (
          <>
            <p className="text-[8px] text-violet-400 font-bold truncate pl-2">{slide.title}</p>
            <p className="text-[6px] text-gray-500 truncate pl-2 mt-0.5">{slide.subtitle}</p>
          </>
        ) : (
          <>
            <p className="text-[7px] text-violet-300 font-bold truncate pl-2 mb-1">{slide.title}</p>
            {(slide.bullets || []).slice(0, 3).map((b, i) => (
              <div key={i} className="flex items-start gap-1 pl-2">
                <span className="w-1 h-1 rounded-full bg-violet-500 shrink-0 mt-0.5" />
                <p className="text-[5.5px] text-gray-400 truncate">{b}</p>
              </div>
            ))}
          </>
        )}
        <div className="absolute bottom-1 right-1 text-[5px] text-gray-600">{index + 1}</div>
      </div>
    </div>
  );
}

function BigSlide({ slide, index, total }) {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-700 bg-[#0D1117]"
      style={{ aspectRatio: "16/9" }}>
      <div className="w-full h-full relative p-8 flex flex-col justify-center">
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-violet-600" />

        {slide.type === "title" ? (
          <div className="pl-4">
            <p className="text-xs text-cyan-400 font-bold mb-3 tracking-widest">✦ VividAI</p>
            <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{slide.title}</h1>
            <div className="w-16 h-1 bg-violet-600 mb-3" />
            <p className="text-sm text-gray-400 italic">{slide.subtitle}</p>
          </div>
        ) : (
          <div className="pl-4 w-full">
            <h2 className="text-xl font-bold text-violet-300 mb-1">{slide.title}</h2>
            {slide.subtitle && <p className="text-xs text-cyan-400 italic mb-3">{slide.subtitle}</p>}
            <div className="space-y-2 mt-2">
              {(slide.bullets || []).map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#1E293B] rounded-lg px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1" />
                  <p className="text-xs text-gray-300 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="absolute bottom-2 right-3 text-[10px] text-gray-600">{index + 1} / {total}</div>
        <div className="absolute bottom-0 left-2 right-0 h-1 bg-violet-600 opacity-60" />
      </div>
    </div>
  );
}

export default function PPTPreview({ message }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const { isDark } = useTheme();
  const { slides, filename, fileData } = message;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = fileData;
    a.download = filename;
    a.click();
  };

  return (
    <div className="flex justify-start px-4 md:px-6 w-full">
      <div className="w-full max-w-[95%] md:max-w-[85%]">
        {/* AI Label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-white">AI</span>
          </div>
          <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>VividAI</span>
        </div>

        <div className="pl-8">
          <p className={`text-sm mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            ✅ Your PPT on <span className="text-violet-400 font-semibold">"{filename.replace(/_/g, " ").replace(".pptx", "")}"</span> is ready!
            Preview all {slides.length} slides below, then download.
          </p>

          {/* Big slide view */}
          <BigSlide slide={slides[activeIdx]} index={activeIdx} total={slides.length} />

          {/* Slide thumbnails */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {slides.map((slide, i) => (
              <SlidePreview key={i} slide={slide} index={i}
                isActive={i === activeIdx} onClick={() => setActiveIdx(i)} />
            ))}
          </div>

          {/* Navigation + Download */}
          <div className="flex items-center gap-3 mt-3">
            <button onClick={() => setActiveIdx((p) => Math.max(0, p - 1))}
              disabled={activeIdx === 0}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs disabled:opacity-30 transition-colors">
              ← Prev
            </button>
            <span className="text-xs text-gray-500">{activeIdx + 1} / {slides.length}</span>
            <button onClick={() => setActiveIdx((p) => Math.min(slides.length - 1, p + 1))}
              disabled={activeIdx === slides.length - 1}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs disabled:opacity-30 transition-colors">
              Next →
            </button>
            <button onClick={handleDownload}
              className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download .pptx
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}