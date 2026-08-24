#!/usr/bin/env python3
"""Convert an official Hermes session export into a clean GYC Markdown archive."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path


DEFAULT_HARNESSES = {
    "Codex": {"folderPrefix": "Codex-", "filePrefix": "CDX_"},
    "Grok": {"folderPrefix": "Grok-", "filePrefix": "Grok_"},
    "CommandCode": {"folderPrefix": "CommandCode-", "filePrefix": "CommandCode_"},
    "Hermes": {"folderPrefix": "Hermes-", "filePrefix": "Hermes_"},
}
JSON_PREFIX = "\x00json:"


def config_path(value: str | None = None) -> Path:
    return Path(value or os.environ.get("AGENT_CHAT_ARCHIVE_CONFIG", "~/.agents/skills/.agent-chat-archive.json")).expanduser()


def load_config(path: Path) -> dict:
    if not path.is_file():
        raise SystemExit(f"Archive configuration not found at '{path}'. Run --configure first.")
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("version") != 1 or not data.get("outputRoot"):
        raise SystemExit(f"Archive configuration at '{path}' is invalid.")
    data.setdefault("harnesses", {})
    for name, defaults in DEFAULT_HARNESSES.items():
        data["harnesses"].setdefault(name, defaults.copy())
    return data


def validate_prefix(value: str, label: str) -> None:
    if any(ord(char) < 32 or char in '<>:"/\\|?*' for char in value):
        raise SystemExit(f"{label} contains an invalid path character.")


def save_config(path: Path, output_root: str, folder_prefix: str, file_prefix: str) -> None:
    validate_prefix(folder_prefix, "Hermes folder prefix")
    validate_prefix(file_prefix, "Hermes file prefix")
    data = load_config(path) if path.is_file() else {"version": 1, "harnesses": {}}
    data["outputRoot"] = str(Path(output_root).expanduser().resolve())
    data["harnesses"]["Hermes"] = {"folderPrefix": folder_prefix, "filePrefix": file_prefix}
    for name, defaults in DEFAULT_HARNESSES.items():
        data["harnesses"].setdefault(name, defaults.copy())
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temporary, path)
    print(f"CONFIGURED|{path.resolve()}|root={data['outputRoot']}")


def safe_part(value: str, fallback: str = "Chat", maximum: int = 60) -> str:
    value = "-".join(value.strip().split())
    value = "".join(char for char in value if ord(char) >= 32 and char not in '<>:"/\\|?*')
    while "--" in value:
        value = value.replace("--", "-")
    value = value.strip("-.") or fallback
    return value[:maximum].rstrip("-.")


def parse_time(value) -> datetime:
    try:
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(float(value)).astimezone()
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).astimezone()
    except (TypeError, ValueError, OSError):
        return datetime.now().astimezone()


def decode_content(value) -> str:
    if value is None:
        return ""
    if isinstance(value, str) and value.startswith(JSON_PREFIX):
        try:
            value = json.loads(value[len(JSON_PREFIX) :])
        except json.JSONDecodeError:
            return value
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        parts = []
        for part in value:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict) and isinstance(part.get("text") or part.get("content"), str):
                parts.append(part.get("text") or part.get("content"))
            else:
                parts.append(json.dumps(part, ensure_ascii=False, sort_keys=True))
        return "\n".join(filter(None, parts))
    if isinstance(value, dict):
        text = value.get("text") or value.get("content")
        return text if isinstance(text, str) else json.dumps(value, ensure_ascii=False, sort_keys=True)
    return str(value)


def read_export(path: Path) -> dict:
    lines = [line for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if len(lines) != 1:
        raise SystemExit("Hermes single-session export did not contain exactly one JSON record.")
    data = json.loads(lines[0])
    if not data.get("id") or not isinstance(data.get("messages"), list):
        raise SystemExit("Hermes export is missing session metadata or messages.")
    return data


def render_markdown(data: dict) -> tuple[str, int]:
    started = parse_time(data.get("started_at"))
    lines = [
        f"<!-- agent-chat-archive: Hermes:{data['id']} -->",
        f"> **對話時間**：{started:%Y年%m月%d日 %p %I:%M}",
        ">",
        "> **來源 Harness**：Hermes",
        ">",
        f"> **來源平台**：`{data.get('source') or 'unknown'}`",
        "",
    ]
    user_index = model_index = visible_count = 1
    for message in data["messages"]:
        role = message.get("role")
        if role not in {"user", "assistant"}:
            continue
        text = decode_content(message.get("content")).strip()
        if not text:
            continue
        if role == "assistant":
            heading, model_index = f"Model {model_index}", model_index + 1
        else:
            heading, user_index = f"User {user_index}", user_index + 1
        lines.extend([f"--- [{heading}] ---", text, ""])
        visible_count += 1
    return "\n".join(lines).rstrip() + "\n", visible_count - 1


def find_existing(directory: Path, session_id: str) -> Path | None:
    marker = f"<!-- agent-chat-archive: Hermes:{session_id} -->"
    if not directory.is_dir():
        return None
    for path in directory.glob("*.md"):
        try:
            if marker in path.read_text(encoding="utf-8-sig"):
                return path
        except OSError:
            continue
    return None


def save_markdown(data: dict, config: dict, requested_title: str | None) -> tuple[Path, int]:
    settings = config["harnesses"]["Hermes"]
    source = safe_part(str(data.get("source") or "Hermes"), "Hermes", 94)
    title = safe_part(requested_title or str(data.get("title") or f"{source}-Chat"))
    started = parse_time(data.get("started_at"))
    destination = Path(config["outputRoot"]).expanduser() / f"{settings['folderPrefix']}{source}"
    destination.mkdir(parents=True, exist_ok=True)
    desired = destination / f"{settings['filePrefix']}{title}_{started:%Y%m%d_%H%M%S}.md"
    existing = find_existing(destination, str(data["id"]))
    path = desired if requested_title or not existing else existing
    if path.exists() and path != existing:
        index = 2
        while path.exists():
            path = desired.with_name(f"{desired.stem}_{index}{desired.suffix}")
            index += 1
    text, visible_count = render_markdown(data)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(text, encoding="utf-8-sig")
    os.replace(temporary, path)
    if existing and existing != path and existing.exists():
        existing.unlink()
    return path.resolve(), visible_count


def inferred_profile() -> str | None:
    parts = Path(__file__).resolve().parts
    for index, part in enumerate(parts[:-1]):
        if part.lower() == "profiles" and index + 2 < len(parts) and parts[index + 2].lower() == "skills":
            return parts[index + 1]
    return None


def export_one(session_id: str, config: dict, title: str | None, profile: str | None) -> None:
    with tempfile.TemporaryDirectory() as temp_root:
        temporary = Path(temp_root) / "session.jsonl"
        command = [sys.executable, "-m", "hermes_cli.main"]
        if profile:
            command.extend(["--profile", profile])
        command.extend(["sessions", "export", str(temporary), "--session-id", session_id])
        result = subprocess.run(
            command,
            text=True, capture_output=True, check=False,
        )
        if result.returncode or not temporary.is_file():
            detail = (result.stderr or result.stdout).strip()
            raise SystemExit(f"Hermes official session export failed: {detail or f'exit {result.returncode}'}")
        path, visible_count = save_markdown(read_export(temporary), config, title)
    print(f"EXPORTED|{path}|messages={visible_count}|warnings=0")
    print(f"SUMMARY|harness=Hermes|exported=1|skipped=0|root={config['outputRoot']}")


def self_test() -> None:
    with tempfile.TemporaryDirectory() as root:
        root_path = Path(root)
        data = {
            "id": "20260821_test", "source": "discord", "title": "Discord Test", "started_at": 1787200000,
            "messages": [
                {"role": "user", "content": "hello"},
                {"role": "assistant", "content": "world"},
                {"role": "tool", "content": "secret-tool"},
                {"role": "system", "content": "secret-system"},
            ],
        }
        config = {"outputRoot": str(root_path / "out"), "harnesses": {"Hermes": DEFAULT_HARNESSES["Hermes"]}}
        path, count = save_markdown(data, config, None)
        markdown = path.read_text(encoding="utf-8-sig")
        assert count == 2 and "hello" in markdown and "world" in markdown
        assert "secret-tool" not in markdown and "secret-system" not in markdown
        assert path.name.startswith("Hermes_Discord-Test_")
    print("HERMES_SELF_TEST_OK checks=3")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--session-id")
    parser.add_argument("--title")
    parser.add_argument("--profile", help="Hermes profile name; inferred when installed inside a profile")
    parser.add_argument("--config-path")
    parser.add_argument("--show-config", action="store_true")
    parser.add_argument("--configure", action="store_true")
    parser.add_argument("--output-root")
    parser.add_argument("--folder-prefix", default="Hermes-")
    parser.add_argument("--file-prefix", default="Hermes_")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    path = config_path(args.config_path)
    if args.configure:
        if not args.output_root:
            parser.error("--configure requires --output-root")
        save_config(path, args.output_root, args.folder_prefix, args.file_prefix)
        return
    config = load_config(path)
    if args.show_config:
        print(json.dumps({"configPath": str(path.resolve()), "outputRoot": config["outputRoot"], **config["harnesses"]["Hermes"]}, ensure_ascii=False))
        return
    session_id = args.session_id or os.environ.get("HERMES_SESSION_ID")
    if not session_id:
        raise SystemExit("No current Hermes session id is available. Pass --session-id.")
    export_one(session_id, config, args.title, args.profile or inferred_profile())


if __name__ == "__main__":
    main()
