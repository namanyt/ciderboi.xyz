# Presentation Specification: ciderboi.xyz Homepage

This specification redesigns the content presentation of the 7 homepage chapters (`src/pages/index.astro`) to elevate the site from a flat text document into a tactile, high-impact systems engineering and creative portfolio.

---

## Global System Rules

1. **Max Content Width**: Hard boundary at `720px` (`max-w-[720px]`) inside the stage viewport to prevent expansive line lengths and maintain dense, deliberate composition.
2. **Typography Floor**: 
   - Body copy: strictly **≥ 15px** (`text-[15px]` or `text-[16px]`), line-height 1.5–1.6.
   - Metadata / Tags / Telemetry: strictly **≥ 11px** (`text-[11px]` or `text-[12px]`), uppercase with `tracking-[0.08em]` to `tracking-[0.14em]`. Never drop to 8px–10px microtext.
3. **Palette Tokens**: 
   - `--color-paper` (`#e8e2d9`): primary headers, high-contrast values, dominant text.
   - `--color-dim` (`#8d8880`): metadata, borders, secondary descriptions (`text-paper/70` or `text-dim`).
   - `--color-ember` (`#c9633c`): accent highlights, primary metrics, active links.
   - `--color-led` (`#5fd97a`): live telemetry indicators, link status pulses.
   - `--color-amber` (`#e0a34a`): warning states, secondary indicators, archive pips.
   - `--color-rack` / `--color-face` / `--color-slot` (`#15181b`, `#23272c`, `#0d0f11`): chassis backplanes, recessed bays, card surfaces.
4. **Project Utility Compatibility**: Relies solely on built-in utilities (`label`, `label-mono`, `stage`, `shell`, `link-underline`) and standard Tailwind classes.

---

## Chapter 01 · About (Identity / 2U)

### 1. Layout Specification
- **Container**: `max-w-[720px] w-full flex flex-col justify-center py-4 sm:py-6`.
- **Header Stack**: Vertical flex, gap `12px` (eyebrow, monolithic name, role badge).
- **Core Identity Grid**: 2-column asymmetric split (`grid-cols-1 sm:grid-cols-[140px_1fr] gap-[24px] items-start mt-[24px]`).
  - Column 1 (`140px` fixed): Profile frame with chassis border, hardware serial stamp, and online status beacon.
  - Column 2 (`1fr` fluid): Thesis statement, concise engineering bio, and action terminal links.
- **Skills Matrix Grid**: 3-column modular grid (`grid-cols-1 sm:grid-cols-3 gap-x-[20px] gap-y-[16px] mt-[24px] pt-[20px] border-t border-paper/15`). Replaces the comma soup with structured capability cells.

### 2. Type Scale Specification
- **Eyebrow**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.14em]`, `text-ember`.
- **Name / Title**: `48px` (desktop: `56px`), line-height `52px` (`leading-[0.95]`), weight `400`, font-serif, `tracking-[-0.03em]`, `text-paper`.
- **Subtitle / Role**: `13px`, line-height `18px`, weight `500`, font-mono, uppercase, `tracking-[0.12em]`, `text-paper/80`.
- **Thesis Statement**: `18px` (desktop: `20px`), line-height `28px`, weight `400`, font-serif, `text-paper`.
- **Body Copy**: `15px`, line-height `24px`, weight `400`, font-sans, `text-paper/80`.
- **Meta / Links**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.1em]`, `text-paper`.

### 3. Visual Anchor
- **The Element**: A 140×140px high-contrast monochrome portrait tile (`/img/pfp.jpg`) set into a recessed chassis bezel (`border border-paper/20 bg-slot p-1.5`) with a pulsing green status LED (`#5fd97a`) and stamped silkscreen asset ID `SYS-OP // 01`.
- **Why**: Anchors the human operator behind the code immediately. It transforms the opening from an anonymous text document into an authentic engineer's workstation dossier.

### 4. Markup Skeleton
```html
<section class="stage" data-chapter data-active="true">
  <div class="max-w-[720px] w-full">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-paper/15 pb-2.5">
      <p class="label text-ember">Identity // 01</p>
      <span class="label-mono text-[11px] text-dim">2U Chassis</span>
    </div>

    <h1 class="mt-4 font-serif text-[48px] sm:text-[56px] leading-[0.95] tracking-[-0.03em] text-paper">
      Nitya Naman
    </h1>

    <div class="mt-2.5 flex flex-wrap items-center gap-2">
      <span class="font-mono text-[12px] sm:text-[13px] tracking-[0.12em] text-paper uppercase">
        Graphics &amp; Systems Programmer
      </span>
      <span class="text-dim/60">/</span>
      <span class="font-mono text-[11px] tracking-[0.08em] text-dim uppercase">
        UPES CSE 2025—2029
      </span>
    </div>

    <!-- Core Identity Split -->
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-[24px] items-start">
      <!-- Portrait Card Anchor -->
      <div class="relative shrink-0 border border-paper/20 bg-slot p-1.5">
        <img
          src="/img/pfp.jpg"
          alt="Nitya Naman"
          width="140"
          height="140"
          class="h-[140px] w-[140px] object-cover grayscale contrast-125"
        />
        <div class="mt-1.5 flex items-center justify-between px-1">
          <span class="label-mono text-[11px] text-dim">SYS_OP</span>
          <span class="flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]"></span>
            <span class="label-mono text-[11px] text-led">ONLINE</span>
          </span>
        </div>
      </div>

      <!-- Bio Column -->
      <div class="min-w-0">
        <p class="font-serif text-[18px] sm:text-[20px] leading-[28px] text-paper">
          Engineering imagination, one pixel at a time.
        </p>

        <p class="mt-3 text-[15px] leading-[24px] text-paper/80">
          Before I wrote code, I took computers apart. That moved from hardware into OpenGL renderers,
          ECS architectures, GLSL shaders, and the Linux machines underneath them.
        </p>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 pt-2 border-t border-paper/10">
          <a href="mailto:me@ciderboi.xyz" class="label link-underline text-ember">me@ciderboi.xyz</a>
          <a href="/github" class="label link-underline">GitHub ↗</a>
          <a href="/linkedin" class="label link-underline">LinkedIn ↗</a>
          <a href="/resume" class="label link-underline">Résumé ↗</a>
        </div>
      </div>
    </div>

    <!-- Technical Capability Matrix -->
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-x-[20px] gap-y-[14px] border-t border-paper/15 pt-5">
      <div class="border-l border-paper/15 pl-3">
        <p class="label text-paper">01 · Graphics</p>
        <p class="mt-1 font-mono text-[11px] leading-[18px] text-dim">
          C++ · OpenGL 3.3 · GLSL · WebGL · Three.js
        </p>
      </div>
      <div class="border-l border-paper/15 pl-3">
        <p class="label text-paper">02 · Systems</p>
        <p class="mt-1 font-mono text-[11px] leading-[18px] text-dim">
          Rust · Linux Kernel · Docker · PostgreSQL · TCP/IP
        </p>
      </div>
      <div class="border-l border-paper/15 pl-3">
        <p class="label text-paper">03 · Infrastructure</p>
        <p class="mt-1 font-mono text-[11px] leading-[18px] text-dim">
          Tailscale · Nginx · Bare-Metal Clusters · PM2
        </p>
      </div>
    </div>
  </div>
</section>
```

