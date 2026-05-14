"use client";

import { useEffect, useRef, useState } from "react";
import { useSpeechToText } from "@/app/hooks/useSpeechToText";

// Shared WYSIWYG editor — toolbar + contentEditable area, no extra deps.
// Stores HTML. Backwards-compatible with plain-text legacy content (rendered
// as-is; line breaks preserved in CSS via `whitespace-pre-wrap` on read view).
//
// Visual styling lives in globals.css under the `.rich-editor` / `.rich-content`
// selectors so the editor and read view stay visually consistent.
export default function RichField({
  label,
  hint,
  value,
  onChange,
  rows = 5,
  disabled,
  soapTag,
  tagColor = "gray",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  disabled?: boolean;
  soapTag?: string;
  tagColor?: "blue" | "emerald" | "violet" | "amber" | "gray";
}) {
  const tagCls: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };

  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  function emit() {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
  }

  function exec(cmd: string, arg?: string) {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  }

  const {
    supported: sttSupported,
    listening,
    finalText,
    interim,
    error: sttError,
    start,
    stop,
  } = useSpeechToText({ continuous: true, interimResults: true });

  const lastFinalRef = useRef("");
  useEffect(() => {
    if (!finalText || finalText === lastFinalRef.current) return;
    const newPart = finalText.slice(lastFinalRef.current.length).trim();
    lastFinalRef.current = finalText;
    if (!newPart || !editorRef.current) return;
    const sep = editorRef.current.innerText.trim() ? " " : "";
    document.execCommand("insertText", false, sep + newPart);
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalText]);

  function toggleMic() {
    if (disabled) return;
    if (listening) stop();
    else {
      lastFinalRef.current = "";
      start();
    }
  }

  const ToolbarBtn = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-xs font-semibold transition-colors",
        "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );

  const showInterim = listening && interim;

  return (
    <div
      className={[
        "rounded-xl border bg-white shadow-sm transition-colors",
        focused ? "border-[#4b7eff]/60 ring-2 ring-[#4b7eff]/15" : "border-gray-200",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 bg-gray-50/60 px-3 py-2">
        <div className="flex items-start gap-2 min-w-0">
          {soapTag && (
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ring-1 ${tagCls[tagColor]}`}
              aria-hidden
            >
              {soapTag}
            </span>
          )}
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-800 leading-tight">{label}</label>
            {hint && <p className="mt-0.5 text-[11px] text-gray-500 leading-tight">{hint}</p>}
          </div>
        </div>
        {sttSupported && !disabled && (
          <button
            type="button"
            onClick={toggleMic}
            title={listening ? "Stop dictation" : "Dictate into this field"}
            aria-pressed={listening}
            className={[
              "shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              listening
                ? "bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse"
                : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] hover:ring-[#4b7eff]/30",
            ].join(" ")}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {listening ? "Rec" : "Mic"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-white px-2 py-1">
        <ToolbarBtn onClick={() => exec("bold")} title="Bold (Ctrl+B)">
          <span className="font-bold">B</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("italic")} title="Italic (Ctrl+I)">
          <span className="italic">I</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("underline")} title="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => exec("formatBlock", "h3")} title="Heading">H</ToolbarBtn>
        <ToolbarBtn onClick={() => exec("formatBlock", "p")} title="Paragraph">P</ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bulleted list">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75v-.008zm0 5.25h.007v.008H3.75V17.25zM8.25 6.75h12M8.25 12h12M8.25 17.25h12" />
          </svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Numbered list">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zM3.75 12h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
          </svg>
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => exec("outdent")} title="Outdent">‹</ToolbarBtn>
        <ToolbarBtn onClick={() => exec("indent")} title="Indent">›</ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => exec("removeFormat")} title="Clear formatting">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </ToolbarBtn>
        <span className="ml-auto" />
        <ToolbarBtn onClick={() => exec("undo")} title="Undo (Ctrl+Z)">↶</ToolbarBtn>
        <ToolbarBtn onClick={() => exec("redo")} title="Redo (Ctrl+Y)">↷</ToolbarBtn>
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={() => { setFocused(false); emit(); }}
        onFocus={() => setFocused(true)}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
        className="rich-editor block w-full overflow-y-auto rounded-b-xl px-3.5 py-3 text-sm leading-relaxed text-gray-900 focus:outline-none"
        style={{ minHeight: `${Math.max(120, rows * 24)}px`, maxHeight: "320px" }}
        aria-label={label}
        data-placeholder={hint || `Enter ${label.toLowerCase()}…`}
      />
      {showInterim && (
        <p className="border-t border-gray-100 px-3 py-1.5 text-[11px] italic text-gray-400 truncate" title={interim}>
          …{interim}
        </p>
      )}
      {sttError && listening && (
        <p className="border-t border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] text-red-600">Mic error: {sttError}</p>
      )}
    </div>
  );
}

// Read-only renderer for HTML stored by RichField. Uses the same `.rich-content`
// styles so display matches the editor. Plain-text legacy content also renders
// fine (no tags = passes through as text).
export function RichView({
  value,
  className,
  emptyLabel = "Not recorded",
}: {
  value: string;
  className?: string;
  emptyLabel?: string;
}) {
  const empty =
    !value ||
    String(value)
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<p>\s*<\/p>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/ |&nbsp;/g, "")
      .trim().length === 0;

  if (empty) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5 text-sm italic text-gray-400">
        {emptyLabel}
      </p>
    );
  }
  return (
    <div
      className={[
        "rich-content rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 leading-relaxed",
        className || "",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}
