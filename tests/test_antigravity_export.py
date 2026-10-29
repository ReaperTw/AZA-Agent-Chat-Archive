"""Synthetic transcript/privacy boundaries plus the real PowerShell entry point."""

from contextlib import closing
import importlib.util
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "skills/AZA-Agent-Chat-Archive/scripts"
spec = importlib.util.spec_from_file_location("antigravity_reader", SCRIPTS / "Read-AntigravityChat.py")
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)


def varint(value):
    result = bytearray()
    while value > 127:
        result.append((value & 127) | 128)
        value >>= 7
    result.append(value)
    return bytes(result)


def field(number, value):
    if isinstance(value, int):
        return varint(number << 3) + varint(value)
    if isinstance(value, str):
        value = value.encode("utf-8")
    return varint(number << 3 | 2) + varint(len(value)) + value


def step(kind, message):
    return field(1, kind) + field(19 if kind == 14 else 20, message)


class AntigravityExportTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="aza-antigravity-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.home = self.root / "antigravity"
        (self.home / "conversations").mkdir(parents=True)
        self.session_id = "11111111-1111-4111-8111-111111111111"
        self.path = self.make_session(self.session_id)

    def make_session(self, session_id):
        path = self.home / "conversations" / (session_id + ".db")
        with closing(sqlite3.connect(path)) as connection, connection:
            connection.executescript("""
                CREATE TABLE trajectory_meta (trajectory_id TEXT, cascade_id TEXT);
                CREATE TABLE parent_references (idx INTEGER, data BLOB);
                CREATE TABLE trajectory_metadata_blob (id TEXT, data BLOB);
                CREATE TABLE steps (idx INTEGER PRIMARY KEY, step_type INTEGER,
                                    step_format INTEGER DEFAULT 0, step_payload BLOB);
            """)
            connection.execute("INSERT INTO trajectory_meta VALUES (?, ?)", (session_id, session_id))
            metadata = field(2, field(1, 1793232000)) + field(7, self.root.as_uri())
            connection.execute("INSERT INTO trajectory_metadata_blob VALUES ('main', ?)", (metadata,))
            connection.executemany("INSERT INTO steps (idx,step_type,step_payload) VALUES (?,?,?)", [
                (0, 14, step(14, field(2, "使用 @example\nkeep <literal> text") + field(3, field(1, "secret expanded instructions")))),
                (1, 15, step(15, field(1, "old answer") + field(8, "Visible answer 中文\n```\n  code\n```") + field(3, "secret thinking") + field(7, "secret tool arguments"))),
                (2, 132, field(1, 132) + field(132, "secret tool output")),
                (3, 15, step(15, field(3, "secret thinking only"))),
            ])
        return path

    def test_display_text_and_privacy(self):
        record = reader.read_session(self.path)
        self.assertEqual(record["messages"], [
            {"role": "user", "text": "使用 @example\nkeep <literal> text"},
            {"role": "assistant", "text": "Visible answer 中文\n```\n  code\n```"},
        ])
        self.assertEqual(Path(record["cwd"]), self.root)
        self.assertEqual(record["started"], "2026-10-29T00:00:00+00:00")
        self.assertNotIn("secret", json.dumps(record))

    def test_legacy_text_and_attachment_only_input(self):
        with closing(sqlite3.connect(self.path)) as connection, connection:
            connection.execute("UPDATE steps SET step_payload=? WHERE idx=0", (step(14, field(1, "legacy query")),))
            connection.execute("UPDATE steps SET step_payload=? WHERE idx=1", (step(15, field(1, "plain response")),))
            connection.execute("INSERT INTO steps VALUES (4,14,0,?)", (step(14, field(5, b"image bytes")),))
        record = reader.read_session(self.path)
        self.assertEqual([m["text"] for m in record["messages"]], ["legacy query", "plain response"])
        self.assertEqual(record["warnings"], 1)

    def test_reads_committed_wal_without_changing_source(self):
        connection = sqlite3.connect(self.path)
        self.addCleanup(connection.close)
        connection.execute("PRAGMA journal_mode=WAL")
        connection.execute("INSERT INTO steps VALUES (4,15,0,?)", (step(15, field(1, "new WAL answer")),))
        connection.commit()
        before = self.path.read_bytes()
        record = reader.read_session(self.path)
        self.assertEqual(record["messages"][-1]["text"], "new WAL answer")
        self.assertEqual(self.path.read_bytes(), before)
        self.assertEqual(connection.execute("SELECT count(*) FROM steps").fetchone()[0], 5)

    def test_local_fork_uses_copied_branch_and_rejects_external_history(self):
        reference = field(1, "previous-trajectory") + field(2, 1) + field(5, 2) + field(6, self.session_id)
        with closing(sqlite3.connect(self.path)) as connection, connection:
            connection.execute("INSERT INTO parent_references VALUES (0,?)", (reference,))
            connection.execute("UPDATE steps SET step_payload=? WHERE idx=1", (step(15, field(1, "selected branch answer")),))
        record = reader.read_session(self.path)
        self.assertEqual([m["text"] for m in record["messages"]],
                         ["使用 @example\nkeep <literal> text", "selected branch answer"])
        with closing(sqlite3.connect(self.path)) as connection, connection:
            connection.execute("UPDATE parent_references SET data=?",
                               (field(1, "external") + field(2, 1) + field(5, 2) + field(6, "another-conversation"),))
        with self.assertRaisesRegex(ValueError, "External or pruned"):
            reader.read_session(self.path)

    def test_rejects_incomplete_and_unknown_storage(self):
        for sql in ["UPDATE steps SET step_format=99 WHERE idx=1",
                    "UPDATE steps SET step_type=9999 WHERE idx=1",
                    "UPDATE steps SET step_payload=x'01' WHERE idx=1",
                    "DELETE FROM steps WHERE idx=1",
                    "INSERT INTO parent_references VALUES (0,x'00')"]:
            with self.subTest(sql=sql), closing(sqlite3.connect(self.path)) as connection, connection:
                connection.execute(sql)
                # A separate read-only connection sees only committed changes.
                connection.commit()
                with self.assertRaises(ValueError):
                    reader.read_session(self.path)
            self.path.unlink()
            self.make_session(self.session_id)

    def run_exporter(self, *arguments):
        shell = shutil.which("pwsh") or shutil.which("powershell")
        if not shell:
            self.skipTest("PowerShell is unavailable")
        environment = os.environ.copy()
        for name in ["CODEX_THREAD_ID", "OMP_SESSION_ID", "COMMANDCODE_SESSION_ID", "GROK_SESSION_ID",
                     "CLAUDE_SESSION_ID", "CLAUDE_CODE_SESSION_ID", "ANTIGRAVITY_CONVERSATION_ID"]:
            environment.pop(name, None)
        return subprocess.run([shell, "-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
                               str(SCRIPTS / "Export-AgentChat.ps1"), *map(str, arguments)],
                              capture_output=True, encoding="utf-8", errors="replace", env=environment)

    def test_entry_point_selection_reexport_and_failed_preservation(self):
        config = self.root / "config.json"
        output = self.root / "out"
        result = self.run_exporter("-Configure", "-ConfigPath", config, "-OutputRoot", output)
        self.assertEqual(result.returncode, 0, result.stderr)
        # Existing config does not need to be reconfigured for the new harness.
        data = json.loads(config.read_text(encoding="utf-8-sig"))
        data["harnesses"].pop("Antigravity")
        config.write_text(json.dumps(data), encoding="utf-8")
        common = ("-Harness", "Antigravity", "-AntigravityHome", self.home, "-ConfigPath", config)
        listing = self.run_exporter(*common, "-List")
        self.assertEqual(listing.returncode, 0, listing.stderr)
        self.assertIn(self.session_id, listing.stdout)
        self.assertFalse(output.exists())
        result = self.run_exporter(*common, "-SessionId", self.session_id)
        self.assertEqual(result.returncode, 0, result.stderr)
        archives = list(output.rglob("*.md"))
        self.assertEqual(len(archives), 1)
        archive = archives[0]
        markdown = archive.read_text(encoding="utf-8-sig")
        self.assertIn("使用 @example", markdown)
        self.assertIn("Visible answer 中文", markdown)
        self.assertNotIn("secret", markdown)
        result = self.run_exporter(*common, "-SessionId", self.session_id, "-Title", "Renamed task")
        self.assertEqual(result.returncode, 0, result.stderr)
        renamed = list(output.rglob("*.md"))
        self.assertEqual(len(renamed), 1)
        self.assertNotEqual(archive, renamed[0])
        saved = renamed[0].read_bytes()
        with closing(sqlite3.connect(self.path)) as connection, connection:
            connection.execute("UPDATE steps SET step_format=99 WHERE idx=1")
        result = self.run_exporter(*common, "-SessionId", self.session_id)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(renamed[0].read_bytes(), saved)
        with closing(sqlite3.connect(self.path)) as connection, connection:
            connection.execute("UPDATE steps SET step_format=0 WHERE idx=1")
        self.make_session("22222222-2222-4222-8222-222222222222")
        result = self.run_exporter(*common, "-Latest", "-WorkingDirectory", self.root)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Multiple Antigravity sessions", result.stderr)
        self.assertEqual(renamed[0].read_bytes(), saved)


if __name__ == "__main__":
    unittest.main()
