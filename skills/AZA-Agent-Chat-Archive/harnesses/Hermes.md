# Hermes

Run this command for the current session. Fill the session id. Leave every other flag as written.

```bash
python "${HERMES_SKILL_DIR}/scripts/Export-HermesChat.py" --session-id "${HERMES_SESSION_ID}"
```

A named session uses the same command with that id. The result is that session's visible transcript — DM, thread, channel, or shared room — not a Discord backup and not a restorable Hermes session.

Done when that command has run.
