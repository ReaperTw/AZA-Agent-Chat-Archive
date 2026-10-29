# OMP

Run this command. Fill `<active-cwd>`. Leave every other flag as written.

```powershell
& "<skill-dir>\scripts\Export-AgentChat.ps1" -Harness Omp -Latest -WorkingDirectory "<active-cwd>"
```

The exporter reads `OMP_SESSION_ID` from its own environment.

## Task bundle

Each OMP task saves a directory under the configured project folder:

- `conversation.md`: main visible transcript and linked subagent index.
- `subagents/*.md`: each available subagent's task instructions and visible conversation, including nested agents. Files stay flat; headers and manifest retain parent relationships.
- `manifest.json`: session and agent IDs, relative attachment paths, export status, message counts, warnings, and unresolved items.

The exporter discovers descendants from OMP session files and delegation references. Failed or cancelled agents remain part of the task; retain their available visible messages. Tool payloads may identify descendants but are excluded from transcript text.

Re-export matches session and agent IDs. A requested title renames the bundle; an older single-file OMP export migrates after the bundle is saved. Keep the last good attachment and its known parent relationship when its current source or parent source is missing or unreadable, and mark the current export partial. First-time partial exports retain available visible messages.

## Completion gate

Report every saved absolute path and the exporter's message, skipped, warning, and completeness counts. A written main transcript alone does not establish a complete task archive.

Only report a complete export when the exporter confirms all identified descendants were saved and discovery has no unresolved gaps. Missing, unreadable, malformed, or unfinished descendants require a partial report naming the unresolved items. Treat unknown completeness as unverified, even when visible messages were saved.

Leave source sessions in place. A complete result covers the visible-text scope at export time; it is not proof that a running task has finished or that referenced external files were backed up.
