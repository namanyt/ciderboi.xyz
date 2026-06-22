import katex from "katex";

type MathProps = {
  latex: string;
  display?: boolean;
};

export function Math({ latex, display = true }: MathProps) {
  const html = katex.renderToString(latex.trim(), {
    displayMode: display,
    throwOnError: false,
    strict: "ignore",
  });

  if (display) {
    return <span className="katex-display" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <span className="katex" dangerouslySetInnerHTML={{ __html: html }} />;
}