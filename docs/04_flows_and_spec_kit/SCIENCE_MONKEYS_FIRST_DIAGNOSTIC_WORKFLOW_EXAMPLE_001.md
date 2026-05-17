# Science Monkeys First Diagnostic Workflow Example 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Purpose

This document gives a tiny example of what a first diagnostic workflow could look like.

This is an example only. It does not execute anything and does not prove any claim.

## Example Topic

Suppose the topic is:

```text
Can a simple retrieval checklist reduce missed evidence in a small research workflow?
```

The objective is:

```text
Understand whether a checklist helps a Human catch missing evidence before hypothesis drafting.
```

## Explorer Example

Use Arqon Zero Explorer AI:

```text
/research name="checklist-evidence-demo" topic="retrieval checklist for small research workflows" objective="Understand whether a checklist may reduce missed evidence before hypothesis drafting"
```

The Explorer should create a research dossier. A good result should mention what is known, what is uncertain, and what evidence would be needed.

The Human reviews the research dossier before moving forward.

## Hypothesizer Example

Use Arqon Zero Hypothesizer AI:

```text
/hypothesize flow="checklist-evidence-demo" research_artifact="research_dossier artifact id or path" objective="Test whether a retrieval checklist reduces missed required evidence items in a small diagnostic workflow"
```

A good hypothesis says what should happen if the checklist helps, and what would disconfirm the idea.

The Human reviews the hypothesis before moving forward.

## Designer Example

Use Arqon Zero Designer AI:

```text
/design-experiment flow="checklist-evidence-demo" hypothesis_artifact="hypothesis_card artifact id or path" objective="Design a small controlled diagnostic test comparing evidence review with and without a checklist"
```

The Designer should define the protocol, metrics, controls, and required Executor artifacts.

The Human reviews the design before moving forward.

## Executor Example

The local Science Executor runs the approved protocol.

The Executor creates:

```text
execution_report
evidence_manifest
command_log
raw_result_index
deviation_report
```

The Human checks whether the evidence packet is complete enough for audit.

## Auditor Example

Use Arqon Zero Science Auditor AI:

```text
/audit-experiment flow="checklist-evidence-demo" evidence_packet="executor evidence artifact ids or paths" objective="Audit whether the evidence supports the bounded claim that the checklist reduced missed evidence items"
```

The Auditor should keep the claim bounded. It may say the result is weak, inconclusive, negative, or only supported within a narrow boundary.

## Human Decision Example

If the evidence is weak, the Human can stop or iterate.

If the evidence is useful but limited, the Human may ask for an inconclusive or boundary finding.

If the evidence is strong enough for a bounded diagnostic record, the Human may allow a finding record.

None of these outcomes certify, promote, deploy, or approve production readiness.
