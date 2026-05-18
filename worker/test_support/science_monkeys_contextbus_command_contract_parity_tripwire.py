#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
schema = (ROOT / "openapi" / "science_monkeys_actions.openapi.yaml").read_text(encoding="utf-8")

tripwires = {
    "note_visibility_required": "required: [project, title, body, tags, visibility]" in schema,
    "note_visibility_enum_team": "enum: [team]" in schema,
    "message_to_required": "required: [project, to, subject, body]" in schema,
    "message_to_role_removed": "to_role:" not in schema,
}

failed = [name for name, ok in tripwires.items() if not ok]
if failed:
    print(f"TRIPWIRE_FAIL contract parity regression: {', '.join(failed)}", file=sys.stderr)
    sys.exit(1)

print("TRIPWIRE_PASS")
