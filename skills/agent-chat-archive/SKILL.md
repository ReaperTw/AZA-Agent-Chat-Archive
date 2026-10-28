---
name: agent-chat-archive
description: Archive current or selected local agent conversations; list or recover saved tasks. Supports Codex, Grok Build, Command Code, OMP task bundles with subagents, Claude Code, and Hermes including Discord Gateway sessions.
metadata:
  version: "1.5.0"
---

# Agent Chat Archive

A **visible transcript** contains user and assistant text. Preserve system context, reasoning, tool activity, runtime state, source sessions, and Hermes `state.db` at their source; keep exports private. OMP saves a task bundle with subagent transcripts; other harnesses save one Markdown file. Re-export updates the same session's archive; a new title renames it. These are conversation archives, not restorable sessions or backups of referenced files. A Hermes Discord export covers its session — DM, thread, channel, or shared room — rather than a Discord backup.

Resolve scripts beside this `SKILL.md`. PowerShell: `pwsh`, else `powershell`. Hermes: `python3`, else `python` or `py -3`.

## Current task

For an archive request without a list, selection, or all-sessions scope, archive the current task in this turn. For questions or maintenance of this skill, answer or edit it; run an archive only when requested. Ask only when configuration is missing or the session is not unique — then **First run**, or list candidates and ask.

1. Detect the harness. Prefer an explicitly identified host (user correction or runtime identity). Otherwise check session ids in order: `COMMANDCODE_SESSION_ID` → `harnesses/CommandCode.md`, `GROK_SESSION_ID` → `harnesses/Grok.md`, `CODEX_THREAD_ID` → `harnesses/Codex.md`, `OMP_SESSION_ID` → `harnesses/Omp.md`, `CLAUDE_SESSION_ID` or `CLAUDE_CODE_SESSION_ID` → `harnesses/Claude.md`. Without a session id on Windows, inspect the current process ancestry: the nearest `omp.exe` selects OMP, `claude.exe` selects Claude. Only then fall back to `CLAUDECODE=1`; OMP tool processes can carry this compatibility flag. `HERMES_SESSION_ID` selects `harnesses/Hermes.md` when none of those match.
2. Check config. Missing config → **First run**, then continue. PowerShell: `-ShowConfig`. Hermes: `--show-config`. Done when the config exists, or the user has not yet confirmed it.
3. Read the detected harness file and run the export command written there. Fill its angle-bracket placeholders. Leave every other flag as written. Done when the command you run is that command.
4. Done when this turn reports every saved absolute path, message, skipped, and warning counts, plus any completeness status and unresolved items reported by the exporter. For OMP, apply the bundle completion gate in `harnesses/Omp.md`.

## First run

Ask for the output root. Offer this profile. If rejected, ask for each prefix the save command will write; empty is allowed. On Hermes that is the Hermes pair; on PowerShell it is every harness pair. Tell the user the config path, then save. Store preferences only in that file, not in `AGENTS.md`, memory, or this Skill.

- Codex: `Codex-<project>` / `CDX_`
- Grok Build: `Grok-<project>` / `Grok_`
- Command Code: `CommandCode-<project>` / `CommandCode_`
- OMP: `Omp-<project>` / `OMP_`
- Hermes: `Hermes-<source>` / `Hermes_`
- Claude Code: `Claude-<project>` / `Claude_`

Default path: `~/.agents/skills/.agent-chat-archive.json`. Honor `AGENT_CHAT_ARCHIVE_CONFIG`, `-ConfigPath`, or `--config-path`.

Done when the user has confirmed the root and prefixes and the exporter prints `CONFIGURED`.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Configure `
  -OutputRoot "<confirmed-output-root>" `
  -CodexFolderPrefix "<value>" -CodexFilePrefix "<value>" `
  -GrokFolderPrefix "<value>" -GrokFilePrefix "<value>" `
  -CommandCodeFolderPrefix "<value>" -CommandCodeFilePrefix "<value>" `
  -OmpFolderPrefix "<value>" -OmpFilePrefix "<value>" `
  -HermesFolderPrefix "<value>" -HermesFilePrefix "<value>" `
  -ClaudeFolderPrefix "<value>" -ClaudeFilePrefix "<value>"
```

```bash
python "${HERMES_SKILL_DIR}/scripts/Export-HermesChat.py" --configure --output-root "<confirmed-root>" --folder-prefix "<value>" --file-prefix "<value>"
```

## Other sessions

Pass `-Harness` when the target is not the active harness. List writes nothing. A named Hermes session uses the command in `harnesses/Hermes.md` with that id. Archived Codex sessions use the list command in `harnesses/Codex.md`.

Done when a list shows candidates and writes nothing, or an export reports the same path and counts as **Current task**.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness <name> -List -Limit 20
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness <name> -SessionId "<id>"
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness <name> -All
```
