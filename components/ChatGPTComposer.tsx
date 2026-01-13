"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;

  // Attach button (left "+")
  onAttach?: () => void;

  // Mic icon (small)
  onMicToggle?: () => void;
  micActive?: boolean;

  // Right big button (send / voice)
  rightMode?: "send" | "voice";
  onRightClick?: () => void;
  disabled?: boolean;

  placeholder?: string;
};

export default function ChatGPTComposer({
  value,
  onChange,
  onSend,
  onAttach,
  onMicToggle,
  micActive = false,
  rightMode = "send",
  onRightClick,
  disabled = false,
  placeholder = "Ask anything",
}: Props) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow like ChatGPT
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter newline (ChatGPT style)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  const rightClick = () => {
    if (disabled) return;
    if (onRightClick) return onRightClick();
    // default behavior
    if (rightMode === "send") onSend();
    else onMicToggle?.();
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div
          className={[
            "flex items-end gap-2",
            "rounded-full border border-gray-200 bg-white",
            "shadow-sm",
            "px-2 py-2",
          ].join(" ")}
        >
          {/* Left: + */}
          <button
            type="button"
            onClick={onAttach}
            disabled={disabled || !onAttach}
            className={[
              "h-10 w-10 shrink-0",
              "rounded-full",
              "grid place-items-center",
              "text-gray-700",
              "hover:bg-gray-100 active:bg-gray-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
            aria-label="Attach"
            title="Attach"
          >
            {/* plus icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90">
              <path
                fill="currentColor"
                d="M11 5a1 1 0 0 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5z"
              />
            </svg>
          </button>

          {/* Middle: textarea */}
          <div className="flex-1">
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              disabled={disabled}
              className={[
                "w-full resize-none",
                "bg-transparent",
                "outline-none",
                "text-sm sm:text-base",
                "px-2 py-2",
                "leading-6",
                "placeholder:text-gray-400",
                "disabled:opacity-60",
              ].join(" ")}
            />
            <div className="h-1" />
          </div>

          {/* Right small mic icon */}
          <button
            type="button"
            onClick={onMicToggle}
            disabled={disabled || !onMicToggle}
            className={[
              "h-10 w-10 shrink-0",
              "rounded-full",
              "grid place-items-center",
              micActive ? "text-blue-600" : "text-gray-700",
              "hover:bg-gray-100 active:bg-gray-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
            aria-label="Microphone"
            title="Microphone"
          >
            {/* mic icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90">
              <path
                fill="currentColor"
                d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 1 1 2 0a7 7 0 0 1-6 6.93V20h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2.07A7 7 0 0 1 5 11a1 1 0 1 1 2 0a5 5 0 0 0 10 0z"
              />
            </svg>
          </button>

          {/* Right big action button */}
          <button
            type="button"
            onClick={rightClick}
            disabled={disabled || (rightMode === "send" && !value.trim())}
            className={[
              "h-10 w-10 shrink-0",
              "rounded-full",
              "grid place-items-center",
              "bg-black text-white",
              "hover:bg-black/90 active:bg-black/80",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
            aria-label={rightMode === "send" ? "Send" : "Voice"}
            title={rightMode === "send" ? "Send" : "Voice"}
          >
            {rightMode === "send" ? (
              // send icon
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z"
                />
              </svg>
            ) : (
              // waveform icon
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M6 3h2v18H6V3zm10 4h2v10h-2V7zM10 7h2v10h-2V7zm8 2h2v6h-2V9zM4 9h2v6H4V9z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* tiny helper line like ChatGPT spacing */}
        <div className="h-3" />
      </div>
    </div>
  );
}
