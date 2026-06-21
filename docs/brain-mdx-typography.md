# Brain MDX Typography Guide

This document explains how MDX content in Brain is written, how it renders on the website, and what each common element looks like in the current glassmorphic theme.

Rendered example:

![Brain home page screenshot](brain-mdx-typography.png)

Scope:

- Brain documents rendered through the MDX pipeline
- Typography and spacing from `app/globals.css`
- MDX custom components from `components/mdx/index.tsx`
- LaTeX math rendered with KaTeX through `remark-math` and `rehype-katex`
- GFM extensions such as tables, strikethrough, task lists, autolinks, and footnotes
- The centralized markdown pipeline in `lib/markdown/processor.tsx` and `lib/markdown/plugins.ts`
- The visual language used inside article bodies, callouts, code blocks, equations, embeds, and interactive content

## 1. What This System Is

Brain uses MDX so each document can mix normal markdown with React components.

That means a page is usually:

- metadata in frontmatter
- a normal markdown article
- LaTeX equations written directly in markdown
- optional custom components for special content

The document should read like a note or article first. Components are there to support the writing, not replace it. Equations are content too — write them in LaTeX, not as images or screenshots.

Rendering pipeline:

```text
content/*.mdx
  → remark-gfm
  → remark-math
  → remark-mdx
  → rehype-slug
  → rehype-katex
  → rehype-pretty-code
  → rehype-autolink-headings
  → React (server-rendered)
```

## 2. Content Model

Brain pages are written as MDX documents with frontmatter at the top and content underneath.

The important frontmatter fields are:

- `id`: stable identifier
- `title`: the visible page title
- `description`: short summary used in cards, metadata, and previews
- `category`: primary content group such as `projects`, `research`, `music`, or `setups`
- `created`: publish or creation date
- `updated`: optional update date
- `status`: optional status label such as `active`
- `visibility`: usually `public`
- `index`: whether the page should be indexed and included in Brain listings
- `featured`: whether the page should be promoted in the Brain home page
- `tags`: array of tags
- `related`: array of linked document ids
- `seoTitle`, `seoDescription`, `seoKeywords`: optional metadata overrides
- `featuredImage`: optional social/OG image

Artifact and downloadable-document fields:

- `documentType`: artifact label such as `resume` or `press-kit`
- `purpose`: short explanation shown in the artifact snapshot panel
- `version`: artifact version string
- `downloadPath`: absolute site path to a downloadable file such as `/downloads/resume.pdf`
- `downloadLabel`: button label for the download action
- `archiveLinks`: array of `{ title, href }` links back into the Brain Archive

### File placement and URLs

Brain content lives in the repository under `content/` as `.mdx` files.

Examples:

```text
content/setups/homelab.mdx        → /brain/setups/homelab
content/thoughts/me.mdx           → /brain/thoughts/me
content/experiments/math-rendering.mdx → /brain/experiments/math-rendering
```

Rules:

- the file path becomes the slug
- the first path segment becomes the default `category` when `category` is omitted
- `id` is the stable graph identifier; it does not have to match the slug, but keeping them aligned is simpler
- categories and tags are normalized to lowercase kebab-case

### Visibility and indexing

- `visibility: public` is required for a page to be reachable on the site
- `visibility: private` keeps a file in the repo but returns not found publicly
- `index: false` excludes the page from listings, search indexing, and static generation
- `featured: true` promotes the page on the Brain home page

Example:

```mdx
---
id: signal-notes
title: Signal Notes
description: Architecture notes for a reactive signal processing system.
category: research
created: 2026-06-15
updated: 2026-06-15
status: active
visibility: public
index: true
featured: true
tags:
  - signal
  - audio
  - workflow
related:
  - signal-processing-primer
  - envelope-mapping
---
```

Important distinction:

- `category` and `tags` are data fields
- they are not typography settings
- they should stay clean and semantic

## 3. Overall Reading Style

Inside the article body, Brain prose is intentionally calm and dense, not oversized or presentation-heavy.

The base prose rules are:

- body text is a light gray, not pure white
- line height is generous for long-form reading
- headings are bold and tight
- article spacing is controlled with predictable vertical rhythm
- links are underlined with a soft white decoration instead of a colored link style

On smaller screens, the type scale tightens slightly so long articles stay readable without feeling overly large.

## 4. Headings

Headings are the main structural signal in Brain.

### `# H1`

Use this once per document for the page title inside the article body.

Example:

