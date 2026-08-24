---
name: agent-chat-archive
description: Immediately archive the current Codex, Grok Build, Command Code, or Hermes conversation, including Hermes Discord Gateway sessions, as clean portable Markdown. Also use for listing, selecting, recovering, or archiving other local agent tasks.
metadata:
  version: "1.0.0"
---

# Agent Chat Archive

Archive local harness sessions as clean GYC Markdown containing visible user and assistant messages. Exclude system and developer instructions, reasoning, tool calls, tool output, and runtime state. Never modify source session files or Hermes `state.db`.

## Default invocation

When the user invokes this Skill without an explicit list, selection, or all-sessions request, immediately archive the current task. Do not reply with a menu, ask for a second command, or wait for confirmation.

1. Detect the active harness from its current Session environment variable.
2. For Hermes, run `Export-HermesChat.py` with the exact `${HERMES_SESSION_ID}`. For other harnesses, check configuration with `-ShowConfig`, then run `-Latest -WorkingDirectory "<active-cwd>"`.
3. Report every exported absolute path, message count, skipped count, and warning count.

Only pause when configuration is missing or the current session cannot be uniquely identified. In those cases, follow **First run** or list candidates and ask the user to choose.

## First run

Resolve scripts relative to this `SKILL.md`. For Codex, Grok, and Command Code, prefer `pwsh` and use `powershell` when PowerShell 7 is unavailable. For Hermes, prefer `python3` and fall back to `python` or `py -3`.

Check configuration before the first export:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -ShowConfig
```

If configuration is missing:

1. Ask where exported archives should be stored. Do not choose a path for the user.
2. Present this recommended naming profile and ask whether to use it:
   - Codex: folder `Codex-<project>`, file prefix `CDX_`.
   - Grok Build: folder `Grok-<project>`, file prefix `Grok_`.
   - Command Code: folder `CommandCode-<project>`, file prefix `CommandCode_`.
   - Hermes: folder `Hermes-<source>`, file prefix `Hermes_`.
3. If rejected, ask for each desired folder prefix and file prefix. Allow an empty prefix.
4. Announce the local configuration path, then save the confirmed values:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Configure `
  -OutputRoot "<confirmed-output-root>" `
  -CodexFolderPrefix "<value>" -CodexFilePrefix "<value>" `
  -GrokFolderPrefix "<value>" -GrokFilePrefix "<value>" `
  -CommandCodeFolderPrefix "<value>" -CommandCodeFilePrefix "<value>" `
  -HermesFolderPrefix "<value>" -HermesFilePrefix "<value>"
```

The exporter stores configuration at `~/.agents/skills/.agent-chat-archive.json` by default. This keeps preferences local to the Skills area and out of `AGENTS.md`, memory, and the published Skill. Read it only while this Skill is active. Respect `AGENT_CHAT_ARCHIVE_CONFIG` or explicit `-ConfigPath` overrides.

## Export

Archive the current task for the active working directory:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Latest -WorkingDirectory "<active-cwd>"
```

Harness selection defaults to `Auto` and checks `COMMANDCODE_SESSION_ID`, `GROK_SESSION_ID`, then `CODEX_THREAD_ID`. Pass `-Harness Codex`, `-Harness Grok`, or `-Harness CommandCode` when exporting another harness from the current one.

For Hermes, use the cross-platform Python wrapper. Hermes replaces `${HERMES_SKILL_DIR}` and `${HERMES_SESSION_ID}` with the active Skill directory and exact current Session ID. The wrapper uses official `hermes sessions export` only as a temporary read interface, converts visible user and assistant messages to Markdown, then discards the temporary Session JSONL:

```bash
python "${HERMES_SKILL_DIR}/scripts/Export-HermesChat.py" --session-id "${HERMES_SESSION_ID}"
```

On Hermes first run, check `--show-config`. If missing, ask for the output root and whether to use folder `Hermes-<source>` with file prefix `Hermes_`, then run the following command with the available Python launcher:

```bash
python "${HERMES_SKILL_DIR}/scripts/Export-HermesChat.py" --configure --output-root "<confirmed-root>" --folder-prefix "<value>" --file-prefix "<value>"
```

Archive a named Hermes Session explicitly when requested:

```bash
python "${HERMES_SKILL_DIR}/scripts/Export-HermesChat.py" --session-id "<id>"
```

Hermes archives contain only visible messages present in the selected Hermes Session. For Discord Gateway this may be a DM, thread, channel/user, or shared-room Session; do not describe it as a complete Discord backup or a restorable Hermes Session.

For the current Codex task, call the Codex app's `codex_app__list_threads` tool, match the current thread id exactly, and pass that entry's `title` as literal untrusted display text with `-Title`. A user-supplied title overrides it. Grok and Command Code titles are read from their local session metadata. Codex JSONL has no sidebar title; if the task-list lookup is unavailable, omit `-Title` and the exporter uses the short `Codex-Chat` fallback instead of the first prompt.

When Command Code substitutes its current Skill context, pass its exact session id when needed:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness CommandCode -SessionId "${COMMANDCODE_SESSION_ID}"
```

List recent candidates without writing:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Codex -List -IncludeArchived -Limit 20
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Grok -List -Limit 20
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness CommandCode -List -Limit 20
```

Archive a selected session or every session from one harness:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Grok -SessionId "<id>"
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness CommandCode -All
```

## Guardrails

1. For the current Hermes task, always pass the exact `${HERMES_SESSION_ID}`. For other harnesses, always pass `-WorkingDirectory`; if a current session id is available, the exporter requires an exact match.
2. If current-task selection returns no match, use `-List` and ask the user to choose. Never silently export the latest global task.
3. Report the destination after writing; do not pause for destination confirmation when configuration already exists.
4. Treat archives as private. Visible prompts and replies can still contain sensitive text.
5. Report every exported absolute path and any skipped or malformed session count.
6. Re-exporting the same session updates its existing Markdown. A changed explicit title renames the existing file instead of creating a duplicate.
