# Homepage Content Audit & Copy Specification

> **Target File:** `/home/sera/Dev/ciderboi.xyz/HOMEPAGE-CONTENT.md`  
> **Subject:** Content audit, structural mapping, and production-ready copy for the scroll-driven 3D server rack homepage at `ciderboi.xyz`.  
> **Source Data:** `src/content/*.json`, `/tmp/recon/brain/thoughts/me.mdx`, and route templates.

---

## 1. Rack Unit Architecture (7-Unit Half-Rack)

The scroll-driven rack interface operates on a standard 22U vertical frame. Each unit functions as an interactive hardware drawer corresponding 1:1 with the site's primary routes and external archives.

| Index | Unit Label | Sub-Label | U-Height | Canonical Route | Purpose & Structural Function |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **01** | `ABOUT` | `identity` | 2U | `/about` | Establishes engineering identity, technical focus, and personal background. |
| **02** | `EXPERIENCE` | `history` | 4U | `/resume` | Chronological timeline of government contracts, club leadership, and independent work. |
| **03** | `PROJECTS` | `payload` | 8U | `/work` | Flagship computational payload showcasing graphics engines, HPC verification, and web platforms. |
| **04** | `MUSIC` | `audio` | 4U | `/music` | Discography of self-produced electronic releases, separating emotional audio from analytical code. |
| **05** | `PHOTO` | `visuals` | 1U | External (`@nnthegamer`) | Observational visual portfolio documenting live events, studio setups, and landscape atmosphere. |
| **06** | `PATCH` | `uplink` | 1U | `/contact` | Communications patch panel providing direct email access and verified external social endpoints. |
| **07** | `POWER` | `ups` | 2U | Hardware Homelab | Physical hardware telemetry reporting cluster uptime, node status, and self-hosted services. |

---

## 2. Production Copy by Unit

### Unit 01 · ABOUT (2U)
*Maps to `/about`*

- **Eyebrow Label:** `PORTFOLIO · IDENTITY`
- **H1:** `Nitya Naman`
- **Role Line:** `Graphics & Systems Programmer · C++ · OpenGL · Rust`
- **One-Sentence Positioning Line:** `Engineering imagination, one pixel at a time.`
- **Bio Paragraph 1 (48 words):**  
  I am a computer science student at UPES studying graphics and gaming. I write low-level software across C, C++, and Rust, pairing technical correctness with deliberate interaction design. Before writing code, I took machines apart. That mechanical curiosity still drives how I build renderers, engines, and systems.
- **Bio Paragraph 2 (42 words):**  
  My work sits between clean code and controlled chaos. I build tools that go deeper than the spec requires, whether optimizing a 300-billion-digit constant computation or writing volumetric fog shaders. Beyond software, I release electronic music and shoot atmospheric photography.
- **Quick Links:**
  - Email: `me@ciderboi.xyz`
  - GitHub: `/github` (`namanyt`)
  - LinkedIn: `/linkedin` (`in/nityanaman`)
  - Read Full Bio: `/about`

---

### Unit 02 · EXPERIENCE (4U)
*Maps to `/resume`*

- **Heading:** `Experience`
- **Intro (20 words):**  
  Production systems, club leadership, and independent engineering since 2014. Selected roles across government infrastructure, operations, and self-directed software development.
- **Items to Show (drawn from `experiences.json`):**
  1. **Full-Stack Developer** · Government of Uttarakhand
     - *Timeline:* Oct 2025 – Nov 2025 | *Location:* Dehradun, India
     - *Summary:* Sole technical owner of the official web platform for the 28th All India Forest Sports Meet: frontend, backend, database, deployment, and production infrastructure.
     - *Stack:* Next.js, PocketBase, Ubuntu, PM2
  2. **Head of Club, Techformers** · Delhi Public School
     - *Timeline:* Apr 2023 – Mar 2025 | *Location:* Jaipur, India
     - *Summary:* Led technical operations, media production, and event logistics: photography, videography, livestreaming, and AV systems for school-wide initiatives.
     - *Stack:* Leadership, Media, AV
  3. **Programmer** · Self-employed
     - *Timeline:* Jun 2014 – Jun 2025 | *Location:* Remote
     - *Summary:* Self-taught across systems, web, graphics, and infrastructure. Started by taking machines apart; never really stopped.
     - *Stack:* C, C++, Python, TypeScript, Linux
  4. **Music Producer** · Self-employed
     - *Timeline:* Mar 2020 – Jun 2025 | *Location:* Remote
     - *Summary:* Compose, produce, mix, and master instrumental and electronic releases end to end, distributed independently.
     - *Stack:* Ableton Live, FL Studio
  5. **Photographer** · Self-employed
     - *Timeline:* Jul 2023 – Jun 2025 | *Location:* Remote
     - *Summary:* Event, portrait, and concept photography. Editing in Lightroom, with a deliberate rather than heavy hand.
     - *Stack:* Lightroom, Event, Studio