```mdx
# Signal Notes
```

Appearance:

- very large
- bold
- tight letter spacing
- sits at the top of the article body
- visually matches the page title but remains part of the content flow

### `## H2`

Use this for major sections.

Example:

```mdx
## Overview
```

Appearance:

- large section heading
- a horizontal divider line appears above it
- more spacing above than below
- anchors are generated automatically for deep linking

### `### H3`

Use this for subsection blocks inside a larger section.

Example:

```mdx
### Signal Chain
```

Appearance:

- smaller than H2, still prominent
- bold
- tighter spacing than H2
- useful for nested structure inside a long note

### `#### H4`

Use this for minor labels or sub-subsections.

Example:

```mdx
#### Notes
```

Appearance:

- small, uppercase-feeling label
- muted gray
- spaced more like a section label than a headline

### Heading Anchors

Every H2-H4 gets an anchor icon appended by the renderer.

Appearance:

- the anchor is faint by default
- it becomes brighter on hover
- it is meant for copying deep links, not as decoration

## 5. Paragraphs and Body Text

Normal paragraphs are the default writing mode.

Example:

```mdx
Signal Notes explains how envelopes, smoothing, and mapping curves are combined into a stable reactive pipeline.
```

Appearance:

- light gray text
- comfortable line height
- slightly larger than default site text
- designed for long reading sessions

Use plain paragraphs when the content is explanatory, narrative, or technical.

## 6. Strong and Emphasis

### Strong text

Example:

```mdx
This is **important**.
```

Appearance:

- bright white
- slightly heavier weight
- stands out without becoming a color accent

### Emphasis

Example:

```mdx
This is _subtle_.
```

Appearance:

- italic emphasis, inherited from browser defaults
- stays within the same neutral palette

## 7. Links

Brain links are intentionally understated.

### Internal links

Example:

```mdx
See [Projects](/brain/projects) for implementation work or [Research](/brain/research) for deeper notes.
```

Appearance:

- white text at reduced emphasis
- underlined with a soft white decoration
- hover state brightens the text and underline

### External links

Example:

```mdx
Read the docs at [Matrix](https://matrix.org).
```

Appearance:

- same typography treatment as internal links
- open in a new tab by default through the MDX link component
- still feels part of the article instead of a separate UI pattern

## 8. Lists

### Unordered lists

Example:

```mdx
- Transport layer
- Inference layer
- Memory layer
```

Appearance:

- white/neutral bullets
- compact spacing between items
- used for short structured lists

### Ordered lists

Example:

```mdx
1. Collect context
2. Normalize inputs
3. Map the result
```

Appearance:

- standard numbered list styling
- same neutral text treatment as body copy
- useful for procedures and workflows

### Task lists

GFM task lists are supported.

Example:

```mdx
- [x] Parse markdown with remark-gfm
- [ ] Add theorem blocks
- [ ] Add equation cross-references
```

Appearance:

- standard list styling with checkbox inputs
- checked items render with the browser's native task-list appearance

### Nested lists

Nested lists work with normal markdown indentation:

```mdx
- Outer item
  - Inner item
  - Another inner item
- Back to outer level
```

## 9. GFM Extensions

Brain enables GitHub Flavored Markdown through `remark-gfm`.

Supported beyond standard markdown:

- tables
- strikethrough
- task lists
- autolink literals
- footnotes

### Strikethrough

Example:

```mdx
This approach is ~~deprecated~~ replaced by the new pipeline.
```

Appearance:

- struck-through text
- same neutral body color

### Autolink literals

Bare URLs in prose become links automatically.

Example:

```mdx
See https://matrix.org for the protocol reference.
```

Appearance:

- same link styling as explicit markdown links
- external URLs open in a new tab

### Footnotes

Example:

```mdx
KaTeX renders server-side.[^katex]

[^katex]: See the math section of this guide for syntax and supported features.
```

Appearance:

- footnote reference marker in prose
- footnote definitions collected at the bottom of the article

## 10. Blockquotes

Example:

```mdx
> Local-first is a constraint, not a slogan.
```

Appearance:

- frosted translucent panel
- left border in soft white
- slightly muted text
- reads like an inset note or quoted remark

Use blockquotes for:

- important definitions
- quoted statements
- callout-style emphasis without needing a custom component

## 11. Inline Code

Example:

```mdx
Use `category`, `tags`, and `slug` consistently.
```

Appearance:

- rounded mini pill
- translucent white background
- light border
- monospaced text
- slightly smaller than surrounding prose

