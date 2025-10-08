// app/hooks/useSpeechToText.ts
import { useCallback, useEffect, useRef, useState } from "react";

type ResultMode = "final-only" | "interim+final";

export function useSpeechToText({
  lang = "en-US",
  continuous = true,
  interimResults = true,
  resultMode = "interim+final" as ResultMode,
} = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR: any =
      (globalThis as any).SpeechRecognition ||
      (globalThis as any).webkitSpeechRecognition;
    if (!SR) return setSupported(false);
    setSupported(true);

    const rec = new SR();
    rec.lang = lang;
    rec.continuous = continuous;
    rec.interimResults = interimResults;

    rec.onstart = () => {
      setListening(true);
      setError(null);
    };
    rec.onerror = (e: any) => {
      setError(e?.error || "speech-error");
    };
    rec.onend = () => {
      setListening(false);
    };
    rec.onresult = (event: any) => {
      let interimText = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += chunk + " ";
        } else {
          interimText += chunk + " ";
        }
      }

      if (resultMode === "interim+final") setInterim(interimText.trim());
      if (finalChunk) {
        setFinalText((prev) => (prev ? prev + " " : "") + finalChunk.trim());
      }
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.onstart = rec.onresult = rec.onerror = rec.onend = null;
        rec.stop?.();
      } catch {}
      recognitionRef.current = null;
    };
  }, [lang, continuous, interimResults, resultMode]);

  const start = useCallback(() => {
    setError(null);
    setInterim("");
    setFinalText("");
    recognitionRef.current?.start?.();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop?.();
  }, []);

  return {
    supported,
    listening,
    error,
    interim,
    finalText, // append this into your textarea
    start,
    stop,
    setLang: (l: string) => {
      if (recognitionRef.current) recognitionRef.current.lang = l;
    },
  };
}
