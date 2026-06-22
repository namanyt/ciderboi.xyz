import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

function hasClassName(className: unknown, token: string): boolean {
  if (typeof className === "string") {
    return className.split(/\s+/).includes(token);
  }

  if (Array.isArray(className)) {
    return className.includes(token);
  }

  return false;
}

function isMermaidSvg(id: unknown): boolean {
  return typeof id === "string" && id.startsWith("mermaid");
}

function wrapMermaid(node: Element): Element {
  return {
    type: "element",
    tagName: "div",
    properties: {
      className: ["brain-mermaid", "not-prose"],
    },
    children: [node],
  };
}

export function rehypeMermaidWrapper() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || typeof index !== "number") {
        return;
      }

      if (node.tagName === "pre" && hasClassName(node.properties?.className, "mermaid")) {
        parent.children[index] = wrapMermaid(node);
        return;
      }

      if (node.tagName === "svg" && isMermaidSvg(node.properties?.id)) {
        parent.children[index] = wrapMermaid(node);
      }
    });
  };
}