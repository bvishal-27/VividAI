import { useState, useEffect, useRef } from "react";
import { SignInButton } from "@clerk/clerk-react";

// ── Scroll reveal hook ─────────────────────────────────────
function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── Typing animation ───────────────────────────────────────
function useTyping(words, speed = 90) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    const t = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, text.length + 1));
        if (text.length + 1 === word.length) setTimeout(() => setDeleting(true), 2000);
      } else {
        setText(word.slice(0, text.length - 1));
        if (text.length === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length); }
      }
    }, deleting ? 40 : speed);
    return () => clearTimeout(t);
  }, [text, deleting, wordIdx]);
  return text;
}

// ── Background ─────────────────────────────────────────────
const Background = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[#04040a]"/>
    <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,40,200,0.25), transparent)'}}/>
    <div className="absolute inset-0" style={{backgroundImage:`linear-gradient(rgba(139,92,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.03) 1px,transparent 1px)`,backgroundSize:'64px 64px'}}/>
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]"/>
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/8 rounded-full blur-[80px]"/>
  </div>
);

// ── Navbar ─────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#04040a]/90 backdrop-blur-xl border-b border-white/[0.06]' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white font-black text-sm">V</span>
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">VividAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          {['Features','Capabilities','Pricing'].map(n => (
            <a key={n} href="#features" className="hover:text-white transition-colors duration-200">{n}</a>
          ))}
        </div>
        <SignInButton mode="modal">
          <button className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 text-white text-sm font-medium transition-all duration-200">
            Get Started
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </SignInButton>
      </div>
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────
function Hero() {
  const typed = useTyping(['anything.','your code.','your PDFs.','presentations.','AI images.']);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24 pb-16">
      {/* Badge */}
      <div className={`transition-all duration-700 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-violet-500/25 bg-violet-500/8 text-violet-300 text-sm font-medium mb-10 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"/>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400"/>
          </span>
          Powered by Gemini 2.5 Flash
        </div>
      </div>

      {/* Headline */}
      <div className={`transition-all duration-700 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tight mb-8">
          <span className="text-white block">Ask</span>
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent block min-h-[1.1em]">
            {typed}<span className="animate-pulse text-violet-400"></span>
          </span>
        </h1>
      </div>

      {/* Subheading */}
      <div className={`transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed">
          One AI assistant that chats, generates images, builds presentations,
          reads documents, and understands your code.
        </p>
      </div>

      {/* CTAs */}
      <div className={`flex flex-col sm:flex-row gap-4 mb-20 transition-all duration-700 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <SignInButton mode="modal">
          <button className="group relative px-8 py-4 rounded-2xl font-bold text-white text-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600"/>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"/>
            <span className="relative flex items-center gap-2">
              Start for free
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>
        </SignInButton>
        <a href="#features" className="px-8 py-4 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all duration-200 font-medium text-lg text-center">
          See features
        </a>
      </div>

      {/* Social proof */}
      <div className={`flex items-center gap-6 md:gap-12 transition-all duration-700 delay-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        {[['10+','AI Features'],['100%','Free to Start'],['∞','Conversations'],['5★','Experience']].map(([n,l]) => (
          <div key={l} className="text-center">
            <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{n}</div>
            <div className="text-xs text-gray-600 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
        <span className="text-xs tracking-widest uppercase">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent"/>
      </div>
    </section>
  );
}

// ── Feature card (scroll reveal, alternating) ──────────────
function FeatureCard({ icon, tag, title, desc, mockup, reverse, delay = 0 }) {
  const [ref, visible] = useReveal(0.15);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out`}
      style={{ transitionDelay: `${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(48px)' }}>
      <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-16`}>
        {/* Text */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">{tag}</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">{title}</h3>
          <p className="text-gray-400 text-lg leading-relaxed">{desc}</p>
        </div>
        {/* Mockup */}
        <div className="flex-1 w-full max-w-lg">{mockup}</div>
      </div>
    </div>
  );
}

// ── Mockup: Chat ───────────────────────────────────────────
function ChatMock() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step < 3) { const t = setTimeout(() => setStep(s => s + 1), 800); return () => clearTimeout(t); }
  }, [step]);
  return (
    <div className="rounded-2xl border border-white/8 bg-[#08080f]/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-red-500/60"/><span className="w-3 h-3 rounded-full bg-yellow-500/60"/><span className="w-3 h-3 rounded-full bg-green-500/60"/>
        <span className="ml-2 text-xs text-gray-600 font-mono">vivid-ai — chat</span>
      </div>
      <div className="p-5 space-y-4 min-h-[240px]">
        {step >= 1 && (
          <div className="flex justify-end">
            <div className="bg-violet-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%] animate-fadeIn">
              Write a binary search in Python
            </div>
          </div>
        )}
        {step >= 2 && (
          <div className="flex items-start gap-2.5 animate-fadeIn">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-black text-white">AI</span>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm overflow-hidden flex-1">
              <div className="flex items-center justify-between px-3 py-2 bg-[#0d1117] border-b border-white/5">
                <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500/50"/><span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"/><span className="w-2.5 h-2.5 rounded-full bg-green-500/50"/></div>
                <span className="text-[10px] text-gray-600 font-mono">python</span>
                <span className="text-[10px] text-violet-400 cursor-pointer">Copy</span>
              </div>
              <pre className="p-3 text-[11px] text-green-300 font-mono leading-relaxed overflow-x-auto">{`def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1`}</pre>
            </div>
          </div>
        )}
        {step >= 3 && (
          <div className="flex items-center gap-2 animate-fadeIn">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
              <span className="text-[8px] font-black text-white">AI</span>
            </div>
            <div className="text-xs text-gray-400 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
              O(log n) time complexity. Works on sorted arrays. ✓
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mockup: Image Gen ──────────────────────────────────────
function ImageMock() {
  const [generated, setGenerated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGenerated(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="rounded-2xl border border-white/8 bg-[#08080f]/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-red-500/60"/><span className="w-3 h-3 rounded-full bg-yellow-500/60"/><span className="w-3 h-3 rounded-full bg-green-500/60"/>
        <span className="ml-2 text-xs text-gray-600 font-mono">vivid-ai — image gen</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-end">
          <div className="bg-violet-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm">
            Generate an image of a futuristic city at night
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden" style={{height:160}}>
          {!generated ? (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"/>
                <p className="text-xs text-gray-500">Generating...</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-violet-950 to-[#04040a]"/>
              {/* City skyline */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 px-2">
                {[40,60,80,50,90,70,45,65,85,55,75,40,60].map((h,i) => (
                  <div key={i} className="bg-gradient-to-t from-indigo-800/80 to-violet-700/40 rounded-t-sm relative" style={{height:h,width:16+Math.random()*8}}>
                    {Array.from({length:Math.floor(h/12)}).map((_,j) => (
                      <div key={j} className="absolute w-1.5 h-1 rounded-sm bg-yellow-300/60" style={{top:j*12+4,left:3,opacity:Math.random()>0.4?1:0.1}}/>
                    ))}
                  </div>
                ))}
              </div>
              {/* Stars */}
              {Array.from({length:20}).map((_,i) => (
                <div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-white/60" style={{top:`${Math.random()*50}%`,left:`${Math.random()*100}%`,opacity:Math.random()}}/>
              ))}
              <div className="absolute top-2 right-4 text-[9px] text-cyan-300/60 font-mono">AI Generated • VividAI</div>
            </div>
          )}
        </div>
        {generated && (
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-medium transition-all hover:bg-violet-600/30">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
            Download Image
          </button>
        )}
      </div>
    </div>
  );
}

// ── Mockup: PPT ────────────────────────────────────────────
function PPTMock() {
  const slides = ['Introduction to AI','Core Concepts','How It Works','Real World Uses','Future Outlook'];
  const [active, setActive] = useState(0);
  useEffect(() => { const t = setInterval(() => setActive(p => (p+1)%slides.length), 1600); return () => clearInterval(t); }, []);
  return (
    <div className="rounded-2xl border border-white/8 bg-[#08080f]/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-red-500/60"/><span className="w-3 h-3 rounded-full bg-yellow-500/60"/><span className="w-3 h-3 rounded-full bg-green-500/60"/>
        <span className="ml-2 text-xs text-gray-600 font-mono">presentation.pptx</span>
      </div>
      <div className="p-5">
        <div className="rounded-xl overflow-hidden bg-[#0D1117] border border-white/5 aspect-video relative flex flex-col justify-center p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-violet-600 to-cyan-600"/>
          <p className="text-[9px] text-cyan-400 font-bold tracking-[0.2em] mb-3">✦ VIVID AI</p>
          <h3 className="text-xl font-black text-white mb-2 transition-all duration-500">{slides[active]}</h3>
          <div className="w-8 h-0.5 bg-violet-500 mb-3"/>
          <div className="space-y-1.5">
            {['Key insight — detailed explanation','Important concept to understand','Critical point with context'].map((b,i) => (
              <div key={i} className="flex items-center gap-2 bg-[#1E293B] rounded-lg px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"/>
                <span className="text-[10px] text-gray-300">{b}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Slide strip */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
          {slides.map((s,i) => (
            <div key={i} onClick={() => setActive(i)}
              className={`cursor-pointer shrink-0 rounded-lg border transition-all duration-200 ${i === active ? 'border-violet-500 bg-violet-500/10' : 'border-white/5 bg-white/2'}`}
              style={{width:64,height:40,padding:6}}>
              <div className="text-[6px] text-gray-400 truncate font-medium">{s}</div>
              <div className="mt-1 space-y-0.5">
                {[1,2].map(j => <div key={j} className="h-0.5 bg-white/10 rounded-full"/>)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-600">{active+1} / {slides.length}</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
            Download .pptx
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mockup: PDF ────────────────────────────────────────────
function PDFMock() {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setTimeout(() => setStep(1), 600); return () => clearTimeout(t); }, []);
  useEffect(() => { if (step === 1) { const t = setTimeout(() => setStep(2), 800); return () => clearTimeout(t); } }, [step]);
  return (
    <div className="rounded-2xl border border-white/8 bg-[#08080f]/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-red-500/60"/><span className="w-3 h-3 rounded-full bg-yellow-500/60"/><span className="w-3 h-3 rounded-full bg-green-500/60"/>
        <span className="ml-2 text-xs text-gray-600 font-mono">vivid-ai — pdf chat</span>
      </div>
      <div className="p-5 space-y-3 min-h-[220px]">
        {step >= 1 && (
          <div className="flex justify-end flex-col items-end gap-2 animate-fadeIn">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-900/30 border border-red-700/40">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              <span className="text-xs text-red-300">research_paper.pdf</span>
            </div>
            <div className="bg-violet-600 text-white text-xs px-4 py-2.5 rounded-2xl rounded-br-sm">
              What are the key findings?
            </div>
          </div>
        )}
        {step >= 2 && (
          <div className="flex items-start gap-2.5 animate-fadeIn">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-black text-white">AI</span>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-3 py-2.5 flex-1">
              <p className="text-[10px] font-bold text-violet-300 mb-2">Key Findings:</p>
              <div className="space-y-1.5">
                {['Efficiency improved by 40% vs baseline','Tested across 5 diverse datasets','Novel architecture reduces latency'].map((f,i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-violet-400 shrink-0 text-[10px]">•</span>
                    <span className="text-[10px] text-gray-300 leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── More features grid ─────────────────────────────────────
function MoreFeatures() {
  const [ref, visible] = useReveal(0.1);
  const items = [
    { icon: '🎤', title: 'Voice Input', desc: 'Speak naturally. Web Speech API built right in.' },
    { icon: '🌓', title: 'Dark & Light Mode', desc: 'Beautiful in both. Saved to your preferences.' },
    { icon: '📱', title: 'Fully Responsive', desc: 'Desktop, tablet, mobile — works everywhere.' },
    { icon: '🔐', title: 'Secure Authentication', desc: 'Google & GitHub login. Your data stays yours.' },
    { icon: '💾', title: 'Chat History', desc: 'Every conversation saved. Never lose a chat.' },
    { icon: '👁️', title: 'Image Understanding', desc: 'Upload images and ask anything about them.' },
  ];
  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-white/[0.015] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all duration-300 hover:-translate-y-1"
          style={{ transitionDelay: `${i * 60}ms`, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: `all 0.5s ease ${i * 80}ms` }}>
          <div className="text-3xl mb-4">{item.icon}</div>
          <h4 className="font-bold text-white mb-2 text-base">{item.title}</h4>
          <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ── CTA Section ────────────────────────────────────────────
function CTASection() {
  const [ref, visible] = useReveal(0.2);
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="relative rounded-3xl overflow-hidden p-[1px]">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 opacity-20"/>
        <div className="relative rounded-3xl bg-[#08080f] px-8 md:px-16 py-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent rounded-3xl"/>
          <div className="relative z-10">
            <p className="text-violet-400 font-mono text-xs tracking-widest uppercase mb-4">Get started today</p>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Your AI assistant<br/>
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                awaits.
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
              Free to use. No credit card. Sign in with Google or GitHub and start in seconds.
            </p>
            <SignInButton mode="modal">
              <button className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-white text-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/30">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600"/>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"/>
                <span className="relative">Start chatting for free</span>
                <span className="relative group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#04040a] text-white overflow-x-hidden">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      <Background />
      <Navbar />
      <Hero />

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24 space-y-32">
        <FeatureCard
          icon="💬" tag="AI Chat"
          title="Code, explain, debug — powered by Gemini"
          desc="Streaming responses with full markdown, syntax-highlighted code blocks, and one-click copy. Every answer feels instant."
          mockup={<ChatMock />}
          reverse={false}
        />
        <FeatureCard
          icon="🖼️" tag="Image Generation"
          title="Describe it. See it. Download it."
          desc="Turn any idea into a stunning image. No limits, no watermarks, no subscriptions. Just type and generate."
          mockup={<ImageMock />}
          reverse={true}
          delay={100}
        />
        <FeatureCard
          icon="📊" tag="PPT Generation"
          title="From topic to presentation in seconds"
          desc="Type your topic, get 9 beautifully designed slides. Preview before download. Your audience will be impressed."
          mockup={<PPTMock />}
          reverse={false}
          delay={200}
        />
        <FeatureCard
          icon="📄" tag="PDF Analysis"
          title="Chat with any document"
          desc="Upload PDFs — textbooks, research papers, scanned documents. Ask questions, get precise answers instantly."
          mockup={<PDFMock />}
          reverse={true}
          delay={100}
        />
      </section>

      {/* More features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-violet-400 font-mono text-xs tracking-widest uppercase mb-3">Built-in features</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Everything else you need.</h2>
        </div>
        <MoreFeatures />
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <CTASection />
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">VividAI</span>
          </div>
          <p className="text-gray-600 text-sm">Built with React · Gemini AI · MongoDB · Clerk</p>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-400 transition-colors">Features</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}