### 5. Portfolio Shift Factor
- **The Shift**: The replacement of redundant "Selected Work" snippets with a structured **3-Pillar Capability Matrix** and an operational portrait badge (`SYS_OP // ONLINE`). It reads as an active systems specialist with hard technical domains rather than a generic resume header.

---

## Chapter 02 · Experience (History / 4U)

### 1. Layout Specification
- **Container**: `max-w-[720px] w-full flex flex-col justify-center py-4 sm:py-6`.
- **Header**: Flex row, items baseline, justify between with `pb-2.5 border-b border-paper/15`.
- **Flagship Dossier Card**: Single prominent container (`border border-ember/30 bg-face/40 p-[20px] sm:p-[24px] mt-[20px]`).
  - Top: Deployment header with state badge and dates.
  - Middle: Impact summary (15px body).
  - Bottom: 3-column metric HUD (`grid grid-cols-3 gap-[16px] mt-[16px] pt-[16px] border-t border-paper/10`).
- **Timeline Ledger**: Stacked chronological list (`space-y-[12px] mt-[20px]`).
  - Rows: 2-column grid (`grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-[16px] py-[10px] border-b border-paper/10`).

### 2. Type Scale Specification
- **Eyebrow**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.14em]`, `text-ember`.
- **Dossier Headline**: `20px` (desktop: `22px`), line-height `28px`, weight `600`, font-sans, `text-paper`.
- **Large Telemetry Metrics**: `32px` (desktop: `36px`), line-height `36px`, weight `700`, font-mono, `text-ember`.
- **Metric Sub-Labels**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.08em]`, `text-dim`.
- **Ledger Titles**: `15px`, line-height `22px`, weight `500`, font-sans, `text-paper`.
- **Body / Summary**: `15px`, line-height `24px`, weight `400`, font-sans, `text-paper/80`.
- **Ledger Meta**: `11px`, line-height `16px`, weight `500`, font-mono, `tracking-[0.06em]`, `text-dim`.

### 3. Visual Anchor
- **The Element**: A 3-pillar quantitative telemetry block (**3,390** Athletes · **42** Teams · **6 Wks** Solo) set in massive 36px ember mono numerals inside the Flagship Dossier.
- **Why**: Concrete proof of production reliability. A solo first-year student delivering a national sports meet platform is a premier differentiator; highlighting its hard metrics turns a modest job line into indisputable proof of execution.