- **Action Link:** `View full résumé & download CV PDF →` (`/resume`)

---

### Unit 03 · PROJECTS (8U)
*Maps to `/work`*

- **Heading:** `Projects`
- **Intro (21 words):**  
  Selected software spanning graphics engines, high-performance numerical computing, production platforms, and systems tooling. Built for scale, clarity, and tactile interaction.
- **Items to Show (drawn from `projects.json`):**
  1. **AIFSM 2025** (2025 · Full-Stack · Archived)
     - *Tagline:* Official platform for the 28th All India Forest Sports Meet
     - *Summary:* A live event platform for 3,390 athletes across 42 teams: registration, accreditation, results, and organizer tooling, built solo in six weeks.
     - *Metrics:* 3,390 athletes · 42 teams · 270+ events · 6 wks solo build
     - *Stack:* Next.js, PocketBase, Ubuntu, PM2
     - *Cover Image:* `/work/aifsm2025/home.avif`
     - *Target Link:* `/work/aifsm2025`
  2. **Γ(1/5) — 300 Billion Digits** (2026 · HPC · Completed)
     - *Tagline:* High-precision computation and independent verification
     - *Summary:* Computed Γ(1/5) to 300,000,000,000 decimal digits on the UPES HPC cluster, then verified it with a second independent algorithm.
     - *Metrics:* 300B digits · UPES HPC Cluster · Dual-algorithm verification
     - *Stack:* y-cruncher, Linux, Numerical Analysis
     - *Cover Image:* `/work/gamma-1d5-300b/cover.avif`
     - *Target Link:* `/work/gamma-1d5-300b`
  3. **Engine** (2026 · Graphics · Ongoing)
     - *Tagline:* A C++ runtime and rendering framework
     - *Summary:* A reusable game engine with a modular OpenGL renderer, ECS architecture, HDR post-processing, and volumetric fog.
     - *Metrics:* Custom ECS · HDR pipeline · Volumetric fog
     - *Stack:* C++, OpenGL, ECS, GLSL
     - *Cover Image:* `/work/engine/cover.avif`
     - *Target Link:* `/work/engine`
  4. **Student Project Management Portal** (2026 · Full-Stack · Completed)
     - *Tagline:* Academic evaluation platform
     - *Summary:* A multi-role evaluation system built on a relational database acting as a deterministic state machine, sized for 3,000+ concurrent students and faculty.
     - *Metrics:* 3,000+ users · Deterministic state machine
     - *Stack:* Next.js, TypeScript, PostgreSQL, Prisma
     - *Cover Image:* `/work/spm-portal/cover.avif`
     - *Target Link:* `/work/spm-portal`
- **Archive Counter:** `+ 7 more systems, tools, and hardware projects in the full index`
- **Action Link:** `Explore all 11 projects →` (`/work`)

---

### Unit 04 · MUSIC (4U)
*Maps to `/music`*

- **Heading:** `Music`
- **Intro (21 words):**  
  Independent electronic and atmospheric releases composed, recorded, mixed, and mastered solo. A non-analytical creative outlet driven by mood rather than optimization.
- **Items to Show (drawn from `songs.json`):**
  - **Recent Releases:**
    1. *Bedroom Pro* (Album · Sep 2026 · 10 tracks) — Latest full-length release
    2. *Titan Falls* (Single · Aug 2026)
    3. *Soopersows* (Single · Jul 2026)
    4. *Drifting Apart* (Single · Jun 2026)
    5. *Peak?* (Album · May 2026 · 4 tracks)
    6. *Memories* (Single · Apr 2026)
    7. *Wall-I* (Single · Mar 2026)
    8. *Heart* (Single · Feb 2026)
    9. *Calm Nights* (Single · Jan 2026)
  - **Catalogue Context:** 8 earlier releases archived under Cider Gamer (2022–2023), including the *Just Another Day* EP.
  - **Available Streaming Endpoints:**
    - Spotify: `Nitya Naman` (`https://open.spotify.com/artist/4asiCObHQTLPhbmjiqF1oi`)
    - YouTube Music: `@ciderboi` (`https://music.youtube.com/@ciderboi`)
    - Apple Music: `Nitya Naman` (`https://music.apple.com/in/artist/nitya-naman/1864402688`)
