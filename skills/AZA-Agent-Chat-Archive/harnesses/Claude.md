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

Done when one of those commands has run.
