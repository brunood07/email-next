"use client";

import { useEffect, useState } from "react";

type ResultCardProps = {
  label: string;
  text: string;
  onCopied: () => void;
};

export function ResultCard({ label, text, onCopied }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopied();
  }

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <article className="result-card">
      <header>
        <strong>{label}</strong>
      </header>
      <p>{text}</p>
      <button type="button" onClick={handleCopy}>
        {copied ? "Copiado! ✓" : "Copiar"}
      </button>
    </article>
  );
}