Use inline code for:

- field names
- command names
- function names
- short literal values

## 12. Mathematical Equations

Brain treats equations as first-class content. Write LaTeX directly in markdown — the source file stays readable, and KaTeX renders academic-quality typography at build time.

No images, no SVG exports, no external equation editor, no client-side math engine.

### How it works

The markdown pipeline parses math automatically:

```text
Markdown
  → remark-gfm
  → remark-math
  → remark-mdx
  → rehype-katex
  → server-rendered HTML
```

Math works everywhere Brain MDX is rendered. No page-specific setup.

Live reference: [Math Rendering Demo](/brain/experiments/math-rendering)

### Inline math

Wrap short expressions in single dollar signs.

Example:

```mdx
Einstein showed that $E = mc^2$. The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.
```

Appearance:

- flows inside a paragraph like a word or phrase
- bright neutral text tuned for the dark theme
- slightly larger than body text for legibility

Use inline math for:

- variables and constants inside prose
- short formulas that should not break the reading line
- probability notation such as $P(A \mid B)$
- units and symbols such as $\omega$, $\sigma$, or $O(n \log n)$

### Display math

Wrap block equations in double dollar signs on their own lines.

Example:

```mdx
The Fourier transform is defined as:

$$
F(\omega) = \int_{-\infty}^{\infty} f(t)\,e^{-i\omega t}\,dt
$$

and can be applied to signal analysis.
```

Appearance:

- centered display block
- generous vertical spacing above and below
- bright white text
- horizontal scrolling on narrow screens when an equation is wide

Display math is the right choice for:

- important standalone formulas
- multi-line derivations
- matrices and aligned equation blocks
- anything that should read like a textbook equation

### Common LaTeX patterns

Fractions:

```mdx
$\frac{a}{b}$
```

Summations and products:

```mdx
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

Integrals:

```mdx
$$
\int_a^b f(x)\,dx
$$
```

Matrices:

```mdx
$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$
```

Piecewise functions:

```mdx
$$
f(x) =
\begin{cases}
x^2 & \text{if } x \geq 0 \\
-x & \text{if } x < 0
\end{cases}
$$
```

Aligned derivations:

```mdx
$$
\begin{aligned}
ax^2 + bx + c &= 0 \\
x &= \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
\end{aligned}
$$
```

Numbered equations:

```mdx
$$
e^{i\theta} = \cos\theta + i\sin\theta \tag{1}
$$
```

### Mixing math with other markdown

Equations work alongside the rest of Brain typography:

- headings
- paragraphs
- lists
- tables
- code blocks
- callouts

Example:

```mdx
The loss function is:

$$
L(\theta) = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2
$$

| Symbol | Meaning |
| --- | --- |
| $\theta$ | Model parameters |
| $\hat{y}_i$ | Predicted value |
```

### Mobile behavior

Wide equations are never shrunk or scaled down. On phones, display math scrolls horizontally instead. That keeps academic typography intact.

### Authoring rules

Do:

- keep the markdown source as the canonical equation source
- use inline math for short in-sentence expressions
- use display math for important block formulas
- preview wide equations on mobile

Do not:

- embed equations as screenshots or generated images
- hand-write equation HTML
- rely on a separate math editor or client-side rendering

### Supported scope

KaTeX covers the LaTeX most technical writing needs:

- fractions, roots, and exponents
- Greek letters and operators
- sums, products, integrals, and limits
- matrices, vectors, and linear algebra
- probability and statistics notation
- piecewise and aligned environments
- `\tag{}` for numbered display equations

Not yet supported in Brain:

- `\label{}` and `\ref{}` cross-references
- theorem or proof blocks
- MathJax-only extensions outside KaTeX

For a full visual catalog of what renders today, see [Math Rendering Demo](/brain/experiments/math-rendering).

## 13. Code Blocks

Code blocks are one of the most polished parts of the Brain renderer.

### Standard fenced code

Example:

````mdx
```ts
export function mapEnergy(v: number) {
  const clamped = Math.max(0, Math.min(1, v));
  return Math.pow(clamped, 1.6);
}
```
````

````

Appearance:
- glass card container
- translucent white background
- soft border
- rounded corners
- blurred backdrop
- title strip at the top when a filename is provided
- copy button in the top-right corner
- syntax highlighted through Shiki when highlighting succeeds

### With filename

Example:

```mdx
<CodeBlock language="ts" filename="mapping.ts">
  {`export function mapEnergy(v: number) {
  const clamped = Math.max(0, Math.min(1, v));
  return Math.pow(clamped, 1.6);
}`}
</CodeBlock>
````

