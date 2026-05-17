#!/usr/bin/env python3
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "temps" / "science_monkeys_contextbus_command_action_schema_integration_001_audit_pack.zip"

FILES = [
    "openapi/science_monkeys_actions.openapi.yaml",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_EXPLORER_SMOKE_PACKET_001.md",
    "worker/test_support/science_monkeys_contextbus_action_schema_policy_unit.py",
    "worker/test_support/science_monkeys_contextbus_action_schema_tripwire.py",
    "worker/test_support/build_contextbus_command_action_schema_audit_bundle.py",
    "temps/science_monkeys_contextbus_command_action_schema_integration_001_helper_report.md",
]

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

OUT.parent.mkdir(parents=True, exist_ok=True)
manifest = {
    "slice": "SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001",
    "required_status": ["REQUIRES_HUMAN_REVIEW", "development diagnostic only", "NOT SEALED-TEST CERTIFIED", "not promotable"],
    "non_authorizations": [
        "no Science write route expansion", "no Code Monkey route exposure", "no Option C queue mutation",
        "no /v1/science/share authority change", "no /v1/science/execute-experiment exposure to GPTs",
        "no Human authority for GPTs", "no Science Executor authority for GPTs",
        "no deployment/certification/promotion/production/autonomy claim"
    ],
    "files": [],
}
for rel in FILES:
    p = ROOT / rel
    manifest["files"].append({"path": rel, "sha256": sha256(p)} if p.exists() else {"path": rel, "missing": True})
manifest_bytes = json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8")
manifest_sha = hashlib.sha256(manifest_bytes).hexdigest()
with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr("AUDIT_MANIFEST.json", manifest_bytes)
    z.writestr("AUDIT_MANIFEST.sha256", manifest_sha + "\n")
    for rel in FILES:
        p = ROOT / rel
        if p.exists():
            z.write(p, rel)
print(json.dumps({"ok": True, "audit_zip": str(OUT), "audit_zip_sha256": sha256(OUT), "manifest_sha256": manifest_sha}, indent=2, sort_keys=True))
