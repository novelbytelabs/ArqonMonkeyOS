#!/usr/bin/env python3
from pathlib import Path
import sys
schema = Path("openapi/science_monkeys_actions.openapi.yaml").read_text(encoding="utf-8")
def fail(msg: str) -> None:
    print(f"TRIPWIRE_FAIL {msg}")
    sys.exit(1)
if "/v1/messages/{message_id}/archive" not in schema:
    fail("archive route missing")
if "operationId: archiveRoleMessage" not in schema:
    fail("archive operationId missing")
direct = schema.split("  /v1/messages/{message_id}:\n", 1)[1].split("\n  /", 1)[0]
if "operationId: archiveRoleMessage" in direct:
    fail("archive operation still on direct message path")
for forbidden in ["/v1/science/share:", "/v1/science/execute-experiment:", "/v1/queue", "/v1/code/", "/v1/coder/", "/v1/helper/", "/v1/pm/"]:
    if forbidden in schema:
        fail(f"forbidden route exposed: {forbidden}")
for phrase in ["not evidence", "not Science artifacts", "not findings", "not certification", "not promotion"]:
    if phrase not in schema:
        fail(f"missing boundary phrase: {phrase}")
print("TRIPWIRE_PASS")
