---
status: REQUIRES_HUMAN_REVIEW
classification: development diagnostic only
sealed_test_status: NOT SEALED-TEST CERTIFIED
promotion_status: not promotable
artifact_id: SCIENCE_MONKEYS_OPTION_C_STAGE_3_6_ROLE_PATH_OBSERVATION_PACKET_001
---

# Option C Stage 3.6 Role-Path Observation Packet

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Purpose

Define the next bounded observation-only evidence capture for Stage 3.6.

This packet does not authorize role-path expansion.

This packet does not authorize queue mutation.

This packet does not decide readiness.

## Scope

Capture read-only backend responses for role-path visibility.

Target roles for later observation:

- EXPLORER_AI
- HYPOTHESIZER_AI
- DESIGNER_AI
- SCIENCE_AUDITOR_AI
- HUMAN

## Allowed route class for later capture

Only read-only routes may be used in the later live evidence capture.

Allowed route examples:

- GET /v1/whoami?project=ArqonZero
- GET /v1/science/queue?project=ArqonZero
- GET /v1/science/queue/history/{queue_item_id}?project=ArqonZero

## Forbidden in this packet

- no live route calls
- no mutation route calls
- no claim route
- no block route
- no handoff route
- no complete route
- no quarantine route
- no safety decision
- no eligibility decision
- no PASS or FAIL verdict
- no closeout claim
- no certification claim
- no production-readiness claim
- no deployed Worker commit proof claim unless explicitly present in raw backend response

## Evidence rule for later capture

Every reported field must identify its source:

- BACKEND
- ACTION_LOG
- VISIBLE_OUTPUT
- UNKNOWN

Use YES only when explicitly present in the backend response.

Use UNKNOWN when unclear.

## Required later raw fields

For each role-path observation, capture:

- route attempted
- HTTP status
- authenticated role returned
- ok
- queue item count if visible
- queue_item_id if visible
- flow_ref if visible
- current_state if visible
- current_role_owner if visible
- allowed_next_role if visible
- allowed_next_action if visible
- queue_lane if visible
- claimed_by if visible
- handoff_target_role if visible
- latest_mutation_id if visible
- truth_boundary fields if present
- error.code if returned
- error.message if returned

## Current status

OBSERVATION_PACKET_ONLY_NOT_EXECUTED
