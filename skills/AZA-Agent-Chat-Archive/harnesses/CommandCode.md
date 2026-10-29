# Command Code

Run one command. `-Latest` and `-SessionId` are different parameter sets; use one.

The script will inherit `COMMANDCODE_SESSION_ID`:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness CommandCode -Latest -WorkingDirectory "<active-cwd>"
```

Substituted context hides that id from the script. Pass the id you can see, and omit `-Latest`:

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness CommandCode -SessionId "<id>" -WorkingDirectory "<active-cwd>"
```

Done when one of those commands has run.
