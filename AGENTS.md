# Project AGENTS Template

Use this as the starting point for new repos that expose multiple MCP servers.

## Project Summary

- State what the project is in 1-2 lines.
- List the main languages, frameworks, and package/runtime tools.

## MCP Inventory

List only the MCPs that are actually configured for the repo.

Do not blindly copy MCP names or endpoints from another repo. Graph or memory MCPs may be repo-specific.

- `graph-mcp-name`: structure, symbols, topology, relationships
- `memory-mcp-name`: durable decisions, user preferences, task continuity
- `search-mcp-name`: web discovery and documentation lookup
- `scrape-mcp-name`: exact extraction from known URLs

## Retrieval Strategy

Choose tools by information type.

For repo-internal questions:

1. Read obvious local files directly.
2. Use the graph MCP for structural questions.
3. Use the memory MCP for prior decisions and continuity.
4. Use web MCPs only for external documentation or current information.

For external API/library questions:

1. Use the search MCP to find the correct page.
2. Use the scrape MCP to extract exact details.
3. Store only durable conclusions in memory.

## Tool Pairings

### Search + Scrape

Treat web search and web scrape as a pair.

- search first to find the right page
- scrape second to extract only the exact fields or paragraphs needed
- do not scrape broadly when search has not narrowed the target yet

### Graph + Memory

Treat structure and memory as complementary, not interchangeable.

- graph owns code structure and relationships
- memory owns durable decisions, recurring fixes, and session continuity
- use graph to anchor memory to real code entities when possible
- use memory to avoid re-deriving prior conclusions
- keep graph and memory repo-scoped; avoid pointing a new repo at another repo's graph artifacts

## Agent Strategy

Use subagents deliberately to save tokens and keep the main thread focused.

- use read-only explore-style subagents for wide codebase discovery
- use general subagents for multi-step research or parallel investigation
- keep the parent agent focused on synthesis, decisions, and surgical edits

## Memory Rules

Write to memory sparingly.

Store:

- architectural decisions
- stable repo facts
- recurring bug root causes and fixes
- user preferences that affect future work

Do not store:

- raw logs
- long transcripts
- large scraped documents
- temporary brainstorming

## Verification

- prefer focused verification on touched paths
- update docs when services, ports, wrappers, or topology change
- keep instructions in sync with actual runtime behavior