Appearance:

- header row shows the filename on the left
- language label appears next to the filename
- copy button remains visible in the header
- code area stays wide and scrollable on overflow

### Highlighting behavior

Pretty-code line highlighting is supported.

Appearance details:

- highlighted lines receive a soft white background
- highlighted characters get a subtle glow-like block
- line numbers and code body remain readable against the glass panel

### Code fence metadata

Fenced code blocks support `rehype-pretty-code` metadata after the language identifier.

Title:

````mdx
```ts title="mapping.ts"
export function mapEnergy(v: number) {
  return Math.pow(v, 1.6);
}
```
````

Line highlighting:

````mdx
```ts {2,4-5}
const clamped = Math.max(0, Math.min(1, v));
return Math.pow(clamped, 1.6);
```
````

Character highlighting:

````mdx
```ts /Math.pow/
return Math.pow(clamped, 1.6);
```
````

Appearance:

- titles render in the code block header strip
- highlighted lines and characters use the soft white emphasis styles defined in `app/globals.css`
- every pretty-code figure also gets a copy button in the top-right corner

## 14. Standard Markdown Images

Use normal markdown image syntax for single images in prose.

Example:

```mdx
![Homelab rack under the stairs](/pictures/homelab/rack.jpg)
```

Appearance:

- rounded glass frame
- soft border and shadow
- lazy-loaded image
- click opens a zoom modal with in/out controls and reset
- default aspect ratio is `4/3` with `object-cover` when no custom classes are provided

This is the default image path for article illustrations. Use `ImageGallery` or `PhotoGrid` when you need multiple images in a composed layout.

## 15. MDX Authoring Notes

Brain content is MDX, not plain markdown. That means normal markdown and JSX components can coexist in the same file.

### JSX components

All custom Brain components are available directly in MDX without imports:

- `Callout`, `InfoBox`, `WarningBox`, `SuccessBox`, `NoteBox`
- `CodeBlock`
- `ImageGallery`, `PhotoGrid`
- `Timeline`, `ExpandableSection`
- `YouTubeEmbed`, `SpotifyEmbed`, `VideoEmbed`
- `ProjectStatus`, `FileDownload`, `LinkCard`

### MDX comments

Use JSX comments for notes that should not render:

```mdx
{/* <FileDownload href="/downloads/resume.pdf" label="Download Resume PDF" /> */}
```

### Native collapsible sections

You can use either the `ExpandableSection` component or native HTML:

```mdx
<details>
  <summary>Hidden implementation detail</summary>

  Extra detail that should not interrupt the main reading flow.
</details>
```

Appearance:

- native `details` blocks use the same prose spacing rules as the rest of the article
- `ExpandableSection` adds the Brain glass panel styling

## 16. Document Linking and Table of Contents

Brain builds navigation and relationships from your writing automatically.

### Internal links in markdown

Link to other Brain pages with absolute site paths:

```mdx
See [Homelab](/brain/setups/homelab) for the infrastructure history.
```

These links do two things:

- render as normal internal links in the article
- create backlinks and knowledge-graph `references` edges to the target page

### `related` frontmatter

Use `related` when a page should be connected by document id even if the body does not link to it directly:

```yaml
related:
  - homelab
  - about
```

This powers the Related Pages section and graph `relatedTo` edges.

### Table of contents

The page sidebar and mobile TOC are generated from headings in the markdown source:

- included: `##`, `###`, `####`
- excluded: `#` and headings deeper than H4
- heading ids are slugified for anchor links
- H2-H4 also receive appended anchor links in the article body

Write headings as plain text when possible. Link syntax inside a heading is stripped for TOC labels.

## 17. Artifact Document Pages

When a page is a downloadable artifact, frontmatter can drive a dedicated snapshot panel above the article body.

Trigger conditions:

- `downloadPath` is set
- or `category: documents`

Example:

```mdx
---
id: resume
title: Resume
category: documents
documentType: resume
purpose: Condensed artifact for recruiters and collaborators.
version: 2026.06
downloadPath: /downloads/resume.pdf
downloadLabel: Download Resume PDF
archiveLinks:
  - title: About Me
    href: /brain/thoughts/me
---
```

Appearance:

