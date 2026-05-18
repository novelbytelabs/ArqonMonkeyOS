#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
schema = (ROOT / "openapi" / "science_monkeys_actions.openapi.yaml").read_text(encoding="utf-8")

required = [
    "ContextNoteRequest:",
    "additionalProperties: false",
    "required: [project, title, body, tags, visibility]",
    "visibility:",
    "enum: [team]",
    "Current backend accepts only `team`.",
    "ContextMessageRequest:",
    "required: [project, to, subject, body]",
    "Current backend expects `to`.",
]

missing = [item for item in required if item not in schema]
if missing:
    print("FAIL missing required contract-parity schema content: " + ", ".join(missing), file=sys.stderr)
    sys.exit(1)

for forbidden in [
    "to_role:",
    "description: Target role alias if backend uses to instead of to_role.",
]:
    if forbidden in schema:
        print(f"FAIL forbidden ambiguous message field remains in schema: {forbidden}", file=sys.stderr)
        sys.exit(1)

print("PASS contextbus command contract parity policy unit", {"ok": True})
