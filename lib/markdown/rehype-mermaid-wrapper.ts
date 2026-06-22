import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

function toDiagramText(node: Element): string {
  const chunks: string[] = [];

  const walk = (current: Element) => {
    for (const child of current.children) {
      if (child.type === "text") {
        chunks.push(child.value);
      } else if (child.type === "element") {
        walk(child);
      }
    }
  };

  walk(node);
  return chunks.join("");
}

function hasClassName(className: unknown, token: string): boolean {
  if (typeof className === "string") {
    return className.split(/\s+/).includes(token);
  }

  if (Array.isArray(className)) {
    return className.includes(token);
  }

  return false;
}

function isMermaidPreBlock(node: Element): boolean {
  return node.tagName === "pre" && hasClassName(node.properties?.className, "mermaid");
}

function isMermaidCodeBlock(node: Element): boolean {
  return node.tagName === "code" && hasClassName(node.properties?.className, "language-mermaid");
}

function toMermaidChart(diagram: string): Element {
  return {
    type: "element",
    tagName: "MermaidChart",
    properties: {
      chart: diagram,
    },
    children: [],
  };
}

export function rehypeMermaidWrapper() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || typeof index !== "number") {
        return;
      }

      if (isMermaidPreBlock(node)) {
        parent.children[index] = toMermaidChart(toDiagramText(node));
        return;
      }

      if (node.tagName !== "pre") {
        return;
      }

      const mermaidCode = node.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "code" && isMermaidCodeBlock(child),
      );

      if (mermaidCode) {
        parent.children[index] = toMermaidChart(toDiagramText(node));
      }
    });
  };
}