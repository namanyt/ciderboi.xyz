import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import { rehypeMermaidWrapper } from "@/lib/markdown/rehype-mermaid-wrapper";

const prettyCodeOptions = {
  theme: "github-dark-default",
  keepBackground: false,
  onVisitLine(node: { children: unknown[] }) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
};

export const remarkPlugins = [remarkGfm, remarkMath, remarkMdx];

export const rehypePlugins = [
  rehypeSlug,
  rehypeKatex,
  rehypeMermaidWrapper,
  [rehypePrettyCode, prettyCodeOptions],
  [
    rehypeAutolinkHeadings,
    {
      behavior: "append",
      properties: {
        className: ["brain-heading-anchor"],
        "aria-label": "Jump to heading",
        title: "Jump to heading",
      },
    },
  ],
];