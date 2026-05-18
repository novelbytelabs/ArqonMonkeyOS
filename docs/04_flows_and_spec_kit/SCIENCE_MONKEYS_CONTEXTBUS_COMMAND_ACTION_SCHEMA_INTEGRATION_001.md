# SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001

Required status:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Objective

Expose shared ContextBus commands to Science Monkey GPT Action schemas without expanding Science authority.

Current Stage 2B guard:

- broad multi-role Stage 2B smoke is blocked until `SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_CONTRACT_PARITY_001` closes request-shape parity for `/v1/notes` and `/v1/messages`

## Commands exposed

- `/sync-context` -> `GET /v1/context`
- `/sync-constitution` -> `GET /v1/constitution`
- `/save-context` -> `POST /v1/notes`
- `/send-message` -> `POST /v1/messages`
- `/inbox` -> `GET /v1/messages/inbox`
- `/open-message` -> `GET /v1/messages/{message_id}`
- `/archive-message` -> `POST /v1/messages/{message_id}/archive`

## Request-shape parity constraints

- `/save-context` must map to a note payload that includes `project`, `title`, `body`, `tags`, and `visibility`
- note `visibility` is constrained to `team`
- `/send-message` must use canonical recipient field `to`
- alternate recipient aliasing such as `to_role` must not remain in the Stage 2B public Action surface

## Evidence boundary

ContextBus notes and messages are non-official coordination records. They are not Science artifacts, scientific evidence, findings, Human approvals, certification, promotion, deployment approval, or production readiness.

Raw GPT output is not evidence. No harness = No truth.

## Non-authorizations

This slice does not authorize Science write route expansion, Code Monkey route exposure, Option C queue mutation, `/v1/science/share` authority changes, `/v1/science/execute-experiment` exposure to GPTs, Human authority for GPTs, Science Executor authority for GPTs, deployment, certification, promotion, production-readiness claims, or autonomous Science operation.
