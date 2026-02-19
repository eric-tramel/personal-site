---
title: "Why Not Both?"
date: 2026-02-09
tags:
  - mcp
  - agents
  - claude-code
  - codex
  - openai
author: erictramel
draft: false
description: Wiring OpenAI's Codex into Claude Code via MCP. Two model families, one terminal, real bugs found.
---

I use Claude Code as my primary coding tool. I run a persistent agent that maintains notes, searches its own conversation history, and dispatches subagents for implementation work. It's all Claude Opus 4.6 under the hood, which means all the coding subagents share the same training, the same architecture, and the same blind spots. When I saw that OpenAI's [Codex CLI](https://github.com/openai/codex) supports running as an [MCP server](https://developers.openai.com/codex/mcp/), the obvious question was whether I could wire it into my existing setup and get a second model family without changing workflows. Turns out you can, and the results were interesting enough to share.

This isn't a novel technique. MCP is a standard protocol, and the building blocks are documented. But I haven't seen many people actually connecting competing agent platforms this way, so here's what happened when I tried it.

## Setup

Both Claude Code and Codex support [MCP](https://modelcontextprotocol.io/), the Model Context Protocol. Claude Code consumes MCP servers as tools. Codex can [run as an MCP server](https://developers.openai.com/codex/mcp/). The config is one entry in `.mcp.json`:

```json
{
  "mcpServers": {
    "codex": {
      "command": "codex",
      "args": ["mcp-server"]
    }
  }
}
```

After a session restart, two new tools appear: `codex` (start a session) and `codex-reply` (continue one). Stateful multi-turn conversations with `gpt-5.3-codex-xhigh`, callable the same way my agent calls its note search or conversation history tools. Credit to the [Codex team](https://github.com/openai/codex) for building the MCP server mode. Making your agent composable rather than siloed is a genuinely forward-looking design choice, and it worked on the first try with zero auth issues.

## What Happened

I asked Claude Code to review `mcp/note_search.py`, a BM25 search server I [shared yesterday](/blog/2026-02-07-searchable-agent-memory/), using multiple Codex sessions from different angles. The prompt was simple:

> Can you try running multiple parallel requests at the same time to it to review a file from multiple angles?

The Claude Opus 4.6 agent decided on its own to dispatch three simultaneous MCP tool calls:

```python
# three parallel tool calls, dispatched simultaneously
codex(
    prompt="Read mcp/note_search.py. Review for correctness and edge cases. "
           "Bugs, race conditions, failure modes causing silent data loss "
           "or incorrect results. Cite line numbers.",
    sandbox="read-only",
)
codex(
    prompt="Read mcp/note_search.py. Review for performance and scalability. "
           "Hot paths, unnecessary recomputation, memory concerns "
           "as corpus grows. Cite line numbers.",
    sandbox="read-only",
)
codex(
    prompt="Read mcp/note_search.py. Review for API design and usability. "
           "Missing parameters, confusing defaults, interface issues. "
           "What would you change?",
    sandbox="read-only",
)
```

Each call starts an independent `gpt-5.3-codex-xhigh` session with its own thread ID. The Claude agent dispatches all three in one turn, the same way it would dispatch any other parallel tool calls. The mechanism is identical to searching notes or reading files. The difference is that these tool calls spin up full coding agent sessions on a completely different model substrate. Three results came back in under a minute, helped by the fact that `gpt-5.3-codex` is [served on NVIDIA GB200 NVL72 Blackwell systems](https://x.com/nvidianewsroom/status/2019478513427141080) with a significantly faster inference path than its predecessor.

The correctness review caught a real bug in the watchdog file-move handler:

```python
def on_moved(self, event):
    if not event.is_directory:
        self._maybe_reindex(event.dest_path)
```

Only `dest_path` is checked. When a file is moved out of the watched directory, the reindex processes the destination, but the source file's index entries are never cleaned up. Ghost entries persist in the BM25 index, and search returns results for files that no longer exist. Claude Opus 4.6 built this code and iterated on it across multiple sessions without catching it. `gpt-5.3-codex-xhigh` flagged it on the first pass.

The performance review flagged full-corpus rebuilds on every file event without debounce, plus filtered queries degrading to O(N) scans of the full result set. The API review pointed out return values as JSON strings instead of structured objects, empty-string sentinels where `None` belongs, and a silent 30-day default on `list_notes` that hides older content without telling the caller. Eighteen issues total across three reviews, several of them legitimate bugs that survived a week of building.

I asked Claude Code to fix the issues. It compiled the eighteen findings into a spec on its own and dispatched a new Codex session:

```python
codex(
    prompt="You have two Python MCP servers to fix. "
           "Read both files, then implement all fixes in order. "
           "[full spec with 18 issues follows]",
    sandbox="workspace-write",
)
```

Codex patched both servers. The whole review-spec-fix loop took about ten minutes. I typed two prompts. The Claude Opus 4.6 agent handled the rest: dispatching three parallel reviews on a different model substrate, collecting results, compiling a fix spec, and sending it back to `gpt-5.3-codex-xhigh` for implementation.

The information-theoretic argument for why this works is simple: two models from the same family produce correlated errors. When Claude Opus 4.6 reviews its own code, shared training means shared blind spots. A model with different training and different failure modes provides less correlated signal, which means higher information gain per review. The `on_moved` bug is a concrete example. It survived a week of same-model iteration because nothing about it pattern-matches to "wrong" if you share the same priors. A differently-trained model caught it immediately.

MCP is what makes this practical. Without a standard protocol, cross-model collaboration means shell scripts, file handoffs, and custom glue. With MCP, the second model is just another tool call. Any agent that can run as an MCP server becomes a tool for any agent that can consume one, and you don't have to pick a favorite.
