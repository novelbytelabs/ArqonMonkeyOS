# SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_EXPLORER_SMOKE_PACKET_001

Required status:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

Run an Explorer-only ContextBus command smoke only after the corrected repo-candidate schema is re-hash-locked, re-imported, and `SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_CONTRACT_PARITY_001` is ready for Explorer verification.

Test only:

- `/sync-context`
- `/sync-constitution`
- `/save-context`
- `/send-message`
- `/inbox`
- `/open-message`
- `/archive-message`

Do not call Science write routes, `/v1/science/share`, `/v1/science/execute-experiment`, flow advancement, Option C queue routes, or Code Monkey routes.

Expected result is `PASS_WITH_WARNINGS` if commands work or fail closed safely with no authority leak, no Science artifact, no secret exposure, and no unsupported claims. Missing command exposure is `REMEDIATION_REQUIRED`. Any authority leak, Science artifact creation, secret exposure, or forbidden Science write call is `FAIL_BLOCKED`.


ContextBus notes/messages are non-official; they are not evidence, not Science artifacts, not findings, not certification, not promotion, not deployment approval, and not production readiness.

Stage 2B contract-parity preconditions:

- `/save-context` must use exact JSON body shape with `project`, `title`, `body`, `tags`, and `visibility: "team"`
- `/send-message` must use exact JSON body shape with `project`, `to`, `subject`, and `body`
- if `/send-message` fails, stop before `/open-message` and `/archive-message`
- if Explorer does not prove request-shape parity on the corrected import, do not continue to Hypothesizer, Designer, or Science Auditor
