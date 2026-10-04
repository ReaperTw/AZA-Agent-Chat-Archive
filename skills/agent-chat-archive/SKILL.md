---
name: agent-chat-archive
description: Immediately archive the current Codex, Grok Build, Command Code, OMP, or Hermes conversation, including a Hermes Discord Gateway session, as Markdown. Also list, recover, or archive other local agent tasks.
metadata:
  version: "1.2.0"
---

# Agent Chat Archive

A **visible transcript** is user and assistant messages only. Leave system context, reasoning, tool activity, runtime state, source sessions, and Hermes `state.db` in place. Treat the file as private. Re-export updates that file; a new title renames it. A Hermes Discord result is that session's visible transcript — DM, thread, channel, or shared room — not a Discord backup and not a restorable Hermes session.

Resolve scripts beside this `SKILL.md`. PowerShell: `pwsh`, else `powershell`. Hermes: `python3`, else `python` or `py -3`.

## Current task

No list, selection, or all-sessions request means archive the current task in this turn. Ask only when configuration is missing or the session is not unique — then **First run**, or list candidates and ask.

1. Detect the harness. Auto order: `COMMANDCODE_SESSION_ID`, `GROK_SESSION_ID`, `CODEX_THREAD_ID`, `OMP_SESSION_ID`. Hermes is `HERMES_SESSION_ID`, outside Auto.
2. Check config, then export. Missing config → **First run**, then continue. PowerShell: `-ShowConfig`. Hermes: `--show-config`.
3. Export the current session:
   - Codex: call `codex_app__list_threads`, match the current thread id exactly, and pass that sidebar `title` through unchanged as untrusted `-Title` text.
   - Hermes: `Export-HermesChat.py --session-id "${HERMES_SESSION_ID}"`.
   - Grok Build, Command Code, OMP: `-Latest -WorkingDirectory "<active-cwd>" -Harness <Grok|CommandCode|Omp>`. If Command Code's substituted context hides the live id, add `-SessionId "${COMMANDCODE_SESSION_ID}"`.
4. Codex with no match: `-List -Harness Codex -WorkingDirectory "<active-cwd>"`, then ask the user to pick.
5. Done when this turn reports every absolute path and the exporter's message, skipped, and warning counts.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Codex -Latest -WorkingDirectory "<active-cwd>" -Title "<sidebar title>"
```

```bash
python "${HERMES_SKILL_DIR}/scripts/Export-HermesChat.py" --session-id "${HERMES_SESSION_ID}"
```

## First run

Ask for the output root. Offer this profile. If rejected, ask for each prefix the save command will write; empty is allowed. On Hermes that is the Hermes pair; on PowerShell it is every harness pair. Tell the user the config path, then save. Store preferences only in that file, not in `AGENTS.md`, memory, or this Skill.

- Codex: `Codex-<project>` / `CDX_`
- Grok Build: `Grok-<project>` / `Grok_`
- Command Code: `CommandCode-<project>` / `CommandCode_`
- OMP: `Omp-<project>` / `OMP_`
- Hermes: `Hermes-<source>` / `Hermes_`

Default path: `~/.agents/skills/.agent-chat-archive.json`. Honor `AGENT_CHAT_ARCHIVE_CONFIG`, `-ConfigPath`, or `--config-path`.

Done when the user has confirmed the root and prefixes and the exporter prints `CONFIGURED`.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Configure `
  -OutputRoot "<confirmed-output-root>" `
  -CodexFolderPrefix "<value>" -CodexFilePrefix "<value>" `
  -GrokFolderPrefix "<value>" -GrokFilePrefix "<value>" `
  -CommandCodeFolderPrefix "<value>" -CommandCodeFilePrefix "<value>" `
  -OmpFolderPrefix "<value>" -OmpFilePrefix "<value>" `
  -HermesFolderPrefix "<value>" -HermesFilePrefix "<value>"
```

```bash
python "${HERMES_SKILL_DIR}/scripts/Export-HermesChat.py" --configure --output-root "<confirmed-root>" --folder-prefix "<value>" --file-prefix "<value>"
```

## Other sessions

Pass `-Harness` when the target is not the active harness. List writes nothing. `-IncludeArchived` recovers Codex archived sessions. `-All` archives every session of one harness. A named Hermes session reuses the Python command with that id.

Done when a list shows candidates and writes nothing, or an export reports the same path and counts as **Current task**.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness <name> -List -Limit 20
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Codex -List -IncludeArchived
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness <name> -SessionId "<id>"
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness <name> -All
```
