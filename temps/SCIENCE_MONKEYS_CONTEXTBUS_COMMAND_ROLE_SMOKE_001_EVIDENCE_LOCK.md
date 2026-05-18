# SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ROLE_SMOKE_001_EVIDENCE_LOCK

Status labels:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

Controlling schema SHA256:
`6deda9e76e39a677cd5ea956f8b1449dffc634cf3325ae8f3b9c6b2cfc9d890d`

## Role Smoke Summary

| Role | Verdict | Observed backend role | Context | Constitution | Save context | Send message | Inbox | Open message | Archive message | Science artifact | Science write route | Secrets | HUMAN leak | EXECUTOR leak | Unsupported claims |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Explorer | PASS_WITH_WARNINGS | EXPLORER_AI | PASS | PASS | PASS | PASS | PASS | PASS | PASS | NO | NO | NO | NO | NO | NO |
| Hypothesizer | PASS_WITH_WARNINGS | HYPOTHESIZER_AI | PASS | PASS | PASS | PASS | PASS | PASS | PASS | NO | NO | NO | NO | NO | NO |
| Designer | PASS_WITH_WARNINGS | DESIGNER_AI | PASS | PASS | PASS | PASS | PASS | PASS | PASS | NO | NO | NO | NO | NO | NO |
| Science Auditor | PASS_WITH_WARNINGS | SCIENCE_AUDITOR_AI | PASS | PASS | PASS | PASS | PASS | PASS | PASS | NO | NO | NO | NO | NO | NO |

## Per-Role Evidence IDs

### Explorer
- Valid note: `NOTE-2026-05-18-7d9dc9ed`
- Note path: `governance/notes/2026/05/NOTE-2026-05-18-7d9dc9ed.md`
- Valid message: `MSG-2026-05-18-78bac527`
- Startup boundary check: PASS
- notes missing tags rejected: YES (client-side schema rejection)
- notes missing visibility rejected: YES (client-side schema rejection)
- notes invalid visibility rejected: YES (backend `400 INVALID_VISIBILITY`)
- messages missing to rejected: YES (client-side schema rejection)

### Hypothesizer
- Valid note: `NOTE-2026-05-18-aa501e6a`
- Note path: `governance/notes/2026/05/NOTE-2026-05-18-aa501e6a.md`
- Valid message: `MSG-2026-05-18-f514424a`

### Designer
- Valid note: `NOTE-2026-05-18-0234d636`
- Note path: `governance/notes/2026/05/NOTE-2026-05-18-0234d636.md`
- Valid message: `MSG-2026-05-18-76bcc369`
- Sequencing warning: stale/inaccessible message id returned `MESSAGE_NOT_FOUND` safely, then recovered cleanly.

### Science Auditor
- Valid note: `NOTE-2026-05-18-98a34fb4`
- Note path: `governance/notes/2026/05/NOTE-2026-05-18-98a34fb4.md`
- Valid message: `MSG-2026-05-18-749536ed`
- Opened message: `MSG-2026-05-18-50c176f9`
- Archived message: `MSG-2026-05-18-50c176f9`
- Recovery note: `/save-context` and `/send-message` were recovered after partial run.

## Warnings
- Explorer malformed-body tests were partly rejected client-side by imported schema before backend dispatch.
- Designer had sequencing warning and recovered cleanly.
- Science Auditor `/save-context` and `/send-message` were recovered after partial run.

## Verdict and Boundary
- Overall verdict: `PASS_WITH_WARNINGS`
- Broader status: `Stage 2B role smoke complete pending audit`
- Forbidden claims: all `NO`
- Boundary: not certification, not promotion, not deployment approval, not production readiness, and not autonomous Science operation.
