#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "temps"
OUT_ZIP = OUT_DIR / "science_monkeys_contextbus_archive_action_cache_binding_repair_001_audit_pack.zip"
MANIFEST = OUT_DIR / "contextbus_archive_action_cache_binding_repair_001_AUDIT_MANIFEST.json"
MANIFEST_SHA = OUT_DIR / "contextbus_archive_action_cache_binding_repair_001_AUDIT_MANIFEST.sha256"

FILES = [
    "openapi/science_monkeys_actions.openapi.yaml",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_ARCHIVE_ACTION_CACHE_BINDING_REPAIR_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_ARCHIVE_ACTION_CACHE_BINDING_RERUN_PACKET_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_GPT_ACTION_SCHEMA_VERSION_LOCK_001.md",
    "worker/test_support/science_monkeys_contextbus_archive_action_cache_binding_policy_unit.py",
    "worker/test_support/science_monkeys_contextbus_archive_action_cache_binding_tripwire.py",
    "worker/test_support/science_monkeys_contextbus_message_archive_schema_runtime_parity_policy_unit.py",
    "worker/test_support/science_monkeys_contextbus_message_archive_schema_runtime_parity_tripwire.py",
    "worker/test_support/science_monkeys_schema_version_lock_policy_unit.py",
    "worker/test_support/build_contextbus_archive_action_cache_binding_audit_bundle.py",
    "temps/science_monkeys_contextbus_archive_action_cache_binding_repair_001_helper_report.md",
]

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def git(args: list[str]) -> str:
    try:
        return subprocess.check_output(["git", *args], cwd=ROOT, text=True, stderr=subprocess.STDOUT).strip()
    except Exception:
        return "UNKNOWN"

def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    included = []
    missing = []
    for rel in FILES:
        p = ROOT / rel
        if p.exists() and p.is_file():
            included.append({"path": rel, "sha256": sha256(p), "size_bytes": p.stat().st_size})
        else:
            missing.append(rel)

    manifest = {
        "audit_pack": "SCIENCE_MONKEYS_CONTEXTBUS_ARCHIVE_ACTION_CACHE_BINDING_REPAIR_001",
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_commit": git(["rev-parse", "HEAD"]),
        "git_status_short": git(["status", "--short"]),
        "required_status_labels": [
            "REQUIRES_HUMAN_REVIEW",
            "development diagnostic only",
            "NOT SEALED-TEST CERTIFIED",
            "not promotable",
        ],
        "boundary": {
            "certification": "NOT_AUTHORIZED",
            "promotion": "NOT_AUTHORIZED",
            "deployment_approval": "NOT_AUTHORIZED",
            "production_readiness": "NOT_AUTHORIZED",
            "autonomous_science_operation": "NOT_AUTHORIZED",
            "science_share_exposure": "NOT_AUTHORIZED",
            "science_executor_exposure": "NOT_AUTHORIZED",
            "option_c_queue_mutation": "NOT_AUTHORIZED",
            "code_monkey_route_exposure": "NOT_AUTHORIZED",
        },
        "included_files": included,
        "missing_optional_files": missing,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    MANIFEST_SHA.write_text(f"{sha256(MANIFEST)}  {MANIFEST.name}\n", encoding="utf-8")
    with zipfile.ZipFile(OUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.write(MANIFEST, "AUDIT_MANIFEST.json")
        z.write(MANIFEST_SHA, "AUDIT_MANIFEST.sha256")
        for item in included:
            z.write(ROOT / item["path"], item["path"])
    print(json.dumps({
        "ok": True,
        "audit_zip": str(OUT_ZIP.relative_to(ROOT)),
        "audit_zip_sha256": sha256(OUT_ZIP),
        "included_count": len(included),
        "missing_optional_files": missing,
    }, indent=2, sort_keys=True))

if __name__ == "__main__":
    main()
