# Science Monkeys ContextBus Archive Action Cache Binding Repair 001

Required status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Objective

Repair GPT Action binding drift by ensuring archive uses a distinct path and operationId:

````text
POST /v1/messages/{message_id}/archive
operationId: archiveRoleMessageByArchivePath
````

`GET /v1/messages/{message_id}` remains open-message only.

## Boundary

Messages are non-official ContextBus records only. They are not Science evidence, not findings, not Science artifacts, not promotion, not deployment approval, and not production readiness.

This slice does not expose `/v1/science/share`, `/v1/science/execute-experiment`, Code Monkey routes, Option C queue mutation, Human authority, or Science Executor authority.
