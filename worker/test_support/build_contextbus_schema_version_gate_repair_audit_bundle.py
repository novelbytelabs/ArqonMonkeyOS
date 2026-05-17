#!/usr/bin/env python3
from pathlib import Path
import hashlib
import json
import zipfile
from datetime import datetime, timezone

ROOT = Path.cwd()
OUT = ROOT / "temps" / "science_monkeys_contextbus_schema_version_gate_repair_audit_pack.zip"
FILES = [
    "openapi/science_monkeys_actions.openapi.yaml",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_EXPLORER_SMOKE_PACKET_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_GPT_ACTION_SCHEMA_VERSION_LOCK_001.md",
    "worker/test_support/science_monkeys_contextbus_action_schema_policy_unit.py",
    "worker/test_support/science_monkeys_contextbus_action_schema_tripwire.py",
    "worker/test_support/science_monkeys_schema_version_lock_policy_unit.py",
    "worker/test_support/build_contextbus_command_action_schema_audit_bundle.py",
    "worker/test_support/build_contextbus_schema_version_gate_repair_audit_bundle.py",
    "temps/science_monkeys_contextbus_command_action_schema_integration_001_helper_report.md",
]

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

manifest = {
    "required_status_labels": [
        "REQUIRES_HUMAN_REVIEW",
        "development diagnostic only",
        "NOT SEALED-TEST CERTIFIED",
        "not promotable",
    ],
    "slice": "SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001_VERSION_LOCK_GATE_REPAIR",
    "created_at": datetime.now(timezone.utc).isoformat(),
    "purpose": "Audit pack for ContextBus command Action schema integration gate repair and schema version lock.",
    "non_authorizations": [
        "no certification",
        "no promotion",
        "no deployment approval",
        "no production readiness",
        "no autonomous Science operation",
        "no Option C queue mutation",
        "no /v1/science/share exposure",
        "no /v1/science/execute-experiment exposure",
        "no Code Monkey routes",
        "no HUMAN authority for GPTs",
        "no SCIENCE_EXECUTOR_AI authority for GPTs",
    ],
    "files": [],
}
for rel in FILES:
    path = ROOT / rel
    if not path.exists():
        raise SystemExit(f"missing audit file: {rel}")
    manifest["files"].append({"path": rel, "sha256": sha256(path), "bytes": path.stat().st_size})

schema_path = ROOT / "openapi/science_monkeys_actions.openapi.yaml"
manifest["canonical_schema_candidate"] = {
    "path": "openapi/science_monkeys_actions.openapi.yaml",
    "sha256": sha256(schema_path),
    "status": "CANDIDATE_UNTIL_GATE_PASS_AND_HASH_LOCKED_IMPORT",
}

OUT.parent.mkdir(parents=True, exist_ok=True)
manifest_bytes = json.dumps(manifest, indent=2, sort_keys=True).encode()
manifest_sha = hashlib.sha256(manifest_bytes).hexdigest()
with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr("AUDIT_MANIFEST.json", manifest_bytes)
    z.writestr("AUDIT_MANIFEST.sha256", manifest_sha + "\n")
    for item in manifest["files"]:
        z.write(ROOT / item["path"], item["path"])
print(json.dumps({"ok": True, "audit_zip": str(OUT), "audit_zip_sha256": sha256(OUT), "schema_sha256": manifest["canonical_schema_candidate"]["sha256"]}, indent=2))
