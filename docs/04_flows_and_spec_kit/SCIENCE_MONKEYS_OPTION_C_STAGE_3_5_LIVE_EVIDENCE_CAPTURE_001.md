# SCIENCE_MONKEYS_OPTION_C_STAGE_3_5_LIVE_EVIDENCE_CAPTURE_001

## Observed
- Live read routes were called only for:
  - `GET /v1/health`
  - `GET /v1/whoami?project=ArqonZero`
  - `GET /v1/science/queue?project=ArqonZero`
  - `GET /v1/science/queue/history/Q-FLOW-2026-0046?project=ArqonZero`
  - `GET /v1/science/queue/history/Q-FLOW-2026-0005?project=ArqonZero`
- Command log shows all route calls completed with `curl_exit_status=0` and `http_status=200`.
- `whoami` response returned `authenticated_role: EXPLORER_AI`.
- `queue` response included `no_mutation: true` and truth-boundary fields indicating queue records are not truth/evidence.
- `queue` response (captured at `2026-05-19T19:46:45Z` to `2026-05-19T19:46:47Z`) shows `Q-FLOW-2026-0046` with:
  - `current_state: BLOCKED`
  - `allowed_next_action: BLOCKED_ITEM_POLICY_CHECK_REQUIRED`
- `history/Q-FLOW-2026-0046` response includes queue item detail and history events in a read-only response envelope.
- `history/Q-FLOW-2026-0005` response shows:
  - `current_state: HANDOFF_REQUESTED`
  - `allowed_next_action: READ_ONLY_RECOMMENDATION_ONLY`
- Local metadata checks:
  - `git rev-parse HEAD`: `874d2ef415bebfcaf9ace80ce5a577b30e2a718c`
  - `git log --oneline -5` captured in command log
  - `openapi/cloudflare-worker.js`: exists
  - SHA256(`openapi/cloudflare-worker.js`): `cec5eefa1065826fc4aa0b97fdda1e943121dbc171aec38cb1c7a3bd398a0033`
- Runtime commit/version proof exposure:
  - `/v1/health` exposes `version: 0.1.0`
  - No explicit runtime commit SHA/worker build commit field was observed in captured `/v1/health` or `/v1/whoami` bodies.

## Inferred
- The captured runtime was reachable and returned JSON envelopes for all requested read routes.
- Read-only route captures provide governance-state observations at capture time, not scientific evidence or truth.
- Runtime version string is present; direct runtime commit proof was not observed in captured response fields.

## Assumed
- The sourced local secret file provided valid auth material for Explorer read access.
- The captured responses correspond to the deployed worker behind `https://arqon-contextos-broker.sonarum.workers.dev` at the logged timestamps.

## Unknown
- Whether queue state differs before/after capture timestamps outside this bounded window.
- Whether runtime internally maps to repo `HEAD` commit without additional deployment proof.
- Whether any non-captured headers/telemetry carry hidden build provenance.

## Contradictions
- No internal contradiction detected within this bounded capture set.
- Prior narratives outside this capture set are not reconciled here.

## Blocked
- NONE

## Raw command log
````text
artifact: artifacts/stage_3_5_live_evidence_capture_001/command_log.txt

[2026-05-19T19:46:44Z] CMD_START git_rev_parse
874d2ef415bebfcaf9ace80ce5a577b30e2a718c
[2026-05-19T19:46:44Z] CMD_END git_rev_parse exit=0
[2026-05-19T19:46:44Z] CMD_START git_log
874d2ef Harden science queue read route against uncaught 1101 failures
0b11255 fix: replay Option C mutations before visibility checks
99d2e18 fix: keep handoff Option C queue items visible
6f6baac docs: packet Option C handoff block E2E
dccfdb7 docs: plan Option C role-path expansion
[2026-05-19T19:46:44Z] CMD_END git_log exit=0
[2026-05-19T19:46:44Z] CMD_START sha_openapi
[2026-05-19T19:46:44Z] CMD_END sha_openapi exit=0
[2026-05-19T19:46:44Z] HTTP_START health route=https://arqon-contextos-broker.sonarum.workers.dev/v1/health
[2026-05-19T19:46:44Z] HTTP_END health exit=0 http_status=200
[2026-05-19T19:46:44Z] HTTP_START whoami route=https://arqon-contextos-broker.sonarum.workers.dev/v1/whoami?project=ArqonZero
[2026-05-19T19:46:45Z] HTTP_END whoami exit=0 http_status=200
[2026-05-19T19:46:45Z] HTTP_START queue route=https://arqon-contextos-broker.sonarum.workers.dev/v1/science/queue?project=ArqonZero
[2026-05-19T19:46:47Z] HTTP_END queue exit=0 http_status=200
[2026-05-19T19:46:47Z] HTTP_START history_q_0046 route=https://arqon-contextos-broker.sonarum.workers.dev/v1/science/queue/history/Q-FLOW-2026-0046?project=ArqonZero
[2026-05-19T19:46:48Z] HTTP_END history_q_0046 exit=0 http_status=200
[2026-05-19T19:46:48Z] HTTP_START history_q_0005 route=https://arqon-contextos-broker.sonarum.workers.dev/v1/science/queue/history/Q-FLOW-2026-0005?project=ArqonZero
[2026-05-19T19:46:48Z] HTTP_END history_q_0005 exit=0 http_status=200
````

## Raw response file index
- `artifacts/stage_3_5_live_evidence_capture_001/health.body.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/health.headers.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/health.meta.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/whoami.body.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/whoami.headers.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/whoami.meta.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/queue.body.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/queue.headers.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/queue.meta.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/history_q_0046.body.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/history_q_0046.headers.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/history_q_0046.meta.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/history_q_0005.body.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/history_q_0005.headers.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/history_q_0005.meta.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/command_log.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/openapi_cloudflare_worker_exists.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/openapi_cloudflare_worker_sha256.txt`
- `artifacts/stage_3_5_live_evidence_capture_001/runtime_version_proof_scan.txt`

## Final status
LIVE_EVIDENCE_CAPTURED_REQUIRES_REAUDIT
