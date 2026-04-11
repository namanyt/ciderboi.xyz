# Graph Report - /home/Aaditya/project-naman/ciderboi.xyz  (2026-04-12)

## Corpus Check
- 29 files · ~537,872 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 75 nodes · 90 edges · 13 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `fetchData()` - 3 edges
2. `Socials()` - 2 edges
3. `fetchLinks()` - 2 edges
4. `Links()` - 2 edges
5. `MusicPage()` - 2 edges
6. `formatDateShort()` - 2 edges
7. `ReleaseCountdownCard()` - 2 edges
8. `cubicBezier()` - 2 edges
9. `parse()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Socials()` --calls--> `fetchData()`  [EXTRACTED]
  /home/Aaditya/project-naman/ciderboi.xyz/app/[social]/page.tsx → /home/Aaditya/project-naman/ciderboi.xyz/app/music/page.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (0): 

### Community 1 - "Community 1"
Cohesion: 0.31
Nodes (5): fetchData(), fetchLinks(), Links(), MusicPage(), Socials()

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (2): formatDateShort(), ReleaseCountdownCard()

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 0.38
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (2): cubicBezier(), parse()

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 9`** (2 nodes): `sitemap.ts`, `sitemap()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `aspect-ratio.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._