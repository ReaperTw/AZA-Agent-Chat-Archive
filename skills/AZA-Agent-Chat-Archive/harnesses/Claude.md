# Claude Code

This command archives the local Claude Code transcript under `~/.claude/projects` or `$CLAUDE_CONFIG_DIR/projects`. claude.ai chats stay on the userscript.

Run one command. `-Latest` and `-SessionId` are different parameter sets; use one.

No live id is visible:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Claude -Latest -WorkingDirectory "<active-cwd>"
```

`CLAUDE_SESSION_ID` or `CLAUDE_CODE_SESSION_ID` is visible. Pass that id and omit `-Latest`:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Claude -SessionId "<id>" -WorkingDirectory "<active-cwd>"
```

A session whose `<session>/subagents/agent-*.jsonl` exist saves a bundle, the same layout as `harnesses/Omp.md` **Task bundle**: `conversation.md`, `subagents/<agent-id>.md` with each subagent's prompt and its SubagentHandback report, and `manifest.json` with type, model, parent and status. An earlier single-file export migrates into the bundle. A subagent whose `.meta.json` lacks `finished: true` makes the bundle partial.

Done when one of those commands has run.
