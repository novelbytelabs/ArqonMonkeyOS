# Science Monkeys GPT Action Schema Version Lock 001

Required status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Current candidate schema

Schema file:

````text
openapi/science_monkeys_actions.openapi.yaml
````

Schema version:

````text
0.3.1-contextbus-archive-action-cache-binding
````

Schema id:

````text
SCIENCE_MONKEYS_CONTEXTBUS_ARCHIVE_ACTION_CACHE_BINDING_REPAIR_001
````

## Version-lock rule

The repo schema is candidate until imported.

A repo schema is not live-canonical until:

1. all policy/tripwire gates pass,
2. commit/push completes,
3. the exact repo schema SHA256 is computed,
4. that exact file is imported into GPT Actions,
5. imported GPT Action schema SHA must match repo schema SHA,
6. live-smoke evidence must record imported schema SHA.

Until then:

````text
GPT Action import status: NOT_DONE_SEPARATE_OPERATOR_STEP_REQUIRED
````

## Boundary

This schema does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

It must not expose:
- `/v1/science/share`
- `/v1/science/execute-experiment`
- Option C queue mutation routes
- Code Monkey routes
- Human authority routes
- Science Executor authority routes

## Archive cache-binding note

The archive command must use:

````text
POST /v1/messages/{message_id}/archive
operationId: archiveRoleMessageByArchivePath
````

Open-message remains:

````text
GET /v1/messages/{message_id}
operationId: openRoleMessage
````
