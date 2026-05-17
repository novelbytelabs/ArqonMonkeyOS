#!/usr/bin/env python3
from pathlib import Path
import sys

SCHEMA = Path("openapi/science_monkeys_actions.openapi.yaml")
DOC = Path("docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_GPT_ACTION_SCHEMA_VERSION_LOCK_001.md")

required_schema = [
    "version: 0.3.0-contextbus-command-action-schema",
    "x-arqon_schema_id: SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001",
    "CANDIDATE_UNTIL_GATE_PASS_AND_HASH_LOCKED_IMPORT",
    "not Science artifacts",
    "not promotion",
    "/v1/context:",
    "/v1/constitution:",
    "/v1/notes:",
    "/v1/messages:",
    "/v1/messages/inbox:",
    "/v1/messages/{message_id}:",
]
forbidden_schema = [
    "/v1/science/share:",
    "/v1/science/execute-experiment:",
    "/v1/queue",
    "/v1/coder/",
    "/v1/helper/",
    "/v1/auditor/helper-execution-review",
    "/v1/human/",
]
required_doc = [
    "schema SHA256",
    "commit SHA",
    "imported GPT Action schema",
    "REPO_CANDIDATE_NOT_IMPORTED_NOT_LIVE_VALIDATED",
    "not promotion",
    "not Science artifacts",
]

if not SCHEMA.exists():
    raise SystemExit(f"FAIL missing schema: {SCHEMA}")
if not DOC.exists():
    raise SystemExit(f"FAIL missing version lock doc: {DOC}")

schema_text = SCHEMA.read_text()
doc_text = DOC.read_text()

missing = [s for s in required_schema if s not in schema_text]
if missing:
    raise SystemExit("FAIL missing schema version-lock content: " + ", ".join(missing))

present_forbidden = [s for s in forbidden_schema if s in schema_text]
if present_forbidden:
    raise SystemExit("FAIL forbidden schema exposure: " + ", ".join(present_forbidden))

missing_doc = [s for s in required_doc if s not in doc_text]
if missing_doc:
    raise SystemExit("FAIL missing version-lock doc content: " + ", ".join(missing_doc))

print("SCHEMA_VERSION_LOCK_POLICY_PASS")
