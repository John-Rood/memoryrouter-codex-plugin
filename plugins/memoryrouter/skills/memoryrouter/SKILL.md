---
name: memoryrouter
description: Use MemoryRouter memory in Codex. Use when the user asks about their own work, projects, plans, decisions, preferences, people, or earlier sessions ("what am I working on?", "where did we leave off?", "what did we decide about X?"), asks Codex to remember something, or asks which MemoryRouter vault is connected.
---

# MemoryRouter in Codex

MemoryRouter is the user's own memory vault, shared by Codex, ChatGPT, Claude and Claude Code. It keeps memory across sessions and survives compaction. One sign-in is bound to one vault.

## Automatic memory (plugin hooks)

When the user has trusted this plugin's hooks, every turn works like this:

- Before each message, a hook searches the vault and adds what it finds as developer context that starts with "MemoryRouter recalled this for the current message".
- After each turn, a hook saves the user's message and your final reply. Tool calls, tool output, reasoning and subagent turns are never saved.

## Recall rule

1. If MemoryRouter context was already added for this message, answer from it and say it came from MemoryRouter. Do not search again.
2. If nothing was added and the request involves the user's own context (their work, projects, plans, decisions, preferences, people, or earlier sessions), call `search_memories` before answering, even when MemoryRouter is not named.
3. Skip MemoryRouter for general questions that do not involve the user.
4. The current repository and the user's explicit instructions take precedence over recalled memory.
5. Never claim a search or a save happened without a tool result.

## Saving

Completed turns are saved automatically. Use `store_memory` only when the user asks you to remember something specific, and never store secrets, credentials or tokens.

## Setup and troubleshooting

- If tools return an authentication error, the user should open Settings > Plugins, find MemoryRouter, and click Authenticate. New users can create an account on the sign-in page; a 14-day trial starts automatically.
- If no context is ever recalled, the hooks may not be trusted yet: start a New chat, click the hooks icon next to "Ask for approval" in the composer, choose Review hooks, and allow the three MemoryRouter hooks.
- `memory_status` shows the connected vault. To switch accounts, run `codex mcp logout memoryrouter`, reopen Codex and click Authenticate again.