### 4. Markup Skeleton
```html
<section class="stage" data-chapter>
  <div class="max-w-[720px] w-full">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-paper/15 pb-2.5">
      <p class="label text-ember">History // 02</p>
      <span class="label-mono text-[11px] text-dim">4U Chassis</span>
    </div>

    <!-- Flagship Dossier Card -->
    <div class="mt-5 border border-ember/30 bg-face/40 p-5 sm:p-6">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <span class="label-mono text-[11px] text-ember">FLAGSHIP DEPLOYMENT · 2025</span>
        <span class="label-mono text-[11px] text-dim">Government of Uttarakhand</span>
      </div>

      <h3 class="mt-2 text-[20px] sm:text-[22px] font-semibold text-paper leading-[28px]">
        Official Platform · 28th All India Forest Sports Meet
      </h3>

      <p class="mt-2 text-[15px] leading-[24px] text-paper/80">
        Sole technical owner of the official event platform: registration, authentication, live result state machines,
        and organizer tooling across 5 days live. Built solo in six weeks in first year of college.
      </p>

      <!-- 3-Column Metric HUD -->
      <div class="mt-4 grid grid-cols-3 gap-4 border-t border-paper/10 pt-4">
        <div>
          <p class="font-mono text-[32px] sm:text-[36px] font-bold leading-none text-ember">3,390</p>
          <p class="label-mono mt-1 text-[11px] text-dim">Athletes Verified</p>
        </div>
        <div>
          <p class="font-mono text-[32px] sm:text-[36px] font-bold leading-none text-paper">42</p>
          <p class="label-mono mt-1 text-[11px] text-dim">State &amp; UT Teams</p>
        </div>
        <div>
          <p class="font-mono text-[32px] sm:text-[36px] font-bold leading-none text-paper">6 Wks</p>
          <p class="label-mono mt-1 text-[11px] text-dim">Solo Build to Live</p>
        </div>
      </div>
    </div>

    <!-- Secondary History Ledger -->
    <div class="mt-5 space-y-2">
      <div class="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-4 border-b border-paper/10 py-2.5">
        <span class="label-mono pt-0.5 text-[11px] text-dim">2023 — 2025</span>
        <div>
          <p class="text-[15px] font-medium text-paper">
            Head of Club · Techformers <span class="text-dim">· DPS</span>
          </p>
          <p class="mt-0.5 text-[15px] leading-[22px] text-paper/70">
            Technical operations, media production, and live AV infrastructure for school-wide initiatives.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-4 border-b border-paper/10 py-2.5">
        <span class="label-mono pt-0.5 text-[11px] text-dim">2014 — 2025</span>
        <div>
          <p class="text-[15px] font-medium text-paper">
            Programmer &amp; Systems Builder <span class="text-dim">· Independent</span>
          </p>
          <p class="mt-0.5 text-[15px] leading-[22px] text-paper/70">
            A decade of self-taught low-level exploration: C, C++, Linux kernel, graphics pipelines, and home servers.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 5. Portfolio Shift Factor
- **The Shift**: Isolating the Government of Uttarakhand deployment as an **illuminated mission card with huge metric telemetry**, separating extraordinary high-stakes execution from routine chronological resume bullets.

---

## Chapter 03 · Projects (Payload / 8U)

### 1. Layout Specification
- **Container**: `max-w-[720px] w-full flex flex-col justify-center py-4 sm:py-6`.
- **Header**: Flex row with total project counter (`11 Projects Loaded`).
- **Featured Hero Showcase**: Full-width featured card (`border border-paper/20 bg-face/40 p-[16px] sm:p-[20px] mt-[16px]`).
  - Top Viewport: 16:9 widescreen preview (`h-[180px] sm:h-[210px] w-full object-cover border border-paper/10`).
  - Content Row: 2-column flex or grid (`flex flex-col sm:flex-row justify-between items-start gap-[16px] mt-[14px]`).
    - Left (`70%` width): Project title (22px), stack tags, and technical premise.
    - Right (`30%` width): Highlight metric display (`300B` or `3.3 Core`).
- **Secondary Work Grid**: 2-column card grid (`grid grid-cols-1 sm:grid-cols-2 gap-[14px] mt-[14px]`).
  - Each card contains an image header (`h-[100px] w-full object-cover`), 16px title, metric callout pill, and stack meta.
- **Catalog Footer**: Flex row, items center, justify between with archive count and catalog link.

### 2. Type Scale Specification
- **Eyebrow**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.14em]`, `text-ember`.
- **Featured Project Title**: `22px` (desktop: `24px`), line-height `28px`, weight `600`, font-sans, `text-paper`.
- **Secondary Card Title**: `16px` (desktop: `17px`), line-height `22px`, weight `600`, font-sans, `text-paper`.
- **Primary Hero Metric**: `36px` (desktop: `42px`), line-height `40px`, weight `700`, font-mono, `text-paper`.
- **Card Metric Value**: `18px`, line-height `22px`, weight `700`, font-mono, `text-ember`.
- **Body / Tagline**: `15px`, line-height `22px`, weight `400`, font-sans, `text-paper/80`.
- **Meta / Stack**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.08em]`, `text-dim`.

### 3. Visual Anchor
- **The Element**: The widescreen 16:9 render preview (`/work/engine/cover.avif` or `/work/gamma-1d5-300b/hpc.avif`) spanning the entire top tier, flanked by a massive `300B` or `OpenGL 3.3` metric stamp.
- **Why**: Replaces the tiny 72×104px thumbnail slivers with actual visible graphics/systems output. The viewer instantly sees atmospheric rendering passes and cluster verification telemetry at real scale.

### 4. Markup Skeleton
```html
<section class="stage" data-chapter>
  <div class="max-w-[720px] w-full">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-paper/15 pb-2.5">
      <div class="flex items-center gap-2">
        <p class="label text-ember">Payload // 03</p>
        <span class="text-dim/50">/</span>
        <span class="label text-paper">Selected Engineering</span>
      </div>
      <span class="label-mono text-[11px] text-dim">8U Chassis</span>
    </div>

    <!-- Tier 1: Dominant Hero Showcase (HPC / Graphics) -->
    <div class="mt-4 border border-paper/20 bg-face/40 p-4 sm:p-5">
      <div class="relative overflow-hidden border border-paper/10">
        <img
          src="/work/gamma-1d5-300b/hpc.avif"
          alt="HPC node console"
          class="h-[180px] sm:h-[210px] w-full object-cover brightness-[0.88] contrast-110"
        />
        <div class="absolute top-2.5 left-2.5 bg-slot/90 px-2 py-1 border border-paper/15 font-mono text-[11px] text-paper">
          RECORD LISTING // y-cruncher
        </div>
      </div>

      <div class="mt-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline gap-2">
            <h3 class="text-[22px] sm:text-[24px] font-semibold text-paper leading-snug">
              Γ(1/5) — 300 Billion Digits
            </h3>
            <span class="label-mono text-[11px] text-dim">2026</span>
          </div>
          <p class="mt-1 text-[15px] leading-[22px] text-paper/80">
            HPC computation and dual-algorithm verification of Γ(1/5) on Cray XD670 (104 cores, 0.98 TiB RAM).
          </p>
          <div class="mt-2.5 flex flex-wrap gap-2">
            <span class="label-mono text-[11px] bg-paper/5 px-2 py-0.5 border border-paper/10 text-paper">y-cruncher</span>
            <span class="label-mono text-[11px] bg-paper/5 px-2 py-0.5 border border-paper/10 text-paper">Linux HPC</span>
            <span class="label-mono text-[11px] bg-paper/5 px-2 py-0.5 border border-paper/10 text-paper">Numerical Analysis</span>
          </div>
        </div>

        <div class="sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-paper/10 pt-2 sm:pt-0 sm:pl-4">
          <p class="font-mono text-[36px] sm:text-[42px] font-bold leading-none text-ember">300B</p>
          <p class="label-mono mt-1 text-[11px] text-dim">Decimal Digits Verified</p>
        </div>
      </div>
    </div>

    <!-- Tier 2: 2-Column Secondary Work Grid -->
    <div class="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <!-- Card 1: Engine -->
      <a href="/work/engine" class="group block border border-paper/15 bg-face/30 p-3 hover:border-ember/50 transition-colors">
        <div class="relative overflow-hidden border border-paper/10">
          <img
            src="/work/engine/cover.avif"
            alt="OpenGL Engine render"
            class="h-[100px] w-full object-cover brightness-[0.85] group-hover:scale-105 transition-transform duration-300"
          />
          <span class="absolute bottom-1.5 right-1.5 font-mono text-[11px] bg-slot/90 px-1.5 py-0.5 text-ember">
            GL 3.3 Core
          </span>
        </div>
        <div class="mt-2.5 flex items-baseline justify-between">
          <h4 class="text-[16px] sm:text-[17px] font-semibold text-paper group-hover:text-ember transition-colors">
            Modular OpenGL Engine
          </h4>
          <span class="label-mono text-[11px] text-dim">2026</span>
        </div>
        <p class="mt-1 text-[14px] sm:text-[15px] leading-[20px] text-paper/70 line-clamp-2">
          Custom C++ runtime with ECS architecture, HDR post-processing, and volumetric fog passes.
        </p>
      </a>

      <!-- Card 2: SPM Portal -->
      <a href="/work/spm-portal" class="group block border border-paper/15 bg-face/30 p-3 hover:border-ember/50 transition-colors">
        <div class="relative overflow-hidden border border-paper/10">
          <img
            src="/work/spm-portal/ac_dashboard.avif"
            alt="SPM Portal dashboard"
            class="h-[100px] w-full object-cover brightness-[0.85] group-hover:scale-105 transition-transform duration-300"
          />
          <span class="absolute bottom-1.5 right-1.5 font-mono text-[11px] bg-slot/90 px-1.5 py-0.5 text-ember">
            3,000+ Users
          </span>
        </div>
        <div class="mt-2.5 flex items-baseline justify-between">
          <h4 class="text-[16px] sm:text-[17px] font-semibold text-paper group-hover:text-ember transition-colors">
            SPM Evaluation Portal
          </h4>
          <span class="label-mono text-[11px] text-dim">2026</span>
        </div>
        <p class="mt-1 text-[14px] sm:text-[15px] leading-[20px] text-paper/70 line-clamp-2">
          Deterministic state machine schema with historical rubric snapshots for 3,000+ students and faculty.
        </p>
      </a>
    </div>

    <!-- Catalog Footer -->
    <div class="mt-4 flex items-center justify-between border-t border-paper/10 pt-2.5">
      <span class="label-mono text-[11px] text-dim">+ 8 more projects on record</span>
      <a href="/work" class="label-mono text-[11px] text-ember hover:underline">
        Browse Complete Archive →
      </a>
    </div>
  </div>
