"use client";

// TypingHeadline — reveals the headline character-by-character (50ms/char)
// with a blinking caret; caret disappears when finished.

import { useEffect, useState } from "react";

export default function TypingHeadline({
  lines,
  className = "",
  charDelay = 50,
  startDelay = 400,
}: {
  lines: { text: string; className?: string }[];
  className?: string;
  charDelay?: number;
  startDelay?: number;
}) {
  const full = lines.map((l) => l.text).join("\n");
  const [count, setCount] = useState(0);
  const done = count >= full.length;

  useEffect(() => {
    let i = 0;
    let interval: number;
    const starter = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= full.length) window.clearInterval(interval);
      }, charDelay);
    }, startDelay);
    return () => {
      window.clearTimeout(starter);
      window.clearInterval(interval);
    };
  }, [full, charDelay, startDelay]);

  let consumed = 0;
  return (
    <h1 className={className} aria-label={full.replace("\n", " ")}>
      {lines.map((line, li) => {
        const start = consumed;
        consumed += line.text.length;
        const visible = Math.max(0, Math.min(line.text.length, count - start));
        const isActiveLine = count >= start && count < start + line.text.length;
        const isLastLine = li === lines.length - 1;
        return (
          <span key={li} className="block">
            <span className={`${line.className ?? ""} ${(isActiveLine || (done && isLastLine)) && !done ? "type-caret" : ""}`}>
              {line.text.slice(0, visible)}
            </span>
            {/* keep line height stable while empty */}
            {visible === 0 && <span className="invisible">.</span>}
          </span>
        );
      })}
    </h1>
  );
}
