# MemoryRouter for Codex

Memory across sessions that survives compaction. Install the plugin in the Codex app, sign in once, and every Codex chat starts with what you already decided.

## What it does

- **Before each message**, Codex searches your MemoryRouter vault and adds what it finds as context. You do not have to ask.
- **After each turn**, Codex saves your message and the final reply. Tool calls, tool output, reasoning and subagent turns are never saved.
- **After compaction**, Codex pulls the thread back in from your vault.
- **One vault everywhere.** The same memory works in ChatGPT, Claude, Claude Code and Codex.

No API key and no terminal. The hooks call MemoryRouter over the sign-in you complete when you install.

## Install in the Codex app (Mac)

1. Open **Plugins** in the sidebar.
2. Choose **Add a marketplace** and enter `John-Rood/memoryrouter-codex-plugin`.
3. Pick the **MemoryRouter** marketplace, open **MemoryRouter**, and click **Install**.
4. Sign in on the MemoryRouter page that opens (or choose **Create account**; a 14-day trial starts automatically), pick a vault, and click **Authorize**.
5. Start a **New chat**. Click the hooks icon next to "Ask for approval" in the composer, choose **Review hooks**, and allow the three MemoryRouter hooks. Codex asks once.

That's it. Ask "what was I working on?" in any new chat.

## Install from the Codex CLI

```bash
codex plugin marketplace add John-Rood/memoryrouter-codex-plugin
codex plugin add memoryrouter@memoryrouter
```

Then start Codex, sign in when asked, and approve the hooks.

## What is in the plugin

| Part | File | Purpose |
| --- | --- | --- |
| MCP server | `plugins/memoryrouter/.mcp.json` | `https://mcp.memoryrouter.ai/mcp` with OAuth sign-in |
| Hooks | `plugins/memoryrouter/hooks/hooks.json` | `UserPromptSubmit` recall + save, `Stop` save, `SessionStart` (compact) restore |
| Skill | `plugins/memoryrouter/skills/memoryrouter/SKILL.md` | When to search, what gets saved, troubleshooting |

## Already used `npx memoryrouter-codex init`?

You do not need both. Keep one: either this plugin, or the npm installer's hooks. To remove the npm hooks run `npx -y memoryrouter-codex@latest uninstall`.

## Switch accounts

Run `codex mcp logout memoryrouter`, reopen Codex, and click **Authenticate** next to MemoryRouter in Settings > Plugins.

## Links

- Website: https://memoryrouter.ai
- Codex guide: https://memoryrouter.ai/codex
- Docs: https://docs.memoryrouter.ai/codex
- Privacy: https://memoryrouter.ai/privacy
- Terms: https://memoryrouter.ai/terms
- Support: hello@memoryrouter.ai

MIT License.