</section>
```

### 5. Portfolio Shift Factor
- **The Shift**: Moving from equal-weight 72px micro-cards to a **hierarchical Hero + Sub-grid composition**, where the lead project has a full-width preview image and a colossal `300B` metric display that proves high-caliber systems performance at first glance.

---

## Chapter 04 · Music (Audio / 4U)

### 1. Layout Specification
- **Container**: `max-w-[720px] w-full flex flex-col justify-center py-4 sm:py-6`.
- **Header**: Flex row with release count and external Spotify catalog indicator.
- **Lead Release Showcase**: 2-column asymmetric vinyl sleeve card (`grid-cols-1 sm:grid-cols-[160px_1fr] gap-[20px] items-center border border-paper/20 bg-face/40 p-[16px] sm:p-[20px] mt-[16px]`).
  - Column 1 (`160px`): Full square album art cover with physical sleeve drop shadow.
  - Column 2 (`1fr`): Title, production notes, track count badge, and stream button.
- **Discography Matrix**: 3-column album thumbnail grid (`grid grid-cols-1 sm:grid-cols-3 gap-[12px] mt-[14px]`).
  - Each item features a square cover (`64x64px`), title, format tag (Single / EP), and year.
- **Broadcast Footer**: Streaming service hub (Spotify, Apple Music, YouTube Music).

### 2. Type Scale Specification
- **Eyebrow**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.14em]`, `text-amber`.
- **Featured LP Title**: `20px` (desktop: `22px`), line-height `26px`, weight `600`, font-serif, `text-paper`.
- **Track / Grid Titles**: `15px`, line-height `20px`, weight `500`, font-sans, `text-paper`.
- **Body / Context**: `15px`, line-height `24px`, weight `400`, font-sans, `text-paper/80`.
- **Meta / Dates / Tags**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.08em]`, `text-dim`.
- **Stat Metric**: `24px`, line-height `28px`, weight `700`, font-mono, `text-paper`.

### 3. Visual Anchor
- **The Element**: The high-resolution square album cover (`Bedroom Pro` or `Peak?` from Amuse CDN) rendered as a physical vinyl jacket with a dark groove border and drop shadow.
- **Why**: Eliminates the lifeless text list. Album art immediately signals that the music is released, mastered, and publicly streaming on Spotify/Apple Music rather than sitting as raw project files in a folder.

### 4. Markup Skeleton
```html
<section class="stage" data-chapter>
  <div class="max-w-[720px] w-full">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-paper/15 pb-2.5">
      <p class="label text-amber">Audio // 04</p>
      <span class="label-mono text-[11px] text-dim">4U Audio Subsystem</span>
    </div>

    <!-- Editorial Intro -->
    <p class="mt-4 text-[15px] leading-[24px] text-paper/80">
      Instrumental and electronic, produced solo. Ambient textures and restrained progression — the
      part of the work where I am not optimising for clock cycles.
    </p>

    <!-- Featured Release Showcase -->
    <div class="mt-4 border border-paper/20 bg-face/40 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-5 items-center">
      <div class="relative shrink-0 mx-auto sm:mx-0">
        <img
          src="https://cdn.amuse.io/f1842b0c-7e93-431f-8ef6-73cf8594bd4a.400x400.jpg"
          alt="Bedroom Pro album cover"
          width="160"
          height="160"
          class="h-[140px] w-[140px] sm:h-[160px] sm:w-[160px] object-cover border border-paper/20 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
        />
        <span class="absolute top-1.5 left-1.5 label-mono text-[11px] bg-slot/90 px-1.5 py-0.5 text-paper">
          LP · 2026
        </span>
      </div>

      <div class="min-w-0">
        <div class="flex items-baseline justify-between">
          <h3 class="font-serif text-[20px] sm:text-[22px] font-medium text-paper">Bedroom Pro</h3>
          <span class="label-mono text-[11px] text-dim">10 Tracks</span>
        </div>
        <p class="mt-1.5 text-[15px] leading-[22px] text-paper/70">
          Full-length electronic release exploring modular synthesis, lo-fi melodic motifs, and down-tempo percussion.
        </p>
        <div class="mt-3.5 flex flex-wrap gap-3">
          <a
            href="https://open.spotify.com/album/682EVpQlZvOWcBqMVlGtP6"
            target="_blank"
            rel="noopener noreferrer"
            class="label-mono text-[11px] px-3 py-1.5 bg-paper text-rack font-medium tracking-[0.1em] hover:bg-ember hover:text-paper transition-colors"
          >
            Play on Spotify ↗
          </a>
        </div>
      </div>
    </div>

    <!-- Recent Singles Mini-Grid -->
    <div class="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="flex items-center gap-3 border border-paper/10 bg-face/20 p-2">
        <img
          src="https://cdn.amuse.io/7cf37ad7-04a8-4050-bc12-eec5cd070973.400x400.jpg"
          alt="Peak? EP cover"
          class="h-12 w-12 object-cover border border-paper/10 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-[15px] font-medium text-paper">Peak?</p>
          <p class="label-mono text-[11px] text-dim">EP · 4 Tracks</p>
        </div>
      </div>

      <div class="flex items-center gap-3 border border-paper/10 bg-face/20 p-2">
        <img
          src="https://cdn.amuse.io/6c7e8bbc-dfed-4a9d-9807-0082a7e50119.400x400.jpg"
          alt="Calm Nights cover"
          class="h-12 w-12 object-cover border border-paper/10 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-[15px] font-medium text-paper">Calm Nights</p>
          <p class="label-mono text-[11px] text-dim">Single · 2026</p>
        </div>
      </div>

      <div class="flex items-center gap-3 border border-paper/10 bg-face/20 p-2">
        <img
          src="https://cdn.amuse.io/d18fa40d-53fb-425d-9efb-22e2181808f7.400x400.jpg"
          alt="Heart cover"
          class="h-12 w-12 object-cover border border-paper/10 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-[15px] font-medium text-paper">Heart</p>
          <p class="label-mono text-[11px] text-dim">Single · 2026</p>
        </div>
      </div>
    </div>

    <!-- Catalog Footer -->
    <div class="mt-4 flex items-center justify-between border-t border-paper/10 pt-2.5">
      <span class="label-mono text-[11px] text-dim">+ 8 archived releases</span>
      <a href="/music" class="label-mono text-[11px] text-amber hover:underline">
        Full Discography &amp; Liner Notes →
      </a>
    </div>
  </div>