- **Action Link:** `Open music catalogue →` (`/music`)

---

### Unit 05 · PHOTOGRAPHY (1U)
*Maps to Instagram / Visual Portfolio*

- **Heading:** `Photography`
- **Intro (24 words):**  
  Visual diary and observational documentation across live events, studio sessions, and natural landscapes. Focused on natural light, texture, and deliberate framing over synthetic editing.
- **Items to Show (drawn from `me.mdx` and `experiences.json`):**
  - **Core Modalities:**
    1. *Event Coverage:* Fast-paced live capture of stages, crowds, and candid moments.
    2. *Studio Work:* Compositional control, deliberate lighting, and portraiture.
    3. *Travel & Nature:* Environmental framing of unarranged, organic textures.
  - **Post-Processing Workflow:** Adobe Lightroom, prioritizing optical reality and tonal mood over heavy manipulation.
  - **Primary Gallery Destination:** Instagram [`@nnthegamer`](https://instagram.com/nnthegamer)

---

### Unit 06 · CONTACT / UPLINK (1U)
*Maps to `/contact`*

- **Heading:** `Contact`
- **Intro (21 words):**  
  Available for systems engineering, graphics projects, and collaborative technical challenges. Direct email receives the fastest response; social channels are routed below.
- **Items to Show (drawn from `site.json` and `contact.astro`):**
  - **Primary Comms Channel:**
    - Email: `me@ciderboi.xyz` (direct link + copy shortcut)
    - Location: Haridwar, India
    - Response Window: ~1 business day
    - Engagement Scope: Open to engineering roles, contract systems work, and research collaborations
  - **Patch Panel Ports:**
    - `01` **GitHub:** `namanyt` (`https://github.com/namanyt`)
    - `02` **LinkedIn:** `in/nityanaman` (`https://linkedin.com/in/nityanaman`)
    - `03` **Instagram:** `@nnthegamer` (`https://instagram.com/nnthegamer`)
    - `04` **YouTube:** `@ciderboi` (`https://www.youtube.com/@ciderboi`)
    - `05` **Spotify:** `Nitya Naman` (`https://open.spotify.com/artist/4asiCObHQTLPhbmjiqF1oi`)
    - `06` **Discord:** `ciderboi` (`https://discord.gg/h9ZVUrfnrx`)
- **Action Link:** `Open contact page →` (`/contact`)

---

### Unit 07 · POWER / INFRASTRUCTURE (2U)
*Physical System Foundation & Hardware Telemetry*

- **Heading:** `Power`
- **Intro (21 words):**  
  Self-hosted bare-metal cluster running 24/7 under a staircase. Operating physical infrastructure grounds abstract software in hardware realities and operational discipline.
- **Items to Show (drawn from `projects.json` [homelab] and `me.mdx`):**
  - **Physical Cluster Architecture:**
    - *Node 01:* Recovered HP Laptop (General compute, reverse proxy, orchestration)
    - *Node 02:* Lenovo IdeaPad Gaming 3 (GTX 1650 Ti GPU node for transcoding and machine vision)
  - **Live Telemetry & Health Metrics:**
    - *Uptime:* `413+ days` continuous without reboot
    - *Active Containers:* `30+ services` orchestrated via Docker & PM2
    - *Bare-Metal Nodes:* `2 nodes` connected over Tailscale encrypted mesh VPN
    - *Ingress / Edge:* Nginx reverse proxy with automated SSL certificate lifecycle
  - **Critical Workloads:** Continuous 4-camera 4K NVR security stack, self-hosted media streaming (Jellyfin, Sonarr, Radarr), local network automations.
  - **System Colophon:** Copyright © 2026 Nitya Naman · Static edge generation with zero client overhead

---

## 3. Copy Word Count Verification

The non-list prose content across all seven units totals **237 words**, safely adhering to the strict 350-word ceiling:

- Unit 01 (Eyebrow, H1, Subtitle, Tagline, Bio 1, Bio 2): **109 words**
- Unit 02 (Experience intro): **20 words**
- Unit 03 (Projects intro): **21 words**
- Unit 04 (Music intro): **21 words**
- Unit 05 (Photography intro): **24 words**
- Unit 06 (Contact intro): **21 words**
- Unit 07 (Power intro): **21 words**
- **Total Prose Word Count:** **237 words** (Constraint: < 350 words)

---

## 4. "What's Missing" Audit

Content present in `src/content/*.json` and `/tmp/recon/brain/thoughts/me.mdx` that is omitted from the current homepage:

1. **Complete Skills Matrix (`skills.json`):**
   - 36 specific tools and frameworks across 6 disciplines are entirely absent from the homepage:
     - *Languages:* Rust, Python, Java, C#, SQL (only C++ and C are mentioned).
     - *Graphics & Creative Tech:* GLSL, WebGL, Three.js, SFML, TouchDesigner.
     - *Systems & Web:* Linux, Docker, PostgreSQL, Prisma, TCP/IP, Express, Tailwind, Astro.
     - *Infrastructure:* Tailscale, Grafana, n8n, Minio, Home Assistant.
     - *Creative Suite:* Premiere Pro, After Effects.

2. **Academic Specialization & Record (`resume.astro`, `me.mdx`):**
   - Specific B.Tech degree major: **Computer Science (Graphics & Gaming)** at UPES (2025–2029).
   - Academic GPA: **CGPA 8.50**.
   - The homepage only mentions "Computer science student at UPES", dropping the gaming/graphics focus and academic performance.

3. **National Competition Awards & Recognition (`me.mdx`, `resume.astro`):**
   - **SpineSync:** 3rd place nationally at the All India Inter-DPS Science and Commerce Festival (wearable posture monitor built with Arduino Nano, flex sensors, and a Flutter companion app).
   - **The Lens:** 2nd place in 2024 film competition for pacing and visual sequence editing.
   - **Koding Books:** Inter-DPS Capital Competition technical resource library (1,000+ curated entries).

4. **Scope of High-Performance Computing Work (`projects.json`, `me.mdx`):**
   - The homepage shows Γ(1/5) as a small card, but omits the engineering scale: executed on the **UPES HPC cluster**, reaching **300 billion decimal digits** via `y-cruncher`, and **verified independently with a second distinct mathematical algorithm**.

5. **Physical Hardware & Robotics Projects (`me.mdx`):**
   - The PS5 controller-operated LEGO vehicle running on Arduino, built for the Miraki history and science exhibition (the owner's first experience having code drive a physical entity in the room).

6. **Interactive Visuals & Filmmaking Portfolio (`me.mdx`):**
   - Real-time generative visuals in **TouchDesigner** ("Lost Control - TouchDesigner Viz" documented on YouTube).
   - Short films: CL Jaipuria short film and the 2023–24 farewell film.
   - Multi-instrumentalist background: Acoustic guitar, electric guitar, bass guitar, and piano (predating DAW music production).

7. **Seven Complete Standalone Projects (`projects.json`):**
   - More than half the project index is omitted or reduced to a generic counter:
     - `fython`: Keyboard-first terminal personal finance tracker with SQLite, statement ingestion, and anomaly detection.
     - `tictactoe.c`: Pure C implementation with minimax, alpha-beta pruning, 3 difficulty tiers, and an AI transparency mode exposing move decision trees.
     - `lab-of-shadows`: Educational horror science game in Unity/C# optimized for low-end hardware.
     - `todo.rs`: Native desktop task manager in Rust using Dioxus declarative UI.
     - `kodingbooks`: Educational resource directory.
     - `spinesync`: Wearable hardware prototype.
     - `homelab`: Full project write-up detailing bare-metal infrastructure.

8. **Formative Narrative & Architectural Philosophy (`me.mdx`):**
   - The mechanical origin: taking physical machines apart and becoming a household menace before knowing what code was.
   - The epiphany: discovering machine sovereignty ("At some point, you touched a computer and... realized that you were a small God in a very small world").
   - The philosophy of tool agnosticism and intentional over-engineering as an accelerated learning tool (e.g., using Dioxus for a todo app).
   - The "Brain Archive" concept: maintaining working project logs, raw research paths, and unresolved contradictions to prevent ideas from evaporating.

9. **Explicit Canonical Page Routing (`index.astro`):**
   - Current rack units lack clear, accessible navigation links directing visitors to canonical standalone views (`/work`, `/about`, `/resume`, `/contact`, `/music`).
