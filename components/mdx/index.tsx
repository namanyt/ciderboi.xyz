import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { isValidElement } from "react";
import Link from "next/link";
import { codeToHtml } from "shiki";
import { CopyCodeButton } from "@/components/mdx/CopyCodeButton";
import { ZoomImage } from "@/components/mdx/ZoomImage";
import { cn } from "@/lib/utils";

type BoxTone = "info" | "warning" | "success" | "note";

type BoxProps = {
  title?: string;
  children: ReactNode;
};

function toneClasses(tone: BoxTone): string {
  switch (tone) {
    case "warning":
      return "border-white/20 bg-white/10 text-gray-100";
    case "success":
      return "border-white/20 bg-white/10 text-gray-100";
    case "note":
      return "border-white/20 bg-white/10 text-gray-100";
    default:
      return "border-white/20 bg-white/10 text-gray-100";
  }
}

function GenericBox({ title, children, tone }: BoxProps & { tone: BoxTone }) {
  return (
    <aside className={`my-8 max-w-full overflow-x-hidden rounded-2xl border px-5 py-4 text-sm leading-7 backdrop-blur-sm ${toneClasses(tone)}`}>
      {title ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">{title}</p> : null}
      <div className="space-y-3">{children}</div>
    </aside>
  );
}

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => getTextContent(child)).join("");
  }

  if (isValidElement(node)) {
    return getTextContent((node.props as { children?: ReactNode }).children);
  }

  return "";
}

