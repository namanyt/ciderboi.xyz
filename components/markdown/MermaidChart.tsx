"use client";

import { useEffect, useId, useState } from "react";
import { brainMermaidConfig } from "@/lib/markdown/mermaid-config";

let initialized = false;
let renderCount = 0;

type MermaidChartProps = {
  chart: string;
};

export function MermaidChart({ chart }: MermaidChartProps) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chart.trim()) {
      setError("Diagram source is empty");
      return;
    }

    let cancelled = false;
    const renderId = `mermaid-${reactId}-${renderCount++}`;

    const render = async () => {
      try {
        const { default: mermaid } = await import("mermaid");

        if (!initialized) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "loose",
            theme: brainMermaidConfig.theme,
            themeVariables: brainMermaidConfig.themeVariables,
            flowchart: brainMermaidConfig.flowchart,
          });
          initialized = true;
        }

        const { svg: renderedSvg, bindFunctions } = await mermaid.render(renderId, chart.trim());

        if (cancelled) {
          return;
        }

        setSvg(renderedSvg);
        setError(null);

        requestAnimationFrame(() => {
          const node = document.getElementById(renderId);
          if (node) {
            bindFunctions?.(node);
          }
        });
      } catch (err) {
        if (cancelled) {
          return;
        }

        setSvg(null);
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <div className="brain-mermaid not-prose" role="img" aria-label="Mermaid diagram">
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!svg && !error ? <p className="text-sm text-gray-400">Rendering diagram…</p> : null}
      {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : null}
    </div>
  );
}