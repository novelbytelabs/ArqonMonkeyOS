# GPT Commands

Status:
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable

These are instruction-level commands routed through the ContextBus broker (legacy infrastructure name: ContextOS).

## Current operator-facing command state

The docs below are split into:

- current validated ContextBus commands
- current Science GPT Action surface
- planned but not yet active command families

## Current validated ContextBus commands

- `/sync-context`
- `/sync-constitution`
- `/save-context`
- `/send-message`
- `/inbox`
- `/open-message`
- `/archive-message`
- `/show`
- `/resume`

Current behavior notes:

- archive behavior currently binds to `POST /v1/messages/{message_id}/archive`
- archive remains safe copy-to-archive; inbox deletion is deferred
- notes/messages remain non-official context, not evidence

## Current Science GPT Action surface

Current validated Science GPT Action schema version:

- `0.3.1-contextbus-archive-action-cache-binding`

Current read/context routes exposed to Science GPTs:

- `GET /v1/health`
- `GET /v1/whoami`
- `GET /v1/capabilities`
- `GET /v1/show`
- `GET /v1/resume`
- `GET /v1/flows/{flow_ref}/resume`
- `GET /v1/flows/{flow_ref}/history`
- `GET /v1/flows/{flow_ref}/artifacts`
- `GET /v1/flows/{flow_ref}/latest`
- `GET /v1/flows/{flow_ref}/next`
- `GET /v1/flows/{flow_ref}/stop-conditions`
- `GET /v1/artifacts/{artifact_id}`
- `GET /v1/context`
- `GET /v1/constitution`
- `POST /v1/notes`
- `POST /v1/messages`
- `GET /v1/messages/inbox`
- `GET /v1/messages/{message_id}`
- `POST /v1/messages/{message_id}/archive`

Current Science write routes exposed to role-scoped Science GPTs:

- `POST /v1/science/research`
- `POST /v1/science/hypothesize`
- `POST /v1/science/interpret`
- `POST /v1/science/design-experiment`
- `POST /v1/science/iterate`
- `POST /v1/science/audit-experiment`
- `POST /v1/science/record-finding`

## Legacy/superseded run commands

- `/create-run` (legacy; superseded by planned flow model)
- `/load-run` (legacy; superseded by planned flow model)
- `/write-artifact` (legacy naming; superseded by planned `/write-flow`)
- `/checkpoint` (legacy wrapper behavior)

## Planned Flow Core commands

- `/create-flow`
- `/load-flow`
- `/flow-status`
- `/adv-flow`
- `/write-flow`

Implementation mapping:

- `/create-flow` -> `POST /v1/flows`
- `/load-flow` -> `GET /v1/flows/{flow_ref}`
- `/flow-status` -> `GET /v1/flows/{flow_ref}/status`
- `/write-flow` -> `POST /v1/flows/{flow_ref}/artifacts`
- `/adv-flow` -> `POST /v1/flows/{flow_ref}/advance`

Planned Flow Core defaults and authority:

- project defaults to `ArqonZero`
- role is inferred from broker key
- Human role is required to advance flow gate/status in v0.3

## Reserved or not yet exposed to GPTs

- `/execute-experiment`
- `/share`

Current boundary:

- `POST /v1/science/execute-experiment` is not exposed to GPTs
- `POST /v1/science/share` is not exposed to GPTs

## Future Science Monkeys command family

- `/research`
- `/hypothesize`
- `/design-experiment`
- `/audit-experiment`
- `/interpret`
- `/iterate`
- `/record-finding`

## Future Code Monkeys commands

- `/dossier`
- `/constitution`
- `/specify`
- `/clarify`
- `/plan`
- `/checklists`
- `/tasks`
- `/analyze`
- `/implement`
- `/execute`
- `/audit`

## Doctrine guardrails

- Repo rename is not authorized in this phase.
- Runtime/API/auth behavior has not changed in this docs migration.
- No AI may certify or promote.

## Science-to-Code Orchestration Boundary

This section describes the full intended command family boundary, not the currently exposed GPT Action surface.
Current exposure limits are defined above in `Current Science GPT Action surface` and `Reserved or not yet exposed to GPTs`.

Science Monkeys commands:

```text
/research
/hypothesize
/design-experiment
/execute-experiment
/audit-experiment
/interpret
/iterate
/record-finding
/share
```

Code Monkeys / Spec Kit commands:

```text
/dossier
/constitution
/specify
/plan
/tasks
/implement
/execute
/audit
```

`/share` is the bridge into PM context. It does not automatically create Spec Kit artifacts.

## Science route boundary

Current Science GPT route layer includes:

```text
POST /v1/science/research
POST /v1/science/hypothesize
POST /v1/science/design-experiment
POST /v1/science/audit-experiment
POST /v1/science/interpret
POST /v1/science/iterate
POST /v1/science/record-finding
```

The following remain out of GPT Action scope in the current stage:

```text
POST /v1/science/execute-experiment
POST /v1/science/share
```
