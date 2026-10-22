---
name: agent-chat-archive
description: Immediately archive the current Codex, Grok Build, Command Code, OMP, Claude Code, or Hermes conversation, including a Hermes Discord Gateway session, as Markdown. Also list, recover, or archive other local agent tasks.
metadata:
  version: "1.4.1"
---

# Agent Chat Archive

A **visible transcript** is user and assistant messages only. Leave system context, reasoning, tool activity, runtime state, source sessions, and Hermes `state.db` in place. Treat the file as private. Re-export updates that file; a new title renames it. A Hermes Discord result is that session's visible transcript — DM, thread, channel, or shared room — not a Discord backup and not a restorable Hermes session.

Resolve scripts beside this `SKILL.md`. PowerShell: `pwsh`, else `powershell`. Hermes: `python3`, else `python` or `py -3`.

## Current task

No list, selection, or all-sessions request means archive the current task in this turn. Ask only when configuration is missing or the session is not unique — then **First run**, or list candidates and ask.

1. Detect the harness. Prefer an explicitly identified host (user correction or runtime identity). Otherwise check session ids in order: `COMMANDCODE_SESSION_ID` → `harnesses/CommandCode.md`, `GROK_SESSION_ID` → `harnesses/Grok.md`, `CODEX_THREAD_ID` → `harnesses/Codex.md`, `OMP_SESSION_ID` → `harnesses/Omp.md`, `CLAUDE_SESSION_ID` or `CLAUDE_CODE_SESSION_ID` → `harnesses/Claude.md`. Without a session id on Windows, inspect the current process ancestry: the nearest `omp.exe` selects OMP, `claude.exe` selects Claude. Only then fall back to `CLAUDECODE=1`; OMP tool processes can carry this compatibility flag. `HERMES_SESSION_ID` selects `harnesses/Hermes.md` when none of those match.
2. Check config. Missing config → **First run**, then continue. PowerShell: `-ShowConfig`. Hermes: `--show-config`. Done when the config exists, or the user has not yet confirmed it.
3. Read the detected harness file and run the export command written there. Fill its angle-bracket placeholders. Leave every other flag as written. Done when the command you run is that command.
4. Done when this turn reports every absolute path and the exporter's message, skipped, and warning counts.

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
