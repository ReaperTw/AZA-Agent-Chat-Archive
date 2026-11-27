"""Read Antigravity's local SQLite transcript without loading private runtime state.

Wire fields verified against the FileDescriptorProto embedded in the official
Antigravity language_server.exe: gemini_coder/proto/trajectory.proto (Step),
jetski/cortex_pb/cortex.proto (user_input, planner_response, metadata).
Only the small protobuf wire subset needed here is decoded; no SDK is required.
"""

import argparse
import datetime as dt
import json
from pathlib import Path
import re
import sqlite3
import sys
from urllib.parse import unquote, urlparse
from urllib.request import url2pathname


# CortexStepType values from the same descriptor. Unknown future types fail
# closed instead of silently discarding potentially visible conversation text.
KNOWN_STEP_TYPES = frozenset({
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 17, 21, 23, 24, 25,
    27, 28, 29, 31, 32, 33, 34, 38, 39, 40, 41, 42, 45, 47, 49, 51,
    52, 53, 54, 55, 56, 57, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68,
    73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
    89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103,
    104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 116, 117,
    118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130,
    131, 132, 133, 134, 135, 136, 137, 138, 139, 140,
})


def varint(data, offset):
    value = 0
    for shift in range(0, 70, 7):
        if offset >= len(data):
            raise ValueError("Truncated protobuf varint")
        byte = data[offset]
        offset += 1
        value |= (byte & 127) << shift
        if byte < 128:
            return value, offset
    raise ValueError("Invalid protobuf varint")


def fields(data):
    result = {}
    offset = 0
    while offset < len(data):
        key, offset = varint(data, offset)
        number, wire = key >> 3, key & 7
        if not number:
            raise ValueError("Invalid protobuf field number")
        if wire == 0:
            value, offset = varint(data, offset)
        elif wire in (1, 2, 5):
            if wire == 2:
                size, offset = varint(data, offset)
            else:
                size = 8 if wire == 1 else 4
            if size > len(data) - offset:
                raise ValueError("Truncated protobuf field")
            value = data[offset:offset + size]
            offset += size
        else:
            raise ValueError("Unsupported protobuf wire type")
        result.setdefault(number, []).append(value)
    return result


def text(message, number):
    value = message.get(number, [b""])[-1]
    if not isinstance(value, bytes):
        raise ValueError("Unexpected wire type for text")
    return value.decode("utf-8")


def timestamp(data):
    value = fields(data)
    seconds = value.get(1, [0])[-1]
    nanos = value.get(2, [0])[-1]
    return dt.datetime.fromtimestamp(seconds, dt.timezone.utc).replace(
        microsecond=nanos // 1000
    ).isoformat()


def workspace_path(uri):
    parsed = urlparse(uri)
    if parsed.scheme != "file":
        raise ValueError("Only local file workspace URIs are supported")
    if parsed.netloc and parsed.netloc != "localhost":
        return url2pathname("//" + parsed.netloc + unquote(parsed.path))
    # Decode first: url2pathname only treats "c:" as a drive when the colon is literal,
    # and subagent workspaces arrive as file:///c%3A/...
    return url2pathname(unquote(parsed.path))


def connect(path):
    connection = sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True)
    connection.execute("PRAGMA query_only = ON")
    connection.execute("BEGIN")
    return connection


SYSTEM_MESSAGE, GENERIC, INVOKE_SUBAGENT, BROWSER_SUBAGENT = 101, 132, 127, 85
SUBAGENT_ID = re.compile(rb'"conversationId"\s*:\s*"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})"')


