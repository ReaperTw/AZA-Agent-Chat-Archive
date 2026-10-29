# Grok

Run this command. Fill `<active-cwd>`. Leave every other flag as written.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Grok -Latest -WorkingDirectory "<active-cwd>"
```

The exporter reads `GROK_SESSION_ID` from its own environment. Done when that command has run.
