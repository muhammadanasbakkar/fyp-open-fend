"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

// External Therabot endpoint — accepts { message } and returns the assistant reply.
// Override via NEXT_PUBLIC_THERABOT_URL when the upstream changes.
const THERABOT_URL =
  process.env.NEXT_PUBLIC_THERABOT_URL ||
  "https://web-production-5d40d.up.railway.app/api/therapist-chat";

// ── types ─────────────────────────────────────────────────────────────────────
type Message = { role: "user" | "assistant"; content: string };

// ── extract patientId from current URL ────────────────────────────────────────
function usePatientIdFromPath(): string | null {
  const path = usePathname();
  // /patient-records/[patientId]  or  /patient-records/[patientId]/anything
  const patientRecords = path.match(/\/patient-records\/([a-f0-9]{24})/i);
  if (patientRecords) return patientRecords[1];
  // /appointments/my/[apptId]/assessment  — no patientId directly, skip
  return null;
}

// ── formatted message bubble ──────────────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* avatar */}
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        isUser ? "bg-[#4b7eff] text-white" : "bg-gradient-to-br from-violet-500 to-[#4b7eff] text-white"
      }`}>
        {isUser ? "T" : "AI"}
      </div>
      {/* bubble */}
      <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
        isUser
          ? "bg-[#4b7eff] text-white rounded-tr-sm"
          : "bg-gray-100 text-gray-800 rounded-tl-sm"
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

// ── quick prompt chips ────────────────────────────────────────────────────────
// const QUICK_PROMPTS = [
  // "Summarise this patient's history",
  // "Suggest SOAP note for today's session",
  // "Recommend treatment interventions",
  // "What are the current therapy goals?",
  // "Draft a follow-up plan",
// ];

// ── main component ─────────────────────────────────────────────────────────────
export default function TherapistChatbot() {
  const { user } = useAuth();
  const patientId = usePatientIdFromPath();

  const [open, setOpen]           = useState(false);
  const [input, setInput]         = useState("");
  const [messages, setMessages]   = useState<Message[]>([]);
  const [loading, setLoading]     = useState(false);
  const [unread, setUnread]       = useState(0);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!open && messages.at(-1)?.role === "assistant") setUnread((n) => n + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  // Only render for therapists — after all hooks
  if (user?.role !== "therapist") return null;

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(THERABOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Therabot returned ${res.status}`);
      }

      // The endpoint may return the reply under a few common keys.
      const data = await res.json().catch(() => null);
      const reply: string =
        (data && (data.reply || data.message || data.response || data.answer || data.text)) ||
        (typeof data === "string" ? data : "") ||
        "(empty response)";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${e.message || "Could not reach the AI assistant."}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* ── floating toggle button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform"
        title="ClinicalMind AI Assistant"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {/* ── chat panel ── */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex w-[360px] max-w-[calc(100vw-24px)] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
          style={{ height: "520px" }}>

          {/* header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#3a5bef] to-[#7c3aed] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold leading-none">ClinicalMind</p>
                <p className="text-[10px] opacity-70 mt-0.5">
                  {patientId ? "Patient context loaded ✓" : "General mode"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setMessages([])}
              title="Clear chat"
              className="rounded-lg p-1 hover:bg-white/20 transition-colors"
            >
              <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4b7eff]/15 to-[#7c3aed]/15">
                  <svg className="h-7 w-7 text-[#4b7eff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">ClinicalMind AI</p>
                  <p className="mt-1 text-xs text-gray-500 max-w-[220px]">
                    {patientId
                      ? "I have loaded this patient's records. Ask me anything about their history, notes, or treatment."
                      : "Ask me about therapy techniques, note writing, or navigate to a patient page for context-aware answers."}
                  </p>
                </div>
                {/* quick prompts */}
                {/* <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-[#4b7eff]/30 bg-[#4b7eff]/5 px-2.5 py-1 text-[11px] font-medium text-[#4b7eff] hover:bg-[#4b7eff]/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div> */}
              </div>
            )}

            {messages.map((m, i) => <Bubble key={i} msg={m} />)}

            {loading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-[#4b7eff] text-[10px] font-bold text-white">
                  AI
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-100 px-3.5 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* quick prompts row (when there are messages) */}
          {/* {messages.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto px-4 py-2 border-t border-gray-100 scrollbar-none">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:border-[#4b7eff]/40 hover:text-[#4b7eff] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )} */}

          {/* input */}
          <div className="flex items-end gap-2 border-t border-gray-100 px-3 py-3">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about this patient or any clinical topic…"
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4b7eff] focus:outline-none focus:bg-white transition-colors disabled:opacity-60"
              style={{ maxHeight: "96px" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 96) + "px";
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4b7eff] text-white shadow-sm hover:bg-[#3a6bef] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