def agent_message(payload):
    """Return an inter-agent message carried by a SYSTEM_MESSAGE step, else None.

    Field 114 holds the delivered message: .3 kind, .4 envelope with .2 recipient,
    .3 sender, .4 content and .12.1.2 the step index it was sent from.
    """
    try:
        step = fields(payload)
        if 114 not in step:
            return None
        delivered = fields(step[114][-1])
        if 3 not in delivered or text(delivered, 3) != "agent_message" or 4 not in delivered:
            return None
        envelope = fields(delivered[4][-1])
        source_step = -1
        if 12 in envelope:
            origin = fields(envelope[12][-1])
            if 1 in origin:
                source_step = fields(origin[1][-1]).get(2, [-1])[-1]
        return {
            "sender": text(envelope, 3) if 3 in envelope else "",
            "recipient": text(envelope, 2) if 2 in envelope else "",
            "text": text(envelope, 4) if 4 in envelope else "",
            "step": source_step,
        }
    except (ValueError, UnicodeDecodeError):
        return None


def read_tree(path, seen=None):
    """Read a conversation plus the subagent conversations it spawned, recursively.

    A subagent's reports to its parent live in the parent's database; they are merged
    into the subagent's transcript at the step that sent them.
    """
    path = Path(path)
    record = read_session(path)
    seen = seen if seen is not None else {record["id"]}
    record["subagents"] = []
    for child_id in record["invoked"]:
        if child_id in seen:
            continue
        seen.add(child_id)
        entry = {"id": child_id, "parentId": record["id"], "type": "", "role": "", "cwd": "", "started": "", "messages": [], "problems": []}
        try:
            child = read_tree(path.parent / f"{child_id}.db", seen)
        except (ValueError, sqlite3.Error, OSError, KeyError, TypeError, OverflowError):
            entry["problems"].append("Subagent source could not be read.")
            record["subagents"].append(entry)
            continue
        if child["parentId"] != record["id"]:
            entry["problems"].append("Subagent parent link does not match.")
        reports = [note for note in record["agentMessages"] if note["sender"] == child_id and note["text"].strip()]
        if not reports:
            entry["problems"].append("Subagent has not reported back.")
        if child["warnings"]:
            entry["problems"].append("Subagent source has attachment-only or unattributed input.")
        merged = child["messages"] + [{"role": "assistant", "text": note["text"], "step": note["step"], "report": True} for note in reports]
        merged.sort(key=lambda message: (message["step"], 1 if message.get("report") else 0))
        entry.update(type=child["agentType"], role=child["agentRole"], cwd=child["cwd"], started=child["started"],
                     messages=[{"role": m["role"], "text": m["text"]} for m in merged])
        record["subagents"].append(entry)
        record["subagents"].extend(child["subagents"])
    return record


