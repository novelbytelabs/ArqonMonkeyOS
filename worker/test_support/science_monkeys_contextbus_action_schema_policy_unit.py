#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
text = (ROOT / "openapi" / "science_monkeys_actions.openapi.yaml").read_text(encoding="utf-8")

required = [
    "/v1/context:", "/v1/constitution:", "/v1/notes:", "/v1/messages:", "/v1/messages/inbox:", "/v1/messages/{message_id}:",
    "operationId: syncContext", "operationId: syncConstitution", "operationId: saveContextNote", "operationId: sendRoleMessage",
    "operationId: readRoleInbox", "operationId: openRoleMessage", "operationId: archiveRoleMessage",
    "not Science evidence", "not Science artifacts", "not findings", "not certification", "not promotion",
    "not deployment approval", "not production readiness", "No harness = No truth",
    "REQUIRES_HUMAN_REVIEW", "NOT SEALED-TEST CERTIFIED", "not promotable",
]
for item in required:
    if item not in text:
        print(f"FAIL missing required schema content: {item}", file=sys.stderr)
        sys.exit(1)

for forbidden in ["/v1/science/share:", "/v1/science/execute-experiment:", "/v1/queue", "/v1/coder/", "/v1/helper/", "/v1/human/"]:
    if forbidden in text:
        print(f"FAIL forbidden route exposed in Science Action schema: {forbidden}", file=sys.stderr)
        sys.exit(1)

print("PASS contextbus action schema policy unit", {"ok": True})