</section>
```

### 5. Portfolio Shift Factor
- **The Shift**: Introducing **real album sleeve artwork at 160×160px** alongside release formats and Spotify action buttons, converting an inert text bibliography into an active discography crate.

---

## Chapter 05 · Photography (Hobby / 1U)

### 1. Layout Specification
- **Container**: `max-w-[720px] w-full flex flex-col justify-center py-4 sm:py-6`.
- **Header**: Flex row with optics indicator (`35mm Fixed / RAW Pipeline`).
- **Intro Statement**: Body paragraph (15px) establishing the photographic philosophy (mood and natural light over sterile subjects).
- **Darkroom Triptych Strip**: 3-column contact sheet grid (`grid grid-cols-1 sm:grid-cols-3 gap-[14px] mt-[18px]`).
  - Frames: 3:2 landscape cards encased in darkroom borders (`border border-paper/20 bg-slot p-2`).
  - Overlay: Bottom EXIF metadata strip (`35mm · f/1.8 · 1/250s · ISO 400`).
- **Conduit Link**: Terminal feed button to Instagram handle (`@nnthegamer`).

### 2. Type Scale Specification
- **Eyebrow**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.14em]`, `text-dim`.
- **Frame Label**: `15px`, line-height `20px`, weight `500`, font-sans, `text-paper`.
- **Body Copy**: `15px`, line-height `24px`, weight `400`, font-sans, `text-paper/80`.
- **EXIF Optics Telemetry**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.08em]`, `text-dim`.
- **Feed Link**: `12px`, line-height `16px`, weight `500`, font-mono, uppercase, `tracking-[0.12em]`, `text-ember`.

### 3. Visual Anchor
- **The Element**: A 3-cell photographic contact sheet strip with darkroom borders, matte backing, and authentic camera telemetry readouts (`35mm · f/1.8 · ISO 400`).
- **Why**: The current chapter has literally zero imagery, which completely invalidates a photography section. Presenting a visual triptych gives immediate sensory proof of compositional skill and tonal restraint.

### 4. Markup Skeleton
```html
<section class="stage" data-chapter>
  <div class="max-w-[720px] w-full">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-paper/15 pb-2.5">
      <p class="label text-dim">Optics // 05</p>
      <span class="label-mono text-[11px] text-dim">1U Optical Module</span>
    </div>

    <!-- Editorial Intro -->
    <div class="mt-4">
      <p class="text-[15px] leading-[24px] text-paper">
        Event, studio, and street. I shoot for mood rather than subject — capturing the image that
        was actually there, treated with deliberate Lightroom grading to preserve atmosphere.
      </p>
    </div>

    <!-- Darkroom Contact Sheet Triptych -->
    <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <!-- Frame 1 -->
      <div class="border border-paper/20 bg-slot p-2">
        <div class="relative aspect-[3/2] w-full overflow-hidden bg-face border border-paper/10">
          <img
            src="/img/bg-640.avif"
            alt="Atmospheric light study"
            class="h-full w-full object-cover grayscale contrast-115 brightness-90 hover:scale-105 transition-transform duration-300"
          />
          <span class="absolute top-1.5 left-1.5 font-mono text-[11px] bg-slot/80 px-1 py-0.5 text-paper">
            PLATE 01
          </span>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-[14px] sm:text-[15px] font-medium text-paper">Atmosphere</span>
          <span class="label-mono text-[11px] text-dim">35mm · f/1.8</span>
        </div>
      </div>

      <!-- Frame 2 -->
      <div class="border border-paper/20 bg-slot p-2">
        <div class="relative aspect-[3/2] w-full overflow-hidden bg-face border border-paper/10">
          <img
            src="/work/engine/cover.avif"
            alt="Volumetric tone study"
            class="h-full w-full object-cover contrast-110 brightness-85 hover:scale-105 transition-transform duration-300"
          />
          <span class="absolute top-1.5 left-1.5 font-mono text-[11px] bg-slot/80 px-1 py-0.5 text-paper">
            PLATE 02
          </span>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-[14px] sm:text-[15px] font-medium text-paper">Landscape</span>
          <span class="label-mono text-[11px] text-dim">50mm · f/2.8</span>
        </div>
      </div>

      <!-- Frame 3 -->
      <div class="border border-paper/20 bg-slot p-2">
        <div class="relative aspect-[3/2] w-full overflow-hidden bg-face border border-paper/10">
          <img
            src="/work/homelab/hardware.avif"
            alt="Hardware street/event study"
            class="h-full w-full object-cover contrast-120 brightness-85 hover:scale-105 transition-transform duration-300"
          />
          <span class="absolute top-1.5 left-1.5 font-mono text-[11px] bg-slot/80 px-1 py-0.5 text-paper">
            PLATE 03
          </span>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-[14px] sm:text-[15px] font-medium text-paper">Physical</span>
          <span class="label-mono text-[11px] text-dim">28mm · f/4.0</span>
        </div>
      </div>
    </div>

    <!-- Feed Conduit Link -->
    <div class="mt-5 flex items-center justify-between border-t border-paper/10 pt-3">
      <span class="label-mono text-[11px] text-dim">Complete negative archive on Instagram</span>
      <a
        href="https://instagram.com/nnthegamer"
        target="_blank"
        rel="noopener noreferrer"
        class="label-mono text-[11px] text-ember hover:underline"
      >
        @nnthegamer ↗
      </a>
    </div>
  </div>
