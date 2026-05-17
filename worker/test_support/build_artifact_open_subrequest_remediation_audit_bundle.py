#!/usr/bin/env python3
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "temps" / "science_monkeys_artifact_open_subrequest_remediation_001_audit_pack.zip"
MANIFEST = ROOT / "temps" / "science_monkeys_artifact_open_subrequest_remediation_001_audit_manifest.json"
MANIFEST_SHA = ROOT / "temps" / "science_monkeys_artifact_open_subrequest_remediation_001_audit_manifest.sha256"

FILES = [
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_READ_RESUME_ARTIFACT_OPEN_SUBREQUEST_REMEDIATION_001.md",
    "docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_READ_RESUME_GPT_ACTION_LIVE_SMOKE_001_ARTIFACT_RERUN_PACKET.md",
    "openapi/arqon_contextos.openapi.yaml",
    "openapi/science_monkeys_actions.openapi.yaml",
    "worker/src/read_resume.ts",
    "worker/src/index.ts",
    "worker/src/science.ts",
    "worker/src/flow_policy.ts",
    "worker/test_support/science_monkeys_artifact_open_subrequest_policy_unit.ts",
    "worker/test_support/science_monkeys_artifact_open_subrequest_tripwire.py",
    "worker/test_support/science_monkeys_read_resume_surface_hardening_policy_unit.ts",
    "worker/test_support/science_monkeys_read_resume_surface_tripwire.py",
    "worker/test_support/build_artifact_open_subrequest_remediation_audit_bundle.py",
    "temps/science_monkeys_artifact_open_subrequest_remediation_001_helper_report.md",
]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def main() -> None:
    entries = []
    for rel in FILES:
        path = ROOT / rel
        if not path.exists():
            raise SystemExit(f"missing required audit file: {rel}")
        entries.append({"path": rel, "sha256": sha256(path), "bytes": path.stat().st_size})

    manifest = {
        "artifact": "SCIENCE_MONKEYS_READ_RESUME_ARTIFACT_OPEN_SUBREQUEST_REMEDIATION_001_AUDIT_PACK",
        "required_status": [
            "REQUIRES_HUMAN_REVIEW",
            "development diagnostic only",
            "NOT SEALED-TEST CERTIFIED",
            "not promotable",
        ],
        "not_authorized": [
            "certification",
            "promotion",
            "deployment approval",
            "production readiness",
            "autonomous Science operation",
            "Option C queue mutation",
            "new Science artifact types",
            "Human authority for GPTs",
            "Science Executor authority for GPTs",
        ],
        "files": entries,
    }

    ROOT.joinpath("temps").mkdir(exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    MANIFEST_SHA.write_text(sha256(MANIFEST) + "  " + MANIFEST.name + "\n")

    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.write(MANIFEST, "AUDIT_MANIFEST.json")
        zf.write(MANIFEST_SHA, "AUDIT_MANIFEST.sha256")
        for rel in FILES:
            zf.write(ROOT / rel, rel)

    print(json.dumps({"ok": True, "zip": str(OUT.relative_to(ROOT)), "sha256": sha256(OUT), "file_count": len(FILES) + 2}, indent=2))


if __name__ == "__main__":
    main()
