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
import sqlite3
import sys
from urllib.parse import urlparse
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
        return url2pathname("//" + parsed.netloc + parsed.path)
    return url2pathname(parsed.path)


def connect(path):
    connection = sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True)
    connection.execute("PRAGMA query_only = ON")
    connection.execute("BEGIN")
    return connection


def read_session(path):
    path = Path(path)
    if path.suffix.lower() != ".db":
        raise ValueError("Antigravity requires a SQLite .db conversation; legacy .pb is unsupported")
    record = {"id": path.stem, "cwd": "", "started": "", "title": "", "messages": [], "warnings": 0}
    connection = connect(path)
    try:
        meta = connection.execute("SELECT trajectory_id, cascade_id FROM trajectory_meta").fetchall()
        if len(meta) != 1 or (meta[0][1] or meta[0][0]) != path.stem:
            raise ValueError("Conversation identity does not match its file")
        blob = connection.execute("SELECT data FROM trajectory_metadata_blob WHERE id='main'").fetchone()
        metadata = fields(blob[0]) if blob else {}
        if 2 in metadata:
            record["started"] = timestamp(metadata[2][-1])
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
                record["messages"].append({"role": "user" if kind == 14 else "assistant", "text": body})
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
    args = parser.parse_args()
    try:
        record = read_session(args.path)
    except (ValueError, sqlite3.Error, OSError, KeyError, TypeError, OverflowError) as error:
        # SQLite and decoder errors are structural, never print payload contents.
        print(f"Antigravity read failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(record, ensure_ascii=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