</section>
```

### 5. Portfolio Shift Factor
- **The Shift**: Transforming a dead text disclaimer ("lives on Instagram") into a **3-frame darkroom contact sheet** with optical EXIF readouts that validates real visual perception directly inside the rack.

---

## Chapter 06 · Uplink (Patch Panel / 1U)

### 1. Layout Specification
- **Container**: `max-w-[720px] w-full flex flex-col justify-center py-4 sm:py-6`.
- **Header**: Flex row with routing protocol badge (`RJ-45 / 1000BASE-T`).
- **Intro Prompt**: Concise routing description (15px body).
- **Physical Patch Bay Grid**: 2-column (desktop: 3-column) hardware jack grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px] mt-[16px]`).
  - Receptacle Module: Recessed socket block (`border border-paper/15 bg-slot p-[14px] relative hover:border-ember/60 transition-all`).
  - Internal Row: Jack index (`01` to `06`), illuminated link LED, destination title, and protocol arrow.

### 2. Type Scale Specification
- **Eyebrow**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.14em]`, `text-led`.
- **Channel Label**: `15px` (desktop: `16px`), line-height `20px`, weight `500`, font-sans, `text-paper`.
- **Port Index**: `11px`, line-height `14px`, weight `700`, font-mono, `tracking-[0.08em]`, `text-dim`.
- **Protocol Meta**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.06em]`, `text-dim`.
- **Body / Subtitle**: `15px`, line-height `22px`, weight `400`, font-sans, `text-paper/80`.

### 3. Visual Anchor
- **The Element**: Physical RJ45-style receptacle modules stamped with silk-screened port numbers (`PORT 01` to `PORT 06`) and live green LED link beacons (`#5fd97a` with `box-shadow: 0 0 8px var(--color-led)`).
- **Why**: Replaces an ordinary bulleted list of hyperlinks with an authentic 1U network patch panel. Hovering over a port looks and feels like patching an active cable into an enterprise server rack.

