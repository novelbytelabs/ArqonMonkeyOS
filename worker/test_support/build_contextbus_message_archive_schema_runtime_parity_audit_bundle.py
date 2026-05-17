"""Build Auditor-ready zip for Science Monkeys ContextBus message archive schema/runtime parity repair.

Required status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This builder packages source, docs, policy/tripwire scripts, helper report, and
manifest/checksums for Auditor review. It does not certify, promote, deploy,
approve production readiness, or authorize autonomous Science operation.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "temps"
OUT_ZIP = OUT_DIR / "science_monkeys_contextbus_message_archive_schema_runtime_parity_repair_001_audit_pack.zip"
MANIFEST_PATH = OUT_DIR / "contextbus_message_archive_schema_runtime_parity_repair_001_AUDIT_MANIFEST.json"
MANIFEST_SHA_PATH = OUT_DIR / "contextbus_message_archive_schema_runtime_parity_repair_001_AUDIT_MANIFEST.sha256"

REQUIRED_STATUS_LABELS = [
    "REQUIRES_HUMAN_REVIEW",
    "development diagnostic only",
    "NOT SEALED-TEST CERTIFIED",
    "not promotable",
]

CANDIDATE_FILES = [
    "openapi/science_monkeys_actions.openapi.yaml",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_MESSAGE_ARCHIVE_SCHEMA_RUNTIME_PARITY_REPAIR_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_EXPLORER_SMOKE_PACKET_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_GPT_ACTION_SCHEMA_VERSION_LOCK_001.md",
    "worker/test_support/science_monkeys_contextbus_message_archive_schema_runtime_parity_policy_unit.py",
    "worker/test_support/science_monkeys_contextbus_message_archive_schema_runtime_parity_tripwire.py",
    "worker/test_support/science_monkeys_contextbus_action_schema_policy_unit.py",
    "worker/test_support/science_monkeys_contextbus_action_schema_tripwire.py",
    "worker/test_support/science_monkeys_schema_version_lock_policy_unit.py",
    "worker/test_support/build_contextbus_message_archive_schema_runtime_parity_audit_bundle.py",
    "temps/science_monkeys_contextbus_message_archive_schema_runtime_parity_repair_001_helper_report.md",
]


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def git_commit() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            cwd=ROOT,
            text=True,
            stderr=subprocess.STDOUT,
        ).strip()
    except Exception:
        return "UNKNOWN"


def git_status_short() -> str:
    try:
        return subprocess.check_output(
            ["git", "status", "--short"],
            cwd=ROOT,
            text=True,
            stderr=subprocess.STDOUT,
        ).strip()
    except Exception:
        return "UNKNOWN"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    included: list[dict[str, Any]] = []
    missing: list[str] = []

    for rel in CANDIDATE_FILES:
        path = ROOT / rel
        if path.exists() and path.is_file():
            included.append(
                {
                    "path": rel,
                    "sha256": sha256_file(path),
                    "size_bytes": path.stat().st_size,
                }
            )
        else:
            missing.append(rel)

    manifest: dict[str, Any] = {
        "audit_pack": "SCIENCE_MONKEYS_CONTEXTBUS_MESSAGE_ARCHIVE_SCHEMA_RUNTIME_PARITY_REPAIR_001",
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "required_status_labels": REQUIRED_STATUS_LABELS,
        "source_commit": git_commit(),
        "git_status_short": git_status_short(),
        "boundary": {
            "certification": "NOT_AUTHORIZED",
            "promotion": "NOT_AUTHORIZED",
            "deployment_approval": "NOT_AUTHORIZED",
            "production_readiness": "NOT_AUTHORIZED",
            "autonomous_science_operation": "NOT_AUTHORIZED",
            "option_c_queue_mutation": "NOT_AUTHORIZED",
            "science_share_authority_change": "NOT_AUTHORIZED",
            "science_executor_gpt_authority": "NOT_AUTHORIZED",
            "human_authority_for_gpts": "NOT_AUTHORIZED",
        },
        "included_files": included,
        "missing_optional_files": missing,
    }

    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    MANIFEST_SHA_PATH.write_text(f"{sha256_file(MANIFEST_PATH)}  {MANIFEST_PATH.name}\n", encoding="utf-8")

    with zipfile.ZipFile(OUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.write(MANIFEST_PATH, "AUDIT_MANIFEST.json")
        zf.write(MANIFEST_SHA_PATH, "AUDIT_MANIFEST.sha256")
        for row in included:
            rel = row["path"]
            zf.write(ROOT / rel, rel)

    print(json.dumps(
        {
            "ok": True,
            "audit_zip": str(OUT_ZIP.relative_to(ROOT)),
            "audit_zip_sha256": sha256_file(OUT_ZIP),
            "included_count": len(included),
            "missing_optional_files": missing,
        },
        indent=2,
        sort_keys=True,
    ))


if __name__ == "__main__":
    main()