function CodeFigure(props: ComponentPropsWithoutRef<"figure">) {
  const isPrettyCodeFigure = "data-rehype-pretty-code-figure" in (props as Record<string, unknown>);

  if (!isPrettyCodeFigure) {
    return <figure {...props} />;
  }

  const rawCode = getTextContent(props.children).replace(/\u200B/g, "").trimEnd();

  return (
    <figure {...props} className={cn("brain-code-figure not-prose relative", props.className)}>
      {props.children}
      <div className="absolute right-3 top-3 z-10">
        <CopyCodeButton code={rawCode} />
      </div>
    </figure>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return <GenericBox tone="info" title="Callout">{children}</GenericBox>;
}

export function InfoBox({ title = "Info", children }: BoxProps) {
  return <GenericBox tone="info" title={title}>{children}</GenericBox>;
}

export function WarningBox({ title = "Warning", children }: BoxProps) {
  return <GenericBox tone="warning" title={title}>{children}</GenericBox>;
}

export function SuccessBox({ title = "Success", children }: BoxProps) {
  return <GenericBox tone="success" title={title}>{children}</GenericBox>;
}

export function NoteBox({ title = "Note", children }: BoxProps) {
  return <GenericBox tone="note" title={title}>{children}</GenericBox>;
}

export async function CodeBlock({
  language,
  filename,
  children,
}: {
  language?: string;
  filename?: string;
  children: ReactNode;
}) {
  const rawCode = getTextContent(children).replace(/^\n+|\n+$/g, "");
  let highlightedHtml: string | null = null;

  try {
    highlightedHtml = await codeToHtml(rawCode, {
      lang: language ?? "text",
      theme: "github-dark-default",
    });
  } catch {
    highlightedHtml = null;
  }

  return (
    <figure className="brain-code-figure not-prose relative my-8 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-xs text-gray-300">
        <div className="min-w-0">
          <span className="font-medium text-white/90">{filename ?? "snippet"}</span>
          {language ? <span className="ml-2 text-gray-500">{language}</span> : null}
        </div>
        <CopyCodeButton code={rawCode} />
      </div>
      {highlightedHtml ? (
        <div className="brain-manual-code" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      ) : (
        <pre className="max-w-full overflow-x-auto p-4 text-sm text-gray-100">
          <code>{children}</code>
        </pre>
      )}
    </figure>
  );
}

export function ImageGallery({ images = [] }: { images: Array<{ src: string; alt?: string }> }) {
  const isSingleImage = images.length === 1;
  const columnsClass = isSingleImage ? "sm:grid-cols-1" : "sm:grid-cols-2";
  const imageClassName = "aspect-[4/3] w-full object-cover";

  return (
    <div className={cn("my-8 grid gap-4", columnsClass)}>
      {images.map((image, index) => (
        <div key={`${image.src}-${index}`} className={cn("h-full", isSingleImage && "mx-auto w-full max-w-4xl")}>
          <ZoomImage
            src={image.src}
            alt={image.alt ?? "Gallery image"}
            className={imageClassName}
          />
        </div>
      ))}
    </div>
  );
}

export function PhotoGrid({ images = [] }: { images: Array<{ src: string; alt?: string }> }) {
  return (
    <div className="my-8 grid grid-cols-2 gap-3 md:grid-cols-3">
      {images.map((image, index) => (
        <div key={`${image.src}-${index}`} className="h-full">
          <ZoomImage
            src={image.src}
            alt={image.alt ?? "Photo"}
            className="aspect-square w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function Timeline({ items = [] }: { items: Array<{ title: string; date?: string; description?: string }> }) {
  return (
    <ol className="my-8 mx-8 list-none space-y-5 pl-0">
      {items.map((item, index) => (
        <li key={`${item.title}-${item.date ?? ""}`} className="relative pl-10">
          {index < items.length - 1 ? <span aria-hidden className="absolute -bottom-[1.9375rem] left-2 top-[0.6875rem] w-px bg-white/15" /> : null}
          <span className="absolute left-[0.24412555rem] ml-[0.0007rem] top-1.5 h-2.5 w-2.5 rounded-full bg-white/70" />
          <p className="text-base font-semibold text-white">{item.title}</p>
          {item.date ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">{item.date}</p> : null}
          {item.description ? <p className="mt-2 text-sm leading-7 text-gray-200">{item.description}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export function ExpandableSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="my-6 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <summary className="cursor-pointer font-medium text-white">{title}</summary>
      <div className="mt-3 text-sm text-gray-200">{children}</div>
    </details>
  );
}

export function YouTubeEmbed({ id, title = "YouTube video" }: { id: string; title?: string }) {
  return (
    <div className="my-6 max-w-full aspect-video overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function SpotifyEmbed({ id }: { id: string }) {
  return (
    <div className="my-6 max-w-full overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
      <iframe
        src={`https://open.spotify.com/embed/${id}`}
        className="h-[152px] w-full"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}

export function VideoEmbed({ src, title = "Video embed" }: { src: string; title?: string }) {
  return (
    <div className="my-6 max-w-full aspect-video overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
      <iframe src={src} title={title} className="h-full w-full" loading="lazy" allowFullScreen />
    </div>
  );
}

export function ProjectStatus({ status, updated }: { status: string; updated?: string }) {
  return (
    <div className="my-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-gray-100">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      {status}
      {updated ? <span className="text-gray-400">Updated {updated}</span> : null}
    </div>
  );
}

export function FileDownload({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="my-4 inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
      download
    >
      {label}
    </a>
  );
}

export function LinkCard({ href, title, description }: { href: string; title: string; description?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="my-4 block rounded-xl border border-white/20 bg-white/5 p-4 transition hover:bg-white/10"
    >
      <p className="font-semibold text-white">{title}</p>
      {description ? <p className="mt-1 text-sm text-gray-300">{description}</p> : null}
    </a>
  );
}

function CustomAnchor(props: ComponentPropsWithoutRef<"a">) {
  const href = props.href ?? "";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className="font-medium text-white/90 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white/60">
        {props.children}
      </Link>
    );
  }

  return (
    <a
      {...props}
      target={props.target ?? "_blank"}
      rel={props.rel ?? "noreferrer"}
      className="font-medium text-white/90 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white/60"
    />
  );
}

export function getMDXComponents() {
  return {
    a: CustomAnchor,
    img: ZoomImage,
    figure: CodeFigure,
    Callout,
    CodeBlock,
    ImageGallery,
    PhotoGrid,
    Timeline,
    ExpandableSection,
    YouTubeEmbed,
    SpotifyEmbed,
    VideoEmbed,
    ProjectStatus,
    FileDownload,
    LinkCard,
    InfoBox,
    WarningBox,
    SuccessBox,
    NoteBox,
  };
}