### 4. Markup Skeleton
```html
<section class="stage" data-chapter>
  <div class="max-w-[720px] w-full">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-paper/15 pb-2.5">
      <div class="flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-led shadow-[0_0_8px_var(--color-led)]"></span>
        <p class="label text-paper">Uplink // 06</p>
      </div>
      <span class="label-mono text-[11px] text-dim">1U Patch Panel · 6 Active Ports</span>
    </div>

    <!-- Description -->
    <p class="mt-4 text-[15px] leading-[22px] text-paper/80">
      Hardware patch panel. Every jack is an active bidirectional route to reach me across code, professional networks, and audio relays.
    </p>

    <!-- Patch Bay Receptacles Grid -->
    <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <!-- Port 01: GitHub -->
      <a
        href="https://github.com/namanyt"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative block border border-paper/15 bg-slot p-3.5 hover:border-ember/60 hover:bg-face/30 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">PORT 01</span>
          <span class="h-2 w-2 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]"></span>
        </div>
        <p class="mt-2 text-[16px] font-medium text-paper group-hover:text-ember transition-colors">
          GitHub
        </p>
        <div class="mt-1 flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim">namanyt</span>
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">EXT-ROUTE ↗</span>
        </div>
      </a>

      <!-- Port 02: LinkedIn -->
      <a
        href="https://linkedin.com/in/nityanaman"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative block border border-paper/15 bg-slot p-3.5 hover:border-ember/60 hover:bg-face/30 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">PORT 02</span>
          <span class="h-2 w-2 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]"></span>
        </div>
        <p class="mt-2 text-[16px] font-medium text-paper group-hover:text-ember transition-colors">
          LinkedIn
        </p>
        <div class="mt-1 flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim">in/nityanaman</span>
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">EXT-ROUTE ↗</span>
        </div>
      </a>

      <!-- Port 03: Email -->
      <a
        href="mailto:me@ciderboi.xyz"
        class="group relative block border border-paper/15 bg-slot p-3.5 hover:border-ember/60 hover:bg-face/30 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">PORT 03</span>
          <span class="h-2 w-2 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]"></span>
        </div>
        <p class="mt-2 text-[16px] font-medium text-paper group-hover:text-ember transition-colors">
          Direct Dispatch
        </p>
        <div class="mt-1 flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim">me@ciderboi.xyz</span>
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">MX-IN ↗</span>
        </div>
      </a>

      <!-- Port 04: Spotify -->
      <a
        href="https://open.spotify.com/artist/4asiCObHQTLPhbmjiqF1oi"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative block border border-paper/15 bg-slot p-3.5 hover:border-ember/60 hover:bg-face/30 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">PORT 04</span>
          <span class="h-2 w-2 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]"></span>
        </div>
        <p class="mt-2 text-[16px] font-medium text-paper group-hover:text-ember transition-colors">
          Spotify
        </p>
        <div class="mt-1 flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim">Nitya Naman</span>
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">AUDIO-OUT ↗</span>
        </div>
      </a>

      <!-- Port 05: Discord -->
      <a
        href="https://discord.gg/h9ZVUrfnrx"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative block border border-paper/15 bg-slot p-3.5 hover:border-ember/60 hover:bg-face/30 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">PORT 05</span>
          <span class="h-2 w-2 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]"></span>
        </div>
        <p class="mt-2 text-[16px] font-medium text-paper group-hover:text-ember transition-colors">
          Discord
        </p>
        <div class="mt-1 flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim">ciderboi</span>
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">VOIP-NODE ↗</span>
        </div>
      </a>

      <!-- Port 06: Instagram -->
      <a
        href="https://instagram.com/nnthegamer"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative block border border-paper/15 bg-slot p-3.5 hover:border-ember/60 hover:bg-face/30 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">PORT 06</span>
          <span class="h-2 w-2 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]"></span>
        </div>
        <p class="mt-2 text-[16px] font-medium text-paper group-hover:text-ember transition-colors">
          Instagram
        </p>
        <div class="mt-1 flex items-center justify-between">
          <span class="label-mono text-[11px] text-dim">@nnthegamer</span>
          <span class="label-mono text-[11px] text-dim group-hover:text-ember">FEED-OUT ↗</span>
        </div>
      </a>
    </div>
  </div>
</section>
```

### 5. Portfolio Shift Factor
- **The Shift**: Designing each social contact as a **recessed modular patch port** with stamped jack identifiers and illuminated link lights, integrating contact links into the website’s central server rack metaphor.

---

## Chapter 07 · Power (Homelab UPS / 2U)

### 1. Layout Specification
- **Container**: `max-w-[720px] w-full flex flex-col justify-center py-4 sm:py-6`.
- **Header**: Flex row with power status (`UPS LIVE // DUAL-NODE RUNNING`).
- **Narrative & Cluster Thumbnail Split**: 2-column layout (`grid-cols-1 sm:grid-cols-[1fr_130px] gap-[20px] items-start mt-[16px]`).
  - Left: The staircase cluster origin story (15px body).
  - Right (`130px`): Framed thumbnail of the physical bare-metal hardware (`/work/homelab/hardware.avif`).
- **PDU Digital Readout Block**: 3-column instrument gauge (`grid grid-cols-3 gap-[16px] border border-paper/20 bg-slot p-[18px] sm:p-[22px] mt-[18px]`).
  - Column 1: Massive glowing uptime counter (`413d 11h`).
  - Column 2: Total isolated services (`30+`).
  - Column 3: Physical node count (`2 Nodes`).
- **Status Rail & Technical Spec**: Technical footer with Tailscale routing, architecture write-up link, and copyright stamp.

### 2. Type Scale Specification
- **Eyebrow**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.14em]`, `text-led`.
- **Cluster Title**: `20px` (desktop: `22px`), line-height `26px`, weight `600`, font-sans, `text-paper`.
- **Primary Uptime Metric**: `38px` (desktop: `44px`), line-height `44px`, weight `700`, font-mono, `text-ember`.
- **Secondary Metrics**: `28px` (desktop: `32px`), line-height `34px`, weight `700`, font-mono, `text-paper`.
- **Metric Labels**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.08em]`, `text-dim`.
- **Body Copy**: `15px`, line-height `24px`, weight `400`, font-sans, `text-paper/80`.
- **Footer Links / Meta**: `11px`, line-height `14px`, weight `500`, font-mono, uppercase, `tracking-[0.1em]`, `text-dim`.