- cyan-tinted snapshot card in the page header
- document type and purpose rendered as summary metadata
- optional version and updated date chips
- primary download button when `downloadPath` is present
- optional archive trace-back links from `archiveLinks`

You can still use `FileDownload` or `LinkCard` inside the article body when you want inline actions or related-page cards.

## 18. Callout Boxes and Notes

Brain includes custom boxes for semantic emphasis.

These components all share the same neutral glass language:

- translucent white background
- soft white border
- rounded corners
- blurred backdrop
- light text

### `Callout`

Example:

```mdx
<Callout>This is the place to explain what the note is doing and why it exists.</Callout>
```

Appearance:

- neutral boxed note
- strongest when used for key context or warnings about interpretation

### `InfoBox`

Example:

```mdx
<InfoBox title="Build Note">This note uses the local MDX renderer and neutral glass styling.</InfoBox>
```

Appearance:

- compact info panel
- title in small uppercase text
- body text underneath with enough spacing to breathe

### `WarningBox`

Example:

```mdx
<WarningBox title="Caution">This is experimental and may change.</WarningBox>
```

Appearance:

- same glass panel structure
- visually neutral in the current theme, not loud red/yellow
- the title carries the warning meaning more than the color does

### `SuccessBox`

Example:

```mdx
<SuccessBox title="Complete">The build passed and the route is stable.</SuccessBox>
```

Appearance:

- same neutral panel treatment
- good for positive status, completion notes, or confirmed behavior

### `NoteBox`

Example:

```mdx
<NoteBox title="Implementation Detail">The renderer should stay readable before it becomes decorative.</NoteBox>
```

Appearance:

- soft note block
- best for side observations and implementation reminders

## 19. Status Pills

Example:

```mdx
<ProjectStatus status="active" updated="2026-06-15" />
```

Appearance:

- inline pill-style badge
- rounded full border
- translucent glass fill
- small status dot at the left
- uppercase, compact, and easy to scan

Use this for:

- project lifecycle
- active/inactive states
- lightweight metadata inside a document

## 20. Timeline

Example:

```mdx
<Timeline
  items={[
    { title: "Transport Layer", date: "2026-03", description: "Matrix room + bridge strategy" },
    { title: "Inference Layer", date: "2026-04", description: "llama.cpp runtime with model fallback" },
    { title: "Memory Layer", description: "hybrid retrieval + compact long-term graph" },
  ]}
/>
```

Appearance:

- vertical timeline with a left border line
- dots for each item
- title is bold white text
- date is small uppercase muted text
- description is lighter gray and slightly smaller

Best use:

- architecture phases
- release history
- setup steps with progression

## 21. Expandable Sections

Example:

```mdx
<ExpandableSection title="Implementation Notes">
  More detail can live here without interrupting the main flow.
</ExpandableSection>
```

Appearance:

- collapsible glass panel
- border and blur match the rest of Brain
- summary text is bold
- content reveals underneath with breathing room

Use expandable sections for:

- deep implementation details
- secondary material
- anything the reader may want to skip initially

## 22. Media Embeds

### YouTube

Example:

```mdx
<YouTubeEmbed id="dQw4w9WgXcQ" title="Demo" />
```

Appearance:

- rounded embed frame
- translucent border
- blurred glass backdrop
- maintains video aspect ratio

### Spotify

Example:

```mdx
<SpotifyEmbed id="track/12345" />
<SpotifyEmbed id="album/abcdef" />
<SpotifyEmbed id="playlist/zyxwvu" />
```

The `id` is the Spotify embed path after `/embed/`, such as `track/...`, `album/...`, or `playlist/...`.

Appearance:

- same glass frame language
- fixed-height embed area
- designed to blend into a long-form note rather than look like a foreign widget

### Generic video

Example:

```mdx
<VideoEmbed src="https://example.com/embed/video" title="Demo video" />
```

Appearance:

- glass container
- 16:9 responsive ratio
- suitable for demos and walkthroughs

## 23. Image Grids

### ImageGallery

Example:

```mdx
<ImageGallery
  images={[
    { src: "/pictures/embed/home.png", alt: "Home view" },
    { src: "/pictures/embed/detail.png", alt: "Detail view" },
  ]}
/>
```

Appearance:

- 2-column grid on larger screens
- single-image galleries collapse to one centered column with a wider max width
- soft rounded corners
- light border on each image
- each image uses the same click-to-zoom behavior as standard markdown images
- spacing is modest so the gallery feels part of the article

### PhotoGrid

Example:

