# SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_EXPLORER_SMOKE_PACKET_001

Required status:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

Run an Explorer-only ContextBus command smoke after Action schema refresh.

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