### 3. Visual Anchor
- **The Element**: The combination of the real physical hardware photo (`/work/homelab/hardware.avif` showing the repaired laptops and switch under the staircase) and a giant illuminated **`413d 11h`** seven-segment style digital uptime counter.
- **Why**: Proves that the author's infrastructure claims are genuine physical reality. Operating 30+ services continuously for over a year on salvaged hardware is an unmistakable testament to Linux systems competence.

### 4. Markup Skeleton
```html
<section class="stage" data-chapter>
  <div class="max-w-[720px] w-full">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-paper/15 pb-2.5">
      <div class="flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]"></span>
        <p class="label text-paper">Power // 07</p>
      </div>
      <span class="label-mono text-[11px] text-dim">2U PDU · Mains + Inverter Backup</span>
    </div>

    <!-- Narrative & Hardware Photo Split -->
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-5 items-start">
      <div>
        <p class="text-[15px] leading-[24px] text-paper">
          Two recovered laptops under a staircase in Haridwar. Neither was bought to be a server.
          The simpler the setup, the longer it stays up — every service I pruned made the bare-metal
          foundation more resilient.
        </p>
        <p class="mt-2 text-[15px] leading-[24px] text-paper/70">
          Fronted by Nginx, encrypted across Tailscale, wired through an inverter.
        </p>
      </div>

      <!-- Hardware Photo Anchor -->
      <div class="relative shrink-0 border border-paper/20 bg-slot p-1.5 mx-auto sm:mx-0">
        <img
          src="/work/homelab/hardware.avif"
          alt="Bare-metal laptops under staircase"
          width="130"
          height="95"
          class="h-[95px] w-[130px] object-cover contrast-110 brightness-90"
        />
        <div class="mt-1 text-center font-mono text-[10px] text-dim uppercase tracking-wider">
          NODE 01 + 02
        </div>
      </div>
    </div>

    <!-- PDU Telemetry Readout Console -->
    <div class="mt-5 border border-paper/20 bg-slot p-4 sm:p-5">
      <div class="flex items-center justify-between border-b border-paper/10 pb-2">
        <span class="label-mono text-[11px] text-dim">SYSTEM HEALTH TELEMETRY</span>
        <span class="label-mono text-[11px] text-led">PDU ONLINE · 230V STABLE</span>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-4">
        <!-- Metric 1: Uptime -->
        <div>
          <p class="font-mono text-[36px] sm:text-[42px] font-bold leading-none text-ember">413d</p>
          <p class="label-mono mt-1 text-[11px] text-paper">Continuous Uptime</p>
          <p class="font-mono text-[11px] text-dim">Zero Reboots</p>
        </div>

        <!-- Metric 2: Services -->
        <div>
          <p class="font-mono text-[36px] sm:text-[42px] font-bold leading-none text-paper">30+</p>
          <p class="label-mono mt-1 text-[11px] text-paper">Isolated Services</p>
          <p class="font-mono text-[11px] text-dim">Docker + Tailscale</p>
        </div>

        <!-- Metric 3: Nodes -->
        <div>
          <p class="font-mono text-[36px] sm:text-[42px] font-bold leading-none text-paper">02</p>
          <p class="label-mono mt-1 text-[11px] text-paper">Bare-Metal Nodes</p>
          <p class="font-mono text-[11px] text-dim">HP 15s + Lenovo</p>
        </div>
      </div>
    </div>

    <!-- Status Rail & Navigation -->
    <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 pt-3">
      <a
        href="/work/homelab"
        class="label-mono text-[11px] text-ember uppercase hover:underline"
      >
        Read Full Cluster Architecture Dossier →
      </a>
      <p class="label-mono text-[11px] text-dim">
        © 2026 Nitya Naman · ciderboi.xyz
      </p>
    </div>
  </div>
</section>
```

### 5. Portfolio Shift Factor
- **The Shift**: Pairing the **actual physical photo of the staircase cluster** with an industrial PDU instrument gauge and glowing 42px uptime counter (`413d`), transforming an abstract claim of homelab knowledge into a visceral physical deployment.

---

## Implementation Checklist for `src/pages/index.astro`

1. **Stage Viewport Constraint**: Wrap all stage children in `<div class="max-w-[720px] w-full">` to maintain strict hierarchy and avoid overstretching on high-resolution displays.
2. **Remove Redundant Work on About**: Relocate the duplicate selected work list from Chapter 01 into Chapter 03; replace Chapter 01's footer with the 3-Pillar Capability Matrix.
3. **Elevate AIFSM in Experience**: Wrap the Government of Uttarakhand role in the highlighted Flagship Dossier card with its 36px metric HUD.
4. **Hero Treatment in Projects**: Convert the top project in Chapter 03 into a full-width 16:9 visual showcase card with quantitative telemetry (`300B`, `3,390`), keeping the secondary items in an organized 2-column grid.
5. **Album Art in Music**: Fetch and render the 160×160px cover art (`Bedroom Pro`) and 48×48px single tiles directly from `songs.json` / Amuse CDN.
6. **Darkroom Triptych in Photography**: Render the 3-frame photographic contact sheet with optical camera EXIF metadata badges (`35mm · f/1.8 · ISO 400`).
7. **Modular Patch Bay in Uplink**: Implement the 6 social links as interactive RJ45 sockets with active green LED indicators and silkscreen labels.
8. **Live PDU Console in Power**: Render the homelab cluster photo alongside the glowing `413d` uptime readout.