```mdx
<PhotoGrid
  images={[
    { src: "/pictures/embed/a.png", alt: "Shot A" },
    { src: "/pictures/embed/b.png", alt: "Shot B" },
    { src: "/pictures/embed/c.png", alt: "Shot C" },
  ]}
/>
```

Appearance:

- denser grid than `ImageGallery`
- square crops
- each image uses the same click-to-zoom behavior as standard markdown images
- best for photographic contact sheets or compact visual references

## 24. Download and Link Cards

### FileDownload

Example:

```mdx
<FileDownload href="/files/mapping.pdf" label="Download mapping notes" />
```

Appearance:

- inline download button
- glass border and fill
- compact and obvious as a file action

### LinkCard

Example:

```mdx
<LinkCard href="https://matrix.org" title="Matrix" description="Protocol reference" />
<LinkCard href="/brain/thoughts/me" title="About Me" description="The root node of the archive." />
```

Appearance:

- large linked card
- subtle hover state
- good for related resources and prominent in-article navigation cards

Note:

- `LinkCard` always opens in a new tab, including internal `/brain/...` links
- for normal in-article navigation, prefer markdown links instead

## 25. Tables

Markdown tables render as framed panels with a subtle tinted background.

Example:

```mdx
| Layer     | Purpose         |
| --------- | --------------- |
| Transport | Message routing |
| Memory    | State retention |
```

Appearance:

- boxed table container
- soft translucent background
- padded cells
- muted header row
- readable, but not meant to dominate the page

## 26. Horizontal Rules

Example:

```mdx
---
```

Appearance:

- wide divider
- soft white line
- used to split long sections without introducing a new component

## 27. Typography Tone Rules

When writing Brain MDX, keep the tone of the page aligned with the visuals:

- direct, technical, and intentional
- not overly ornate
- not SEO-heavy inside the body
- not documentation-for-the-sake-of-documentation

The design language is neutral glass, so the writing should also be clean and structured.

Good writing patterns:

- clear section titles
- short introductory paragraphs
- mixed prose and component blocks
- linked references instead of repeated explanations

Avoid:

- giant walls of text without headings
- unnecessary emoji in the body
- decorative component overload
- color language that assumes the old blue/navy theme

## 28. URL and Data Rules

This repository keeps Brain URLs and data structures predictable.

Use:

- `category` for the document's grouping field
- `tags` for cross-cutting labels
- clean route names for categories
- explicit tag paths when linking tags

Common route patterns:

```mdx
/brain/setups/homelab
/brain/tag/homelab
/brain/experiments
```

Linking rules:

- use `/brain/...` paths for internal article links
- use `related` in frontmatter for graph relationships by document `id`
- markdown links to Brain pages create backlinks automatically
- tag links use `/brain/tag/<tag>`
- category index pages use `/brain/<category>`

Search and previews:

- `description` is used in cards, metadata, and previews
- if `description` is omitted, the system falls back to the first plain-text excerpt of the body
- code blocks, inline code, math, and markup are stripped from that plain-text excerpt

Do not encode personality into URL paths or schema names.
Personality belongs in copy, titles, and the writing itself.

## 29. Practical Authoring Checklist

Before publishing a Brain document:

- confirm the file lives under `content/` with a `.mdx` extension
- confirm the frontmatter is complete
- choose one clear H1
- break content with H2s and H3s so the table of contents stays useful
- use code blocks only for actual code or structured output
- use `$...$` for inline math and `$$...$$` for display math instead of equation images
- use standard markdown images or `ImageGallery` / `PhotoGrid` instead of raw HTML `<img>`
- use callouts for important notes, not every note
- link related Brain pages with `/brain/...` markdown links instead of repeating them
- add `related` ids when a page should be connected but not explicitly linked in prose
- set `downloadPath` and artifact fields when the page is a downloadable document
- preview the page on mobile and desktop, including wide equations and code blocks

## 30. Visual Summary

A finished Brain MDX page should look like this:

- a strong title and concise description at the top
- soft neutral glass panels for notes and code
- readable prose with comfortable spacing
- LaTeX equations rendered inline and as centered display blocks
- zoomable images and glass-framed media embeds
- optional artifact snapshot panel for downloadable documents
- muted anchors and inline links
- a table of contents generated from H2-H4 headings
- enough hierarchy to scan quickly, but not so much contrast that it feels like a separate product

If the page feels more like a glossy docs site than a page inside ciderboi.xyz, it is probably too cold or too blue.
