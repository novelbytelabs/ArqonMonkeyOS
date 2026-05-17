#!/usr/bin/env python3
from pathlib import Path

SCHEMA = Path("openapi/science_monkeys_actions.openapi.yaml")
DOC = Path("docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_GPT_ACTION_SCHEMA_VERSION_LOCK_001.md")

schema = SCHEMA.read_text(encoding="utf-8")
doc = DOC.read_text(encoding="utf-8") if DOC.exists() else ""

EXPECTED_VERSION = "0.3.1-contextbus-archive-action-cache-binding"
EXPECTED_SCHEMA_ID = "SCIENCE_MONKEYS_CONTEXTBUS_ARCHIVE_ACTION_CACHE_BINDING_REPAIR_001"

required_schema = [
    f"version: {EXPECTED_VERSION}",
    f"x-arqon_schema_id: {EXPECTED_SCHEMA_ID}",
    "x-arqon_import_rule:",
    "/v1/messages/{message_id}/archive:",
    "operationId: archiveRoleMessageByArchivePath",
    "operationId: openRoleMessage",
    "REQUIRES_HUMAN_REVIEW",
    "development diagnostic only",
    "NOT SEALED-TEST CERTIFIED",
    "not promotable",
]

required_doc = [
    EXPECTED_VERSION,
    EXPECTED_SCHEMA_ID,
    "repo schema is candidate until imported",
    "imported GPT Action schema SHA must match repo schema SHA",
    "live-smoke evidence must record imported schema SHA",
    "NOT_DONE_SEPARATE_OPERATOR_STEP_REQUIRED",
]

missing_schema = [item for item in required_schema if item not in schema]
missing_doc = [item for item in required_doc if item not in doc]
if missing_schema or missing_doc:
    raise SystemExit(
        "FAIL missing schema version-lock content: "
        + ", ".join(missing_schema + missing_doc)
    )

for forbidden in [
    "/v1/science/share",
    "/v1/science/execute-experiment",
    "/v1/queue",
    "/v1/coder/",
    "/v1/helper/",
    "/v1/human/",
]:
    if forbidden in schema:
        raise SystemExit(f"FAIL forbidden route exposed in schema: {forbidden}")

if "operationId: archiveRoleMessage\n" in schema:
    raise SystemExit("FAIL stale archive operationId remains")

print("SCHEMA_VERSION_LOCK_POLICY_PASS")
