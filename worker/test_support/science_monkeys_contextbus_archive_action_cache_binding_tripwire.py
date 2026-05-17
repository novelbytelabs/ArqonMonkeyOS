#!/usr/bin/env python3
from pathlib import Path

text = Path("openapi/science_monkeys_actions.openapi.yaml").read_text(encoding="utf-8")
checks = {
    "archive_path": "/v1/messages/{message_id}/archive:" in text,
    "fresh_operation": "operationId: archiveRoleMessageByArchivePath" in text,
    "open_message": "operationId: openRoleMessage" in text,
    "no_stale_archive_operation": "operationId: archiveRoleMessage\n" not in text,
    "share_absent": "/v1/science/share" not in text,
    "execute_absent": "/v1/science/execute-experiment" not in text,
    "no_code_routes": "/v1/coder/" not in text and "/v1/helper/" not in text,
    "no_queue": "/v1/queue" not in text,
}
failed = [k for k, v in checks.items() if not v]
if failed:
    raise SystemExit(f"TRIPWIRE_FAIL {failed}")
print("TRIPWIRE_PASS")
