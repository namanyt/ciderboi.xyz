# MCP Workflows

Use the MCPs in pairs when it reduces token usage and avoids redundant retrieval.

## Search + Scrape

- use `searxng-local` to discover the right external page
- use `firecrawl-local` to extract exact details from the chosen page
- for structured details such as fields, parameters, or lists, prefer structured extraction over broad page reads
- do not scrape widely until search has narrowed the target

## Graph + Memory

- use `graphify-local` for structure, topology, paths, and neighborhoods
- use `neo4j-memory-local` for prior decisions, preferences, and continuity
- combine them when a durable conclusion needs to be anchored to a real code entity
- do not duplicate whole code structure into memory

## Subagent Usage

- use `explore` for broad read-only repo discovery
- use `general` for multi-step or parallel research
- keep the parent agent focused on synthesis and surgical edits