def read_session(path):
    path = Path(path)
    if path.suffix.lower() != ".db":
        raise ValueError("Antigravity requires a SQLite .db conversation; legacy .pb is unsupported")
    record = {
        "id": path.stem, "cwd": "", "started": "", "title": "", "messages": [], "warnings": 0,
        "parentId": "", "agentType": "", "agentRole": "", "invoked": [], "agentMessages": [],
    }
    connection = connect(path)
    try:
        meta = connection.execute("SELECT trajectory_id, cascade_id FROM trajectory_meta").fetchall()
        if len(meta) != 1 or (meta[0][1] or meta[0][0]) != path.stem:
            raise ValueError("Conversation identity does not match its file")
        blob = connection.execute("SELECT data FROM trajectory_metadata_blob WHERE id='main'").fetchone()
        metadata = fields(blob[0]) if blob else {}
        if 2 in metadata:
            record["started"] = timestamp(metadata[2][-1])
        # A subagent conversation carries its spawn config (type, role, prompt) in field 8
        # and its parent conversation id in field 5.
        if 8 in metadata and 5 in metadata:
            config = fields(metadata[8][-1])
            record["parentId"] = text(metadata, 5)
            record["agentType"] = text(config, 1) if 1 in config else ""
            record["agentRole"] = text(config, 2) if 2 in config else ""
        uris = [value.decode("utf-8") for value in metadata.get(7, [])]
        if not uris:
            uris = [text(fields(value), 1) for value in metadata.get(1, [])]
        uris = list(dict.fromkeys(uri for uri in uris if uri))
        if len(uris) == 1:
            record["cwd"] = workspace_path(uris[0])
        elif len(uris) > 1:
            record["warnings"] += 1  # No arbitrary project attribution for multi-root tasks.
        rows = connection.execute("SELECT idx, step_type, step_format, step_payload FROM steps ORDER BY idx")
        previous = -1
        for index, kind, fmt, payload in rows:
            if index != previous + 1:
                raise ValueError("Conversation contains missing step indices")
            previous = index
            if fmt != 0:
                raise ValueError("Unsupported Antigravity step format")
            if kind not in KNOWN_STEP_TYPES:
                raise ValueError("Unknown Antigravity step type")
            if kind == SYSTEM_MESSAGE:
                note = agent_message(payload)
                if note and record["parentId"] and note["sender"] == record["parentId"]:
                    # The parent's task and follow-ups are this subagent's user turns.
                    record["messages"].append({"role": "user", "text": note["text"], "step": index})
                elif note:
                    record["agentMessages"].append(note)
                continue
            if kind in (INVOKE_SUBAGENT, BROWSER_SUBAGENT) or (kind == GENERIC and b"invoke_subagent" in payload):
                for match in SUBAGENT_ID.finditer(payload):
                    child = match.group(1).decode("ascii").lower()
                    if child != record["id"] and child not in record["invoked"]:
                        record["invoked"].append(child)
                continue
            if kind not in (14, 15):
                continue
            step = fields(payload)
            if step.get(1, [None])[-1] != kind:
                raise ValueError("Conversation step type disagrees with its payload")
            field = 19 if kind == 14 else 20
            if field not in step:
                raise ValueError("Visible conversation step has no message payload")
            message = fields(step[field][-1])
            if kind == 14:
                # user_response is the original display text, including @mentions.
                # query is the legacy text field. items contains expanded context.
                body = text(message, 2) if 2 in message else text(message, 1)
            else:
                # modified_response is the displayed answer when provided.
                body = text(message, 8) if 8 in message else text(message, 1)
            if body.strip():
                record["messages"].append({"role": "user" if kind == 14 else "assistant", "text": body, "step": index})
            elif kind == 14 and (message.get(3) or message.get(5) or message.get(9)):
                record["warnings"] += 1  # Attachment/context-only input is not invented as text.
        for (data,) in connection.execute("SELECT data FROM parent_references"):
            reference = fields(data)
            # A same-conversation FORK copies the selected prefix into steps.
            # Export that local branch, never append the abandoned trajectory.
            if (reference.get(5, [0])[-1] != 2
                    or text(reference, 6) != record["id"]
                    or not 0 <= reference.get(2, [0])[-1] <= previous):
                raise ValueError("External or pruned parent history is unsupported; no archive was written")
    finally:
        connection.close()
    summary_path = path.parent.parent / "conversation_summaries.db"
    if summary_path.is_file():
        summary = connect(summary_path)
        try:
            row = summary.execute("SELECT title FROM conversation_summaries WHERE conversation_id=?", (record["id"],)).fetchone()
            if row:
                record["title"] = row[0]
        finally:
            summary.close()
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    parser.add_argument("--tree", action="store_true", help="also read the subagent conversations it spawned")
    args = parser.parse_args()
    try:
        record = read_tree(args.path) if args.tree else dict(read_session(args.path), subagents=[])
    except (ValueError, sqlite3.Error, OSError, KeyError, TypeError, OverflowError) as error:
        # SQLite and decoder errors are structural, never print payload contents.
        print(f"Antigravity read failed: {error}", file=sys.stderr)
        return 1
    for internal in ("invoked", "agentMessages"):
        record.pop(internal, None)
    record["messages"] = [{"role": m["role"], "text": m["text"]} for m in record["messages"]]
    print(json.dumps(record, ensure_ascii=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
