---
name: mcp-research
description: Use paired MCP workflows for efficient repo and web research
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: mcp
---

## Purpose

Use this skill when the task involves gathering context efficiently across multiple MCP servers.

## Core Pairings

### Search + Scrape

For external knowledge:

1. Use `searxng-local` first to discover the right page.
2. Use `firecrawl-local` second to extract the exact details needed.
3. Avoid broad scraping before the target page is known.
4. Prefer structured extraction for fields, parameters, endpoints, and lists.

### Graph + Memory

For repo knowledge:

1. Use `graphify-local` for structure, neighborhoods, communities, and paths.
2. Use `neo4j-memory-local` for prior decisions, durable facts, and continuity.
3. Combine both when you need to connect a code entity to prior work or decisions.
4. Keep memory repo-scoped and avoid duplicating whole graph structure.

## Efficiency Rules

- Prefer local files when the path is obvious.
- Prefer `graphify-local` over grep when the question is structural.
- Prefer memory over re-deriving prior decisions.
- Prefer subagents for broad exploration, not for final synthesis.
- Return the minimum useful context for the parent agent.

## When To Escalate To Subagents

- Use `explore` for broad read-only repo investigation.
- Use `general` for multi-source research or parallel investigation.
- Keep the parent agent focused on synthesis and edits.
