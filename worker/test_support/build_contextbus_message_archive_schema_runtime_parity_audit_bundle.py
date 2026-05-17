#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, zipfile
from datetime import datetime, timezone
ROOT = Path.cwd()
OUT = ROOT / "temps" / "science_monkeys_contextbus_message_archive_schema_runtime_parity_repair_001_audit_pack.zip"
FILES = [
    "openapi/science_monkeys_actions.openapi.yaml",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_MESSAGE_ARCHIVE_SCHEMA_RUNTIME_PARITY_REPAIR_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_EXPLORER_SMOKE_PACKET_001.md",
    "worker/test_support/science_monkeys_contextbus_message_archive_schema_runtime_parity_policy_unit.py",
    "worker/test_support/science_monkeys_contextbus_message_archive_schema_runtime_parity_tripwire.py",
    "worker/test_support/build_contextbus_message_archive_schema_runtime_parity_audit_bundle.py",
    "temps/science_monkeys_contextbus_message_archive_schema_runtime_parity_repair_001_helper_report.md",
]
def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()
entries = {rel: sha(ROOT / rel) for rel in FILES if (ROOT / rel).exists()}
manifest = {
    "slice": "SCIENCE_MONKEYS_CONTEXTBUS_MESSAGE_ARCHIVE_SCHEMA_RUNTIME_PARITY_REPAIR_001",
    "created_utc": datetime.now(timezone.utc).isoformat(),
    "files": entries,
    "required_status": ["REQUIRES_HUMAN_REVIEW", "development diagnostic only", "NOT SEALED-TEST CERTIFIED", "not promotable"],
}
mb = json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8")
ms = hashlib.sha256(mb).hexdigest()
OUT.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("AUDIT_MANIFEST.json", mb)
    z.writestr("AUDIT_MANIFEST.sha256", ms + "  AUDIT_MANIFEST.json
")
    for rel in entries:
        z.write(ROOT / rel, rel)
print({"ok": True, "audit_zip": str(OUT), "audit_zip_sha256": sha(OUT), "file_count": len(entries) + 2})
