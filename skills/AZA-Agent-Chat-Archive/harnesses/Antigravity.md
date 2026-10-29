# Antigravity

Archives local Antigravity desktop and `agy` CLI SQLite conversations. Requires Python 3 with stdlib `sqlite3`, plus PowerShell. Read the source databases in place, including committed WAL data; leave source and runtime state unchanged.

Install the entire skill as a physical directory at `~/.gemini/config/skills/AZA-Agent-Chat-Archive` for both desktop and CLI. The current Windows scanner skips junctions; OMP's linked installation is not sufficient. Preserve the uppercase branded name: the running Antigravity `getAllSkills` API accepts it. Copy all updated files into this installation when updating the skill. `~/.gemini/antigravity/skills` is not the current global customization root.

Desktop storage: `~/.gemini/antigravity/conversations/*.db`. CLI: `~/.gemini/antigravity-cli/conversations/*.db`. By default both are searched. `ANTIGRAVITY_APP_DATA_DIR` or `-AntigravityHome "<data-root>"` selects only that root. Resolve all script paths from this skill's directory, including when the host installs it through a link.

## Current conversation

Prefer `ANTIGRAVITY_CONVERSATION_ID`, or the conversation UUID explicitly supplied by the host. A `brain/<UUID>` artifact path is useful only when the host identifies it as the current task; a recently modified brain directory or presence lock is not proof.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Antigravity -SessionId "<current-conversation-uuid>"
```

Without a proven id, list candidates in the active workspace and ask the user to select when more than one matches. List writes no archive and does not require configuration. Do not substitute `-Latest` for an ambiguous current task.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Antigravity -List -WorkingDirectory "<active-cwd>" -Limit 20
```

For a single workspace candidate, or a user-selected candidate, run the first command with its UUID. `-SessionPath "<absolute-db-path>"` selects a specific database if the same UUID exists in both roots.

## Export boundary

Keeps the stored original user display text (`user_response`, legacy `query`) and assistant display text (`modified_response`, otherwise `response`). Expanded scope items, system context, thinking, signatures, tool calls/results, and runtime state stay private at source. Images and attachment contents are not embedded; attachment/context-only user steps increment warnings. Empty tool-only assistant steps are omitted. Multi-root workspaces are not assigned arbitrarily to a project: they use `Unknown` and increment warnings; select by id instead of workspace.

Title comes from the local conversation summaries database when available; workspace and start time come from trajectory metadata. Re-export updates the existing Markdown and `-Title` renames it under the shared exporter contract. Existing configuration gains the `Antigravity-` / `AGY_` naming pair in memory without rewriting user preferences.

Unknown step types/formats, missing step indices, malformed visible payloads, external/pruned parent histories, and legacy `.pb` files are rejected rather than presented as complete archives. Same-conversation FORK references are supported when the selected prefix is already copied into the contiguous local steps; abandoned branches are not merged. This is a visible-text archive of one local conversation, not a task/subagent bundle or a restorable Antigravity session. No UI/history equivalence claim is made from storage parsing alone.

Done when the exporter reports the saved absolute path, message/skipped/warning counts, or a specific unsupported-source error without replacing an existing archive.
