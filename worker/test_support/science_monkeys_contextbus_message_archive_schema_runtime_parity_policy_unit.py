#!/usr/bin/env python3
from pathlib import Path
import sys
schema = Path("openapi/science_monkeys_actions.openapi.yaml").read_text(encoding="utf-8")
required = [
    "/v1/context", "/v1/constitution", "/v1/notes", "/v1/messages", "/v1/messages/inbox",
    "/v1/messages/{message_id}", "/v1/messages/{message_id}/archive", "operationId: archiveRoleMessage",
    "not evidence", "not Science artifacts", "not findings", "not certification", "not promotion",
    "not deployment approval", "not production readiness", "REQUIRES_HUMAN_REVIEW",
    "development diagnostic only", "NOT SEALED-TEST CERTIFIED", "not promotable",
]
for item in required:
    if item not in schema:
        print(f"FAIL missing required schema content: {item}")
        sys.exit(1)
forbidden = ["/v1/science/share:", "/v1/science/execute-experiment:", "/v1/queue", "/v1/code/", "/v1/coder/", "/v1/helper/", "/v1/pm/"]
for item in forbidden:
    if item in schema:
        print(f"FAIL forbidden schema content present: {item}")
        sys.exit(1)
direct = schema.split("  /v1/messages/{message_id}:\n", 1)[1].split("\n  /", 1)[0]
if "operationId: archiveRoleMessage" in direct:
    print("FAIL archiveRoleMessage still exposed under direct /v1/messages/{message_id}")
    sys.exit(1)
archive = schema.split("  /v1/messages/{message_id}/archive:\n", 1)[1].split("\n  /", 1)[0]
if "    post:" not in archive or "operationId: archiveRoleMessage" not in archive:
    print("FAIL archiveRoleMessage is not under POST /v1/messages/{message_id}/archive")
    sys.exit(1)
print({"ok": True, "archive_route": "/v1/messages/{message_id}/archive"})
