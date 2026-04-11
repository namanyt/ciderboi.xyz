# Graph Report - /home/Aaditya/project-naman/ciderboi.xyz  (2026-04-12)

## Corpus Check
- 29 files · ~539,486 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 84 nodes · 99 edges · 12 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `fetchData()` - 3 edges
2. `Socials()` - 2 edges
3. `fetchLinks()` - 2 edges
4. `Links()` - 2 edges
5. `MusicPage()` - 2 edges
6. `measureRect()` - 2 edges
7. `useScrambledText()` - 2 edges
8. `ScrambledMetadataValue()` - 2 edges
9. `handleClick()` - 2 edges
10. `cubicBezier()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Socials()` --calls--> `fetchData()`  [EXTRACTED]
  /home/Aaditya/project-naman/ciderboi.xyz/app/[social]/page.tsx → /home/Aaditya/project-naman/ciderboi.xyz/app/music/page.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (0): 

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (4): handleClick(), measureRect(), ScrambledMetadataValue(), useScrambledText()

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 0.31
Nodes (5): fetchData(), fetchLinks(), Links(), MusicPage(), Socials()

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.67
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (2): cubicBezier(), parse()

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 8`** (2 nodes): `sitemap.ts`, `sitemap()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `aspect-ratio.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._