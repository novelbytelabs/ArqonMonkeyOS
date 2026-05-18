#!/usr/bin/env python3
"""Build Auditor-ready evidence zip for SCIENCE_MONKEYS_READ_RESUME_SURFACE_001_HARDENING.

This script packages source files, tests, OpenAPI route schema, and optional Helper
execution report into a deterministic audit pack. It does not certify, promote, or
deploy anything.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "artifacts"
OUT_NAME = "science_monkeys_read_resume_surface_001_hardening_audit_pack.zip"
OPTIONAL_HELPER_REPORT = OUT_DIR / "science_monkeys_read_resume_surface_001_hardening_helper_report.md"

STATUS_LABELS = [
    "REQUIRES_HUMAN_REVIEW",
    "development diagnostic only",
    "NOT SEALED-TEST CERTIFIED",
    "not promotable",
]

INCLUDED_PATHS = [
    "openapi/arqon_contextos.openapi.yaml",
    "worker/src/index.ts",
    "worker/src/read_resume.ts",
    "worker/src/science.ts",
    "worker/src/flow_policy.ts",
    "worker/test_support/science_monkeys_read_resume_surface_policy_unit.ts",
    "worker/test_support/science_monkeys_read_resume_surface_offline_smoke.ts",
    "worker/test_support/science_monkeys_read_resume_surface_hardening_policy_unit.ts",
    "worker/test_support/science_monkeys_read_resume_surface_tripwire.py",
    "worker/test_support/build_read_resume_surface_hardening_audit_bundle.py",
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / OUT_NAME
    manifest: dict[str, object] = {
        "slice": "SCIENCE_MONKEYS_READ_RESUME_SURFACE_001_HARDENING",
        "required_status_labels": STATUS_LABELS,
        "non_authorizations": [
            "no certification",
            "no promotion",
            "no deployment approval",
            "no production readiness claim",
            "no autonomous Science operation",
            "no Option C queue mutation",
            "no new Science artifact types",
            "no /v1/science/share authority change",
            "no Human authority for GPTs",
            "no Science Executor authority for GPTs",
        ],
        "included_files": [],
        "missing_files": [],
        "checksums": {},
    }

    with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for rel in INCLUDED_PATHS:
            path = ROOT / rel
            if not path.exists():
                manifest["missing_files"].append(rel)  # type: ignore[index]
                continue
            data = path.read_bytes()
            manifest["included_files"].append(rel)  # type: ignore[index]
            manifest["checksums"][rel] = sha256_bytes(data)  # type: ignore[index]
            zf.writestr(rel, data)

        if OPTIONAL_HELPER_REPORT.exists():
            data = OPTIONAL_HELPER_REPORT.read_bytes()
            rel = "artifacts/science_monkeys_read_resume_surface_001_hardening_helper_report.md"
            manifest["included_files"].append(rel)  # type: ignore[index]
            manifest["checksums"][rel] = sha256_bytes(data)  # type: ignore[index]
            zf.writestr(rel, data)

        manifest_bytes = json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8")
        zf.writestr("AUDIT_MANIFEST.json", manifest_bytes)
        zf.writestr("AUDIT_MANIFEST.sha256", sha256_bytes(manifest_bytes) + "  AUDIT_MANIFEST.json\n")

    digest = sha256_bytes(out_path.read_bytes())
    print(json.dumps({"ok": True, "audit_zip": str(out_path.relative_to(ROOT)), "sha256": digest}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
