# Runtime Notes

This repo normally works best in retrieval mode:

```bash
/home/Aaditya/bin/ai-profile retrieval
```

That keeps these services hot:

- `rag-embed.service`
- `rag-rerank.service`
- `neo4j-memory-mcp.service`

Gemma mode is:

```bash
/home/Aaditya/bin/ai-profile gemma
```

`graphify-local` only knows what is in `graphify-out/graph.json`. Rebuild the graph artifacts if major repo structure changes make Graphify answers look stale.
