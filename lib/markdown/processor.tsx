import { evaluate } from "@mdx-js/mdx";
import type { ReactNode } from "react";
import * as jsxDevRuntime from "react/jsx-dev-runtime";
import * as jsxRuntime from "react/jsx-runtime";
import { getMDXComponents } from "@/components/mdx";
import { rehypePlugins, remarkPlugins } from "@/lib/markdown/plugins";

type MDXContentComponent = (props: {
  components?: ReturnType<typeof getMDXComponents>;
}) => ReactNode;

const mdxRuntime = process.env.NODE_ENV === "production" ? jsxRuntime : { ...jsxRuntime, ...jsxDevRuntime };

export async function renderMarkdownBody(source: string): Promise<ReactNode> {
  type EvaluateOptions = NonNullable<Parameters<typeof evaluate>[1]>;

  const evaluatedModule = (await evaluate(source, {
    ...mdxRuntime,
    development: process.env.NODE_ENV !== "production",
    remarkPlugins: remarkPlugins as EvaluateOptions["remarkPlugins"],
    rehypePlugins: rehypePlugins as EvaluateOptions["rehypePlugins"],
  })) as { default: MDXContentComponent };

  const Content = evaluatedModule.default;
  return <Content components={getMDXComponents()} />;
}