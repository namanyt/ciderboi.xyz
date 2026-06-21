import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

function isMermaidSvg(id: unknown): boolean {
  return typeof id === "string" && id.startsWith("mermaid");
}

export function rehypeMermaidWrapper() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || typeof index !== "number") {
        return;
      }

      if (node.tagName !== "svg" || !isMermaidSvg(node.properties?.id)) {
        return;
      }

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["brain-mermaid", "not-prose"],
        },
        children: [node],
      };
    });
  };
}