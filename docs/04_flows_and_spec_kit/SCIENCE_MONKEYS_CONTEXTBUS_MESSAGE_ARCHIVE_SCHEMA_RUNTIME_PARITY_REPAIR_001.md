# SCIENCE_MONKEYS_CONTEXTBUS_MESSAGE_ARCHIVE_SCHEMA_RUNTIME_PARITY_REPAIR_001

Required status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Objective

Repair schema/runtime parity for the Explorer ContextBus archive command.

Prior exposed path:

````text
POST /v1/messages/{message_id}
````

Runtime-compatible path:

````text
POST /v1/messages/{message_id}/archive
````

Messages and notes are non-official ContextBus records. They are not evidence, not Science artifacts, not findings, not certification, not promotion, not deployment approval, and not production readiness.

## Non-authorizations

This does not authorize Science write expansion, Code Monkey route exposure, Option C queue mutation, /v1/science/share exposure, /v1/science/execute-experiment exposure, Human authority for GPTs, Science Executor authority for GPTs, deployment, certification, promotion, production readiness, or autonomous Science operation.
