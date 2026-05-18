#!/usr/bin/env python3
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "temps" / "science_monkeys_read_only_queue_implementation_001_audit_pack.zip"

FILES = [
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_PACKET_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_PACKET_001_EVIDENCE.md",
    "worker/src/index.ts",
    "worker/src/science_queue_read.ts",
    "openapi/arqon_contextos.openapi.yaml",
    "openapi/science_monkeys_actions.openapi.yaml",
    "worker/test_support/science_monkeys_read_only_queue_policy_unit.py",
    "worker/test_support/science_monkeys_read_only_queue_tripwire.py",
    "worker/test_support/science_monkeys_read_only_queue_offline_smoke.ts",
    "worker/test_support/build_read_only_queue_audit_bundle.py",
    "temps/science_monkeys_read_only_queue_implementation_001_helper_report.md",
    "temps/science_monkeys_read_only_queue_implementation_001_route_matrix.md",
    "temps/science_monkeys_read_only_queue_implementation_001_auth_matrix.md",
    "temps/science_monkeys_read_only_queue_implementation_001_response_schema.json",
    "temps/science_monkeys_read_only_queue_implementation_001_no_mutation_proof.json",
    "temps/science_monkeys_read_only_queue_implementation_001_command_logs.md",
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


OUT.parent.mkdir(parents=True, exist_ok=True)
manifest = {
    "slice": "SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_EXECUTION_001",
    "required_status": [
        "REQUIRES_HUMAN_REVIEW",
        "development diagnostic only",
        "NOT SEALED-TEST CERTIFIED",
        "not promotable",
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

print(json.dumps({"ok": True, "audit_zip": str(OUT), "audit_zip_sha256": sha256(OUT), "manifest_sha256": manifest_sha}, indent=2))
