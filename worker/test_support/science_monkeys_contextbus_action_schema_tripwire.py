#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
text = (ROOT / "openapi" / "science_monkeys_actions.openapi.yaml").read_text(encoding="utf-8")

for needle in ["/v1/science/share:", "/v1/science/execute-experiment:", "/v1/queue", "/v1/code/", "/v1/coder/", "/v1/helper/", "/v1/human/"]:
    if needle in text:
        print(f"TRIPWIRE_FAIL forbidden exposure: {needle}", file=sys.stderr)
        sys.exit(1)

for phrase in ["operationId: saveContextNote", "operationId: sendRoleMessage", "operationId: readRoleInbox", "operationId: archiveRoleMessage"]:
    if phrase not in text:
        print(f"TRIPWIRE_FAIL missing ContextBus operation: {phrase}", file=sys.stderr)
        sys.exit(1)

for phrase in ["Notes are not", "Messages are directed non-official role", "backend bearer-token auth"]:
    if phrase not in text:
        print(f"TRIPWIRE_FAIL missing governance phrase: {phrase}", file=sys.stderr)
        sys.exit(1)

print("TRIPWIRE_PASS")
