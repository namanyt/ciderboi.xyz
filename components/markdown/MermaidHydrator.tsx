"use client";

import mermaid from "mermaid";
import { useEffect } from "react";
import { brainMermaidConfig } from "@/lib/markdown/mermaid-config";

let initialized = false;

export function MermaidHydrator() {
  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: brainMermaidConfig.theme,
        themeVariables: brainMermaidConfig.themeVariables,
        flowchart: brainMermaidConfig.flowchart,
      });
      initialized = true;
    }

    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".brain-prose pre.mermaid:not([data-processed])"));

    if (nodes.length === 0) {
      return;
    }

    void mermaid.run({ nodes });
  }, []);

  return null;
}