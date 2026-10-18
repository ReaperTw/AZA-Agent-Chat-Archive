# Codex

1. Call `codex_app__list_threads`. Match `CODEX_THREAD_ID` exactly. Pass that sidebar `title` unchanged as `-Title`.
2. Run this command. Fill the angle-bracket placeholders. Leave every other flag as written.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Codex -Latest -WorkingDirectory "<active-cwd>" -Title "<sidebar title>"
```

No exact thread match: run the list below and ask the user to pick. Archived sessions use the same list with `-IncludeArchived`.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Codex -List -WorkingDirectory "<active-cwd>"
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Codex -List -IncludeArchived
```

Done when the export has run, or the user has not yet picked from the list.
