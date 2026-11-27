---
name: AZA-Agent-Chat-Archive
description: Archive current or selected local agent conversations; list or recover saved tasks. Supports Antigravity desktop and CLI, Codex, Grok Build, Command Code, OMP task bundles with subagents, Claude Code, and Hermes including Discord Gateway sessions.
metadata:
  version: "1.6.6"
---

# AZA-Agent-Chat-Archive

A **visible transcript** contains user and assistant text. Preserve system context, reasoning, tool activity, runtime state, source sessions, and Hermes `state.db` at their source; keep exports private. OMP, and Claude Code or Antigravity sessions with subagents, save a task bundle with subagent transcripts; other exports are one Markdown file. Re-export updates the same session's archive; a new title renames it. These are conversation archives, not restorable sessions or backups of referenced files. A Hermes Discord export covers its session — DM, thread, channel, or shared room — rather than a Discord backup.

Resolve scripts beside this `SKILL.md`. PowerShell: `pwsh`, else `powershell`. Antigravity also needs Python 3 (stdlib only). Hermes: `python3`, else `python` or `py -3`.

## Current task

For an archive request without a list, selection, or all-sessions scope, archive the current task in this turn. For questions or maintenance of this skill, answer or edit it; run an archive only when requested. Ask only when configuration is missing or the session is not unique — then **First run**, or list candidates and ask.

1. Detect the harness. Prefer an explicitly identified host (user correction or runtime identity). Antigravity → `harnesses/Antigravity.md`. Otherwise check session ids in order: `COMMANDCODE_SESSION_ID` → `harnesses/CommandCode.md`, `GROK_SESSION_ID` → `harnesses/Grok.md`, `CODEX_THREAD_ID` → `harnesses/Codex.md`, `OMP_SESSION_ID` → `harnesses/Omp.md`, `CLAUDE_SESSION_ID` or `CLAUDE_CODE_SESSION_ID` → `harnesses/Claude.md`, `ANTIGRAVITY_CONVERSATION_ID` → `harnesses/Antigravity.md`. Without a session id on Windows, inspect the current process ancestry: the nearest `omp.exe` selects OMP, `claude.exe` selects Claude, `Antigravity.exe` or `agy.exe` selects Antigravity. Only then fall back to `CLAUDECODE=1`; OMP tool processes can carry this compatibility flag. `HERMES_SESSION_ID` selects `harnesses/Hermes.md` when none of those match.
2. Check config. Missing config → **First run**, then continue. PowerShell: `-ShowConfig`. Hermes: `--show-config`. Done when the config exists, or the user has not yet confirmed it.
3. Read the detected harness file and run the export command written there. Fill its angle-bracket placeholders. Leave every other flag as written, except **Important** and **Rename** below. Done when the command you run is that command.
4. Report briefly. On success give only the main absolute path (a bundle: its directory; otherwise the `.md`) and the saved name. Mention warnings, skips, a bundle's `partial` or unknown completeness with its unresolved items, or a failed catalog registration only when they occur, in one short line each. Leave out message counts, the `SUMMARY` line, attachment lists, and catalog warnings about other files. For any bundle, apply the completion gate in `harnesses/Omp.md`. Done when that report is given.

## Important

The user marks a conversation important (important, mark as important, 重要, 標重要) when it changed their overall system and later agents should be able to find what was done. Append `-Important` (Hermes: `--important`) to the export command. The archive goes flat into `<outputRoot>/_important/`, with no project subfolder; a session already archived moves there. An archive anywhere under `_important`, including subfolders the user creates, stays put on later exports and renames, with or without the flag. Without the flag, every existing archive also stays in its current folder.

Done when the reported path is under `_important`.

## Rename

When the user asks to rename (rename, 重新命名, 取個名字), write the title yourself and pass it as `-Title` (Hermes: `--title`). It replaces the harness or first-prompt title and combines with **Important**.

The title names what the conversation ended up doing, not where it started. A chat that opened on an Obsidian thinking-system idea but turned into fixing an Obsidian plugin is `Obsidian插件修復`. Keep it short enough to recognize at a glance: one topic, about 6–16 characters, no dates or harness names.

Read as little as the title needs:

- Current conversation: name it from what you already know. Read nothing.
- Other sessions: skim the archived Markdown, roughly the first 80 and last 40 lines; export once without `-Title` first if none exists. If you are a large model and the harness can spawn a cheaper subagent, hand it the paths and these title rules and have it return one title per file, batching all files of one request into one subagent.

A rename changes the archive path; when registering the catalog, pass `--replaces <old path>`.

Done when the reported path carries the new title.

## First run

Ask for the output root. Offer this profile. If rejected, ask for each prefix the save command will write; empty is allowed. On Hermes that is the Hermes pair; on PowerShell it is every harness pair. Tell the user the config path, then save. Store preferences only in that file, not in `AGENTS.md`, memory, or this Skill.

- Codex: `Codex-<project>` / `CDX_`
- Grok Build: `Grok-<project>` / `Grok_`
- Command Code: `CommandCode-<project>` / `CommandCode_`
- OMP: `Omp-<project>` / `OMP_`
- Hermes: `Hermes-<source>` / `Hermes_`
- Claude Code: `Claude-<project>` / `Claude_`
- Antigravity: `Antigravity-<project>` / `AGY_`

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
  -ClaudeFolderPrefix "<value>" -ClaudeFilePrefix "<value>" `
  -AntigravityFolderPrefix "<value>" -AntigravityFilePrefix "<value>"
```

```bash
python "${HERMES_SKILL_DIR}/scripts/Export-HermesChat.py" --configure --output-root "<confirmed-root>" --folder-prefix "<value>" --file-prefix "<value>"
```

## Other sessions

Pass `-Harness` when the target is not the active harness. List writes nothing. A named Hermes session uses the command in `harnesses/Hermes.md` with that id. Archived Codex sessions use the list command in `harnesses/Codex.md`.

Done when a list shows candidates and writes nothing, or an export gives the same report as **Current task** step 4.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness <name> -List -Limit 20
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness <name> -SessionId "<id>"
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness <name> -All
```
