"use client";

import { useState } from "react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-gray-100 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20 hover:text-white"
      aria-label="Copy code block"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
