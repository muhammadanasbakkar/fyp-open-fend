// utils/cleanTranscript.ts
export function cleanTranscript(raw: string) {
  if (!raw) return "";

  // 1) Normalize spacing
  let t = raw.replace(/\s+/g, " ").trim();

  // 2) Common mishears you care about (extend as needed)
  const replacements: [RegExp, string][] = [
    [/hello\s*bo(?:ard|at)?/gi, "Hello Board"],
    [/\banus\b/gi, "Anas"],                 // name fix
  ];
  for (const [re, to] of replacements) t = t.replace(re, to);

  // 3) Collapse repeated n-grams (handles stutter like "hello my name is ..." x N)
  t = collapseRepeats(t, 6); // look back up to 6 words for repeats

  // 4) Basic sentence casing + punctuation
  t = autoPunct(t);

  return t;
}

function collapseRepeats(s: string, maxGram = 6) {
  const tokens = s.split(" ");
  const out: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    out.push(tokens[i]);
    for (let n = Math.min(maxGram, out.length); n >= 2; n--) {
      const end = out.length;
      const a = out.slice(end - n, end).join(" ").toLowerCase();
      const b = tokens.slice(i + 1, i + 1 + n).join(" ").toLowerCase();
      if (a && a === b) {
        // skip the next n tokens (dedupe)
        i += n;
        break;
      }
    }
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

function autoPunct(s: string) {
  // Add a period if missing at the end
  s = s.replace(/\s*([.?!])?$/, (m, p1) => (p1 ? p1 : "."));
  // Capitalize first letter after start or punctuation
  s = s.replace(/(^|[.?!]\s+)([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase());
  // Normalize “hello” at start
  s = s.replace(/^hello\b/i, "Hello");
  return s;
}
