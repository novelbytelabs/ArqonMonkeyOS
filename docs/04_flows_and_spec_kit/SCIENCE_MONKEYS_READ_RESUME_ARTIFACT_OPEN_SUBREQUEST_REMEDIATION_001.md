# Science Monkeys Read/Resume Artifact Open Subrequest Remediation 001

Required status:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Remediate the bounded live GPT Action smoke blocker for:

```text
GET /v1/artifacts/{artifact_id}
```

Observed blocker:

```text
INTERNAL_ERROR
Too many subrequests by single Worker invocation
```

The prior live smoke evidence showed strong authority-boundary behavior across the Science GPTs, but artifact body read behavior remained inconclusive because the route failed before returning a normal governed response.

## Scope

This slice is limited to reducing Worker subrequest pressure for artifact body reads and documenting the deterministic low-subrequest access pattern.

Allowed:

- Add optional `flow_ref` query support to `GET /v1/artifacts/{artifact_id}`.
- Add optional bounded `scan_limit` query support when `flow_ref` is omitted.
- Prefer flow-scoped lookup for deterministic artifact body reads.
- Preserve existing secret-body refusal, unsafe-path refusal, duplicate-ID fail-closed behavior, and read-only behavior.
- Update OpenAPI and Science GPT Action schema docs for the optional query fields.
- Add policy and tripwire tests.
- Generate Auditor-ready zip evidence.

Not authorized:

- Option C queue mutation.
- New Science artifact types.
- `/v1/science/share` authority changes.
- Human authority for GPTs.
- Science Executor authority for GPTs.
- Deployment.
- Certification.
- Promotion.
- Production-readiness claims.
- Autonomous Science operation.

## Design

### Preferred path

```text
GET /v1/artifacts/{artifact_id}?flow_ref={flow_id_or_name}
```

This performs a low-subrequest lookup:

1. Load flow index to resolve the flow.
2. Load the selected flow manifest.
3. Confirm the artifact ID appears exactly once in that manifest.
4. Validate the artifact source path.
5. Fetch the governed artifact body.
6. Refuse secret-like content before returning body text.

### Backward-compatible path

```text
GET /v1/artifacts/{artifact_id}
```

When `flow_ref` is omitted, the route performs a bounded recent-flow scan rather than scanning every flow manifest. If the artifact cannot be proven within the bounded scan, it returns fail-closed guidance:

```text
ARTIFACT_FLOW_REF_REQUIRED
```

This avoids live Worker/tool subrequest exhaustion while keeping read behavior conservative.

## Expected live rerun

Rerun only the blocked live Action check after deployment/refresh:

```text
GET /v1/artifacts/ART-2026-05-16-6dd49724?flow_ref=FLOW-2026-0052
```

Expected:

- HTTP 200 or safe policy refusal.
- No `Too many subrequests` error.
- No secret-like content returned.
- No artifact created.
- No state mutation.
- Required status labels present.
- Governed-record-not-truth warning present.

## Evidence boundary

A passing rerun of this one endpoint only closes the prior live-smoke blocker. It does not certify, promote, deploy, approve production readiness, or authorize autonomous Science operation.
