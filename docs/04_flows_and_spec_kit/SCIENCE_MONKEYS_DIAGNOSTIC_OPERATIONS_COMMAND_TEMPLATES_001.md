# Science Monkeys Diagnostic Operations Command Templates 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Objective

Provide safe command templates for Option A manual diagnostic operations.

These templates do not authorize autonomous operation.

## Explorer

```text
/research name="<flow-name>" topic="<topic>" objective="<what we need to understand>"
```

```text
/source-map name="<flow-name>" topic="<topic>" focus="primary sources, secondary sources, weak sources"
```

```text
/contradictions name="<flow-name>" topic="<topic>" focus="conflicting claims and evidence gaps"
```

```text
/open-questions name="<flow-name>" topic="<topic>" focus="unknowns, contradictions, and missing evidence"
```

## Hypothesizer

```text
/hypothesize flow="<flow-id-or-name>" research_artifact="<research artifact id/path>" objective="<single claim to test>"
```

```text
/null-hypothesis flow="<flow-id-or-name>" hypothesis_context="<summary or artifact id>" objective="define what would disconfirm the claim"
```

```text
/prediction-record flow="<flow-id-or-name>" hypothesis_artifact="<hypothesis artifact id/path>" expected="<expected observations>" disconfirming="<what would falsify it>"
```

```text
/iterate-hypothesis flow="<flow-id-or-name>" audit_result="<audit summary or artifact id>" goal="revise hypothesis without changing execution evidence"
```

## Designer

```text
/design-experiment flow="<flow-id-or-name>" hypothesis_artifact="<hypothesis_card id/path>" objective="<what the experiment must test>"
```

```text
/metric-plan flow="<flow-id-or-name>" protocol_context="<summary or artifact id>" objective="define pass/fail metrics"
```

```text
/control-plan flow="<flow-id-or-name>" hypothesis_artifact="<hypothesis_card id/path>" objective="define controls and negative controls"
```

```text
/execution-packet flow="<flow-id-or-name>" protocol_artifact="<experiment_protocol id/path>" executor="SCIENCE_EXECUTOR_AI"
```

## Science Auditor

```text
/audit-experiment flow="<flow-id-or-name>" evidence_packet="<artifact ids/paths>" objective="audit protocol, evidence, claims, and role boundaries"
```

```text
/claim-scope-review flow="<flow-id-or-name>" finding_context="<summary or artifact id>" objective="separate allowed and forbidden claims"
```

```text
/quarantine-review flow="<flow-id-or-name>" evidence_packet="<artifact ids/paths>" risk="possible weak evidence or role violation"
```

```text
/record-finding flow="<flow-id-or-name>" audit_report="<audit_report id/path>" finding_type="positive|negative|inconclusive|boundary"
```

## Forbidden Commands For Science GPTs

Science GPTs must refuse:

```text
create official /v1/science/share
execute experiment through /v1/science/execute-experiment
use HUMAN token
use SCIENCE_EXECUTOR_AI token
certify this
promote this
deploy this
claim production readiness
create Code Monkeys implementation task
```
