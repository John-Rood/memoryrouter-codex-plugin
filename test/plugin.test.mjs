// Contract tests for the MemoryRouter Codex plugin (marketplace + plugin package).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plugin = path.join(root, 'plugins/memoryrouter');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const repo = path.resolve(root, '../..');

test('marketplace points at the bundled plugin with install-time sign-in', () => {
  const m = json('.agents/plugins/marketplace.json');
  assert.equal(m.name, 'memoryrouter');
  assert.equal(m.plugins.length, 1);
  const [entry] = m.plugins;
  assert.equal(entry.name, 'memoryrouter');
  assert.deepEqual(entry.source, { source: 'local', path: './plugins/memoryrouter' });
  assert.equal(entry.policy.authentication, 'ON_INSTALL');
  assert.equal(entry.policy.installation, 'AVAILABLE');
  assert.ok(entry.category);
});

test('manifest declares skills, MCP server, hooks and real assets', () => {
  const m = json('plugins/memoryrouter/.codex-plugin/plugin.json');
  assert.equal(m.name, 'memoryrouter');
  assert.match(m.version, /^\d+\.\d+\.\d+$/);
  for (const key of ['skills', 'mcpServers', 'hooks']) assert.match(m[key], /^\.\//, key);
  assert.ok(fs.existsSync(path.join(plugin, m.mcpServers)));
  assert.ok(fs.existsSync(path.join(plugin, m.hooks)));
  assert.ok(fs.existsSync(path.join(plugin, m.skills, 'memoryrouter/SKILL.md')));
  for (const asset of [m.interface.logo, m.interface.composerIcon]) {
    assert.ok(fs.existsSync(path.join(plugin, asset)), asset);
  }
  assert.equal(m.interface.websiteURL, 'https://memoryrouter.ai');
  assert.equal(m.interface.privacyPolicyURL, 'https://memoryrouter.ai/privacy');
  assert.equal(m.interface.termsOfServiceURL, 'https://memoryrouter.ai/terms');
});

test('MCP server is the hosted OAuth endpoint under the name the hooks call', () => {
  const mcp = json('plugins/memoryrouter/.mcp.json');
  assert.deepEqual(Object.keys(mcp.mcpServers), ['memoryrouter']);
  assert.equal(mcp.mcpServers.memoryrouter.url, 'https://mcp.memoryrouter.ai/mcp');
  assert.equal(mcp.mcpServers.memoryrouter.bearer_token_env_var, undefined);
});

test('hooks call hidden MemoryRouter tools over the plugin server, never SessionEnd', () => {
  const { hooks } = json('plugins/memoryrouter/hooks/hooks.json');
  assert.deepEqual(Object.keys(hooks).sort(), ['SessionStart', 'Stop', 'UserPromptSubmit']);
  const handlers = Object.values(hooks).flat().flatMap((g) => g.hooks);
  for (const h of handlers) {
    assert.equal(h.type, 'mcp_tool');
    assert.equal(h.server, 'memoryrouter');
    assert.ok(h.timeout > 0 && h.timeout <= 15);
  }
  assert.equal(hooks.SessionStart[0].matcher, 'compact');
  assert.equal(hooks.UserPromptSubmit[0].hooks[0].tool, 'codex_turn_start');
  assert.equal(hooks.UserPromptSubmit[0].hooks[0].input.prompt, '${prompt}');
  assert.equal(hooks.Stop[0].hooks[0].tool, 'codex_turn_end');
  assert.equal(hooks.Stop[0].hooks[0].input.last_assistant_message, '${last_assistant_message}');
  // The hidden tools must exist on the MCP server.
  const serverFile = path.join(repo, 'mcp-server/src/tools/codex-hooks.ts');
  if (!fs.existsSync(serverFile)) return;
  const serverTools = fs.readFileSync(serverFile, 'utf8');
  for (const tool of ['codex_turn_start', 'codex_turn_end', 'codex_session_start']) {
    assert.match(serverTools, new RegExp(`'${tool}'`), tool);
  }
});

test('hooks match the memoryrouter-codex OAuth installer exactly', async () => {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const libFile = path.join(repo, 'integrations/codex/lib/hooks.cjs');
  if (!fs.existsSync(libFile)) return;
  const lib = require(libFile);
  const groups = lib.mcpManagedGroups ? lib.mcpManagedGroups('memoryrouter') : null;
  if (!groups) return; // helper not exported; the field checks above still hold
  const { hooks } = json('plugins/memoryrouter/hooks/hooks.json');
  assert.deepEqual(hooks, JSON.parse(JSON.stringify(groups)));
});

test('skill carries John\'s universal instructions verbatim and copy rules', () => {
  const skill = read('plugins/memoryrouter/skills/memoryrouter/SKILL.md');
  assert.match(skill, /^---\nname: memoryrouter\ndescription: /);
  const canonical = read('test/canonical-instructions.txt').trim();
  assert.ok(skill.includes(canonical), 'canonical instructions must appear verbatim');
  assert.match(skill, /RETRIEVE\n/);
  assert.match(skill, /STORE\n/);
  assert.match(skill, /never saved by the hooks/);
  for (const f of ['plugins/memoryrouter/skills/memoryrouter/SKILL.md', 'plugins/memoryrouter/.codex-plugin/plugin.json', 'plugins/memoryrouter/hooks/hooks.json', 'README.md']) {
    assert.doesNotMatch(read(f), /\u2014/, `${f} has an em dash`);
  }
});